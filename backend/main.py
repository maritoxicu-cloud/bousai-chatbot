from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from supabase import create_client, Client
from pydantic import BaseModel, ValidationError, Field
import os
from dotenv import load_dotenv
from typing import Optional, List
import json
import re
from math import radians, cos, sin, asin, sqrt
from collections import defaultdict
from datetime import datetime

load_dotenv()

# Supabase 設定（環境変数から読み込み）
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# CORS 許可ドメイン（環境変数から読み込み、デフォルトは本番ドメイン）
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://bousai-chatbot.vercel.app,http://localhost:3000"
).split(",")

# デバッグモード（本番環境では False）
DEBUG_MODE = os.getenv("DEBUG_MODE", "false").lower() == "true"

# 環境変数が設定されていない場合はエラー
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables must be set")

if DEBUG_MODE:
    print(f"DEBUG: SUPABASE_URL is set: {bool(SUPABASE_URL)}")
    print(f"DEBUG: SUPABASE_KEY is set: {bool(SUPABASE_KEY)}")

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
    session_id: str = Field(..., min_length=1, max_length=100)
    quiz_id: str = Field(..., min_length=1, max_length=100)
    user_answer: str = Field(..., min_length=1, max_length=500)
    category: str = Field(..., min_length=1, max_length=100)

class QuizAnswerResponse(BaseModel):
    is_correct: bool
    correct_answer: str
    score: int
    message: str

class NearbySheltersRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    max_distance: float = Field(default=5, ge=0.1, le=50)  # km（0.1～50km）
    limit: int = Field(default=10, ge=1, le=20)  # 最大20件

app = FastAPI(title="防災チャットボット API")

# セキュアヘッダーミドルウェア
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # XSS対策
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        # HSTS（HTTPS強制）
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        # CSP（コンテンツセキュリティポリシー）
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://xaqhiexouefcwphjeaao.supabase.co"
        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

# レート制限ミドルウェアを追加（全エンドポイントに適用）
app.add_middleware(RateLimitMiddleware, requests_per_minute=150)

# セキュアヘッダーミドルウェアを追加
app.add_middleware(SecurityHeadersMiddleware)

# Trusted Host ミドルウェア（ホストヘッダー検証）
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*.up.railway.app", "localhost", "127.0.0.1"])

# CORS 設定（厳格化）
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
    max_age=600,
)

# バリデーションエラーをキャッチするカスタム例外ハンドラー
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    if DEBUG_MODE:
        print(f"DEBUG: Validation Error: {exc}")
        return JSONResponse(
            status_code=422,
            content={"detail": exc.errors()}
        )
    else:
        return JSONResponse(
            status_code=422,
            content={"detail": "リクエスト形式が正しくありません"}
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

# クイズ回答を記録
@app.post("/api/quiz-answer", response_model=QuizAnswerResponse)
async def submit_quiz_answer(request: QuizAnswerRequest):
    try:
        if DEBUG_MODE:
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
        if DEBUG_MODE:
            print(f"ERROR: {str(e)}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"エラーが発生しました: {str(e)}")
        else:
            print(f"ERROR: {str(e)}")
            raise HTTPException(status_code=500, detail="エラーが発生しました")

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
        if DEBUG_MODE:
            print(f"ERROR: {str(e)}")
            return {"data": [], "error": str(e)}
        else:
            print(f"ERROR: {str(e)}")
            return {"data": []}

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
        if DEBUG_MODE:
            raise HTTPException(status_code=500, detail=f"エラーが発生しました: {str(e)}")
        else:
            raise HTTPException(status_code=500, detail="エラーが発生しました")

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
        # 緊急避難所データを取得
        response = supabase.table("shelters").select("*").execute()
        shelters = response.data

        shelters_with_distance = []

        # 緊急避難所から検索
        if shelters:
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
                    shelter_copy["shelter_type"] = "緊急"
                    shelters_with_distance.append(shelter_copy)

        # 緊急避難所が見つからない場合は指定避難所を検索
        if not shelters_with_distance:
            if DEBUG_MODE:
                print(f"DEBUG: 緊急避難所が見つかりませんでした。指定避難所を検索します。")
            # 指定避難所を全件取得（id順でページネーション、1000件制限を回避）
            shelters_designated = []
            page = 0
            while True:
                start = page * 1000
                end = start + 999
                response_designated = supabase.table("shelters_指定").select("*").order("id", desc=False).range(start, end).execute()
                page_count = len(response_designated.data) if response_designated.data else 0
                if DEBUG_MODE:
                    print(f"DEBUG: ページ {page}: id {start}～{end} から {page_count} 件取得")
                if not response_designated.data:
                    break
                shelters_designated.extend(response_designated.data)
                if len(response_designated.data) < 1000:
                    break
                page += 1

            if DEBUG_MODE:
                print(f"DEBUG: 指定避難所合計データ数: {len(shelters_designated) if shelters_designated else 0}")
                if shelters_designated and len(shelters_designated) > 0:
                    first_id = shelters_designated[0].get("id", "?")
                    last_id = shelters_designated[-1].get("id", "?")
                    print(f"DEBUG: 指定避難所の範囲: id {first_id} ～ id {last_id}")

            if shelters_designated:
                found_count = 0
                for shelter in shelters_designated:
                    distance = calculate_distance(
                        request.latitude,
                        request.longitude,
                        float(shelter["緯度"]),
                        float(shelter["経度"])
                    )

                    # max_distance 以内のみ
                    if distance <= request.max_distance:
                        found_count += 1
                        shelter_copy = shelter.copy()
                        shelter_copy["distance"] = round(distance, 2)
                        shelter_copy["shelter_type"] = "指定"
                        shelters_with_distance.append(shelter_copy)

                if DEBUG_MODE:
                    print(f"DEBUG: 指定避難所から {found_count} 件見つかりました（検索距離: {request.max_distance}km）")

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
        if DEBUG_MODE:
            print(f"ERROR: {str(e)}")
            raise HTTPException(status_code=500, detail=f"エラーが発生しました: {str(e)}")
        else:
            print(f"ERROR: {str(e)}")
            raise HTTPException(status_code=500, detail="エラーが発生しました")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)