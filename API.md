# 防災コンシェルジュ API ドキュメント

## 認証

すべてのエンドポイント（`/health` を除く）は Bearer Token 認証が必須です。

### リクエストヘッダー

```
Authorization: Bearer {API_KEY}
Content-Type: application/json
```

### エラーレスポンス

```json
{
  "detail": "エラーメッセージ"
}
```

**HTTP ステータスコード:**
- `401`: 無効な API キー
- `429`: レート制限（150リクエスト/分）
- `400`: 無効なリクエスト
- `500`: サーバーエラー

---

## エンドポイント

### 1. ヘルスチェック

```
GET /health
```

認証不要

**レスポンス:**
```json
{
  "status": "ok"
}
```

---

### 2. クイズ取得

```
GET /api/quizzes?category={category}&difficulty={difficulty}
```

**パラメータ:**
- `category` (string, optional): 地震 / 洪水 / 台風 / 火災 / 火山 / 備蓄 / その他
- `difficulty` (string, optional): easy / medium / hard

**レスポンス:**
```json
{
  "data": [
    {
      "id": 1,
      "category": "地震",
      "difficulty": "easy",
      "question": "地震が起きたときの正しい行動は？",
      "options": ["机の下に隠れる", "外に飛び出す", "エレベーターに乗る"],
      "correct_answer": "机の下に隠れる",
      "explanation": "地震時は机の下に隠れて落下物から身を守ります。"
    }
  ]
}
```

---

### 3. 防災知識取得

```
GET /api/knowledge?category={category}
```

**パラメータ:**
- `category` (string, optional): 地震 / 洪水 / 台風 / 火災 / 火山 / 備蓄 / ペット防災 / その他

**レスポンス:**
```json
{
  "data": [
    {
      "id": 1,
      "category": "地震",
      "title": "地震対策の基本",
      "content": "地震から身を守るために...",
      "furigana_content": "（ふりがな付きコンテンツ）"
    }
  ]
}
```

---

### 4. 避難所取得

```
GET /api/shelters
```

すべての避難所を取得します。

**レスポンス:**
```json
{
  "data": [
    {
      "id": 1,
      "施設・場所名": "〇〇小学校",
      "住所": "東京都渋谷区...",
      "緯度": 35.6762,
      "経度": 139.6503,
      "地震": true,
      "津波": false,
      "洪水": true,
      "高潮": false,
      "崖崩れ、土石流及び地滑り": false,
      "ペット対応": false
    }
  ]
}
```

---

### 5. 近くの避難所を検索

```
POST /api/shelters/nearby
Content-Type: application/json
```

**リクエストボディ:**
```json
{
  "latitude": 35.6762,
  "longitude": 139.6503,
  "max_distance": 5,
  "limit": 10
}
```

**パラメータ:**
- `latitude` (float): 緯度（-90 ～ 90）
- `longitude` (float): 経度（-180 ～ 180）
- `max_distance` (float, default: 5): 検索半径（km、0.1～50）
- `limit` (int, default: 10): 返す避難所の最大数（1～20）

**レスポンス:**
```json
{
  "data": [
    {
      "id": 1,
      "施設・場所名": "〇〇小学校",
      "住所": "東京都渋谷区...",
      "緯度": 35.6762,
      "経度": 139.6503,
      "地震": true,
      "津波": false,
      "洪水": true,
      "高潮": false,
      "崖崩れ、土石流及び地滑り": false,
      "ペット対応": false,
      "distance": 0.5,
      "shelter_type": "緊急"
    }
  ],
  "count": 1,
  "user_latitude": 35.6762,
  "user_longitude": 139.6503
}
```

**注意:**
- 緊急避難所が見つからない場合は、指定避難所を検索します
- 指定避難所の場合、災害対応情報は削除されます

---

### 6. クイズ回答を送信

```
POST /api/quiz-answer
Content-Type: application/json
```

**リクエストボディ:**
```json
{
  "session_id": "session_123e4567-e89b-12d3-a456-426614174000",
  "quiz_id": "1",
  "user_answer": "机の下に隠れる",
  "category": "地震"
}
```

**パラメータ:**
- `session_id` (string): セッション ID
- `quiz_id` (string): クイズ ID
- `user_answer` (string): ユーザーの回答
- `category` (string): カテゴリ

**レスポンス:**
```json
{
  "is_correct": true,
  "correct_answer": "机の下に隠れる",
  "score": 1,
  "message": "正解です！素晴らしい！"
}
```

---

### 7. 防災ラボ（防災Tips）取得

```
GET /api/police-tips?category={category}
```

**パラメータ:**
- `category` (string, optional): カテゴリ（オプション）

**レスポンス:**
```json
{
  "data": [
    {
      "id": 1,
      "category": "地震",
      "title": "地震速報の見方",
      "content": "地震速報では以下の情報が表示されます...",
      "url": "https://www.jma.go.jp/...",
      "order": 1
    }
  ]
}
```

---

### 8. ユーザースコア取得

```
GET /api/user-scores/{session_id}
```

**パラメータ:**
- `session_id` (string): セッション ID

**レスポンス:**
```json
{
  "session_id": "session_123e4567-e89b-12d3-a456-426614174000",
  "total_questions": 10,
  "total_correct": 8,
  "accuracy": 80.0,
  "category_stats": {
    "地震": {
      "correct": 5,
      "total": 6
    },
    "洪水": {
      "correct": 3,
      "total": 4
    }
  }
}
```

---

## レート制限

- **制限:** 150リクエスト/分 (IP ベース)
- **超過時レスポンス:**
  ```json
  {
    "detail": "リクエストが多すぎます。しばらく待ってから再度お試しください。"
  }
  ```
  ステータスコード: 429

---

## キャッシング

Frontend では以下のキャッシング戦略を使用しています：

- **キャッシュ期間:** 5 分
- **対象エンドポイント:**
  - `/api/quizzes`
  - `/api/knowledge`
  - `/api/police-tips`

同じカテゴリを 5 分以内に再度リクエストした場合、キャッシュされたデータが使用されます。

---

## エラーハンドリング

### エラーメッセージ例

**認証エラー:**
```json
{
  "detail": "無効な API キーです"
}
```
Status: 401

**バリデーションエラー:**
```json
{
  "detail": "リクエスト形式が正しくありません"
}
```
Status: 422

**カテゴリ検証エラー:**
```json
{
  "detail": "無効なカテゴリです: 不正なカテゴリ名"
}
```
Status: 400

**サーバーエラー:**
```json
{
  "detail": "エラーが発生しました"
}
```
Status: 500

---

## cURL の例

### クイズ取得

```bash
curl -X GET "https://bousai-chatbot-production.up.railway.app/api/quizzes?category=地震" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json"
```

### 避難所検索

```bash
curl -X POST "https://bousai-chatbot-production.up.railway.app/api/shelters/nearby" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 35.6762,
    "longitude": 139.6503,
    "max_distance": 5,
    "limit": 10
  }'
```

### クイズ回答送信

```bash
curl -X POST "https://bousai-chatbot-production.up.railway.app/api/quiz-answer" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session_123e4567-e89b-12d3-a456-426614174000",
    "quiz_id": "1",
    "user_answer": "机の下に隠れる",
    "category": "地震"
  }'
```

---

## セキュリティ

- **HTTPS:** すべてのエンドポイントで HTTPS が必須
- **CORS:** 許可されたオリジンのみアクセス可能
- **レート制限:** IP ベースの制限により Dos 攻撃を防止
- **CSP:** Content Security Policy により XSS を防止

---

**最終更新:** 2026年8月5日
