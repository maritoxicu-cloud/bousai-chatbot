from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from supabase import create_client, Client
from pydantic import BaseModel, ValidationError
import os
from dotenv import load_dotenv
from typing import Optional, List
import json
from math import radians, cos, sin, asin, sqrt
from collections import defaultdict
from datetime import datetime

load_dotenv()

# Supabase 設定（環境変数から読み込み）
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# デバッグ用ログ
print(f"DEBUG: SUPABASE_URL is set: {bool(SUPABASE_URL)}")
print(f"DEBUG: SUPABASE_KEY is set: {bool(SUPABASE_KEY)}")

# 環境変数が設定されていない場合はエラー
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables must be set")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# レート制限用ミドルウェア
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 100):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.request_history = defaultdict(list)  # IP -> [timestamps]

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = datetime.now()

        # 1分以上古いリクエストを削除
        self.request_history[client_ip] = [
            ts for ts in self.request_history[client_ip]
            if (now - ts).total_seconds() < 60
        ]

        # リクエスト数が制限を超えているかチェック
        if len(self.request_history[client_ip]) >= self.requests_per_minute:
            return JSONResponse(
                status_code=429,
                content={"detail": "リクエストが多すぎます。しばらく待ってから再度お試しください。"}
            )

        # リクエストを記録
        self.request_history[client_ip].append(now)

        response = await call_next(request)
        return response

# リクエスト/レスポンスモデル
class QuizAnswerRequest(BaseModel):
    session_id: str
    quiz_id: str
    user_answer: str
    category: str

class QuizAnswerResponse(BaseModel):
    is_correct: bool
    correct_answer: str
    score: int
    message: str

class NearbySheltersRequest(BaseModel):
    latitude: float
    longitude: float
    max_distance: float = 5  # km（デフォルト5km）
    limit: int = 10  # 最大10件

app = FastAPI(title="防災チャットボット API")

# レート制限ミドルウェアを追加（全エンドポイントに適用）
app.add_middleware(RateLimitMiddleware, requests_per_minute=150)

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# バリデーションエラーをキャッチするカスタム例外ハンドラー
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    print(f"DEBUG: Validation Error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

# ヘルスチェック
@app.get("/health")
async def health():
    return {"status": "ok"}

# 防災知識取得
@app.get("/api/knowledge")
async def get_knowledge(category: str = None):
    query = supabase.table("knowledge").select("*")
    if category:
        query = query.eq("category", category)
    data = query.execute()
    return {"data": data.data}

# クイズ取得
@app.get("/api/quizzes")
async def get_quizzes(category: str = None, difficulty: str = None):
    query = supabase.table("quizzes").select("*")
    if category:
        query = query.eq("category", category)
    if difficulty:
        query = query.eq("difficulty", difficulty)
    data = query.execute()
    return {"data": data.data}

# 避難所取得
@app.get("/api/shelters")
async def get_shelters(latitude: float = None, longitude: float = None):
    query = supabase.table("shelters").select("*")
    data = query.execute()
    return {"data": data.data}

# クイズ回答を記録（デバッグ用）
@app.post("/api/quiz-answer-debug")
async def submit_quiz_answer_debug(request: Request):
    try:
        body = await request.json()
        print(f"DEBUG: Raw request body: {body}")
        return {"received": body}
    except Exception as e:
        print(f"DEBUG: Error reading body: {e}")
        return {"error": str(e)}

# クイズ回答を記録
@app.post("/api/quiz-answer", response_model=QuizAnswerResponse)
async def submit_quiz_answer(request: QuizAnswerRequest):
    try:
        print(f"DEBUG: Received validated request: {request.dict()}")
        # クイズ情報を取得
        quiz_data = supabase.table("quizzes").select("*").eq("id", request.quiz_id).execute()

        if not quiz_data.data:
            raise HTTPException(status_code=404, detail="クイズが見つかりません")

        quiz = quiz_data.data[0]
        correct_answer_raw = quiz.get("correct_answer", "")
        # correct_answer を文字列に変換（整数の場合は選択肢に変換）
        if isinstance(correct_answer_raw, int):
            # 選択肢インデックスの場合、対応する選択肢を取得
            correct_answer = quiz["options"][correct_answer_raw] if correct_answer_raw < len(quiz.get("options", [])) else str(correct_answer_raw)
        else:
            correct_answer = str(correct_answer_raw)

        # 回答判定
        is_correct = request.user_answer == correct_answer
        score = 1 if is_correct else 0

        # スコア記録を保存
        score_record = {
            "session_id": request.session_id,
            "quiz_id": request.quiz_id,
            "user_answer": request.user_answer,
            "correct_answer": correct_answer,
            "is_correct": is_correct,
            "category": request.category,
            "score": score
        }

        supabase.table("quiz_scores").insert(score_record).execute()

        # レスポンス
        message = "正解です！素晴らしい！" if is_correct else f"不正解です。正解は「{correct_answer}」です。"

        return QuizAnswerResponse(
            is_correct=is_correct,
            correct_answer=correct_answer,
            score=score,
            message=message
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        print(f"TRACEBACK: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"エラーが発生しました: {str(e)}")

# 防災ラボ取得
@app.get("/api/police-tips")
async def get_bousai_lab(category: str = None):
    try:
        query = supabase.table("bousai_lab").select("*")
        if category:
            query = query.eq("category", category)
        query = query.order("order", desc=False)
        data = query.execute()
        return {"data": data.data}
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return {"data": [], "error": str(e)}

# ユーザースコア取得
@app.get("/api/user-scores/{session_id}")
async def get_user_scores(session_id: str):
    try:
        scores = supabase.table("quiz_scores").select("*").eq("session_id", session_id).execute()

        # カテゴリ別スコア集計
        category_stats = {}
        total_correct = 0
        total_questions = len(scores.data)

        for score_record in scores.data:
            category = score_record.get("category", "")
            is_correct = score_record.get("is_correct", False)

            if category not in category_stats:
                category_stats[category] = {"correct": 0, "total": 0}

            category_stats[category]["total"] += 1
            if is_correct:
                category_stats[category]["correct"] += 1
                total_correct += 1

        return {
            "session_id": session_id,
            "total_questions": total_questions,
            "total_correct": total_correct,
            "accuracy": round((total_correct / total_questions * 100), 1) if total_questions > 0 else 0,
            "category_stats": category_stats
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"エラーが発生しました: {str(e)}")

# 距離計算（Haversine formula）
def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    2点間の距離を計算（単位：km）
    """
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # 地球の半径（km）
    return c * r

# 近くの避難所を検索
@app.post("/api/shelters/nearby")
async def get_nearby_shelters(request: NearbySheltersRequest):
    try:
        # 全避難所データを取得
        response = supabase.table("shelters").select("*").execute()
        shelters = response.data

        if not shelters:
            return {"data": []}

        # 距離を計算して、リストに追加
        shelters_with_distance = []
        for shelter in shelters:
            distance = calculate_distance(
                request.latitude,
                request.longitude,
                float(shelter["緯度"]),
                float(shelter["経度"])
            )

            # max_distance 以内のみ
            if distance <= request.max_distance:
                shelter_copy = shelter.copy()
                shelter_copy["distance"] = round(distance, 2)
                shelters_with_distance.append(shelter_copy)

        # 距離でソート（近い順）
        shelters_with_distance.sort(key=lambda x: x["distance"])

        # limit で制限
        result = shelters_with_distance[:request.limit]

        return {
            "data": result,
            "count": len(result),
            "user_latitude": request.latitude,
            "user_longitude": request.longitude
        }

    except Exception as e:
        print(f"ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"エラーが発生しました: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)