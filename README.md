# 防災コンシェルジュ 🚨

防災について楽しく学べるチャットボット。クイズ、知識、避難所検索、防災ラボなど豊富な機能が充実しています。小学生からおじいちゃんおばあちゃんまで、どなたでも使いやすくなっています。

**「防災は『正解』がひとつではありません。学んだ知識を基に、あなたの環境・状況に合わせた対策を考えてみてください。」**

## 🌐 デモ

**本番環境:** https://bousai-chatbot.vercel.app

## 🎯 機能

### 防災クイズ
- 地震、洪水、台風、火災、火山、備蓄などのカテゴリから選択可能
- リアルタイムスコア表示
- 難易度別の問題出題

### 防災知識
- 各災害別の詳細な知識を提供
- ペット防災を含む多岐にわたるトピック
- わかりやすい解説付き

### 避難所検索
- 現在地から近い避難所を検索
- 緊急避難所と指定避難所の区別
- 施設の詳細情報と地図リンク

### 防災ラボ
- 各省庁・消防庁などからの防災情報
- 最新の防災アドバイス

## 🛠️ 技術スタック

### Frontend
- **Framework:** React 19
- **言語:** JavaScript
- **HTTP Client:** Axios
- **Security:** DOMPurify（XSS対策）
- **ID生成:** UUID v4
- **デプロイ:** Vercel

### Backend
- **Framework:** FastAPI
- **Database:** Supabase (PostgreSQL)
- **認証:** Bearer Token（API Key）
- **セキュリティ:** CSP, HSTS, Rate Limiting
- **デプロイ:** Railway

## 📋 セットアップ

### 前提条件
- Node.js 18+
- Python 3.10+
- Git

### Frontend のセットアップ

```bash
cd frontend/bousai-chatbot
npm install
npm start
```

本開発サーバー: http://localhost:3000

### Backend のセットアップ

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

開発サーバー: http://localhost:8001

### 環境変数の設定

**backend/.env**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-api-key
DEBUG_MODE=false
ALLOWED_ORIGINS=https://bousai-chatbot.vercel.app,http://localhost:3000
API_KEY=your-secure-api-key
```

## 🔒 セキュリティ機能

### 実装済み
- ✅ Content Security Policy（CSP）
- ✅ API Key 認証（Bearer Token）
- ✅ XSS 対策（DOMPurify + input validation）
- ✅ CORS 制限
- ✅ Rate Limiting（IP ベース）
- ✅ HTTPS 強制（HSTS）
- ✅ フレーム化防止（X-Frame-Options）

### 推奨設定
- .env ファイルを .gitignore に追加（実済み）
- API キーを定期的に再生成
- 本番環境では DEBUG_MODE=false

## 📊 API エンドポイント

すべてのエンドポイントは **Bearer Token** 認証が必須です。

```bash
Authorization: Bearer your-api-key
```

### クイズ取得
```
GET /api/quizzes?category=地震&difficulty=easy
```

### 防災知識取得
```
GET /api/knowledge?category=地震
```

### 避難所検索
```
POST /api/shelters/nearby
Content-Type: application/json

{
  "latitude": 35.6762,
  "longitude": 139.6503,
  "max_distance": 5,
  "limit": 10
}
```

### クイズ回答送信
```
POST /api/quiz-answer
Content-Type: application/json

{
  "session_id": "session_...",
  "quiz_id": "123",
  "user_answer": "option1",
  "category": "地震"
}
```

### 防災ラボ取得
```
GET /api/police-tips?category=地震
```

詳細は [API ドキュメント](./API.md) を参照してください。

## ⚡ パフォーマンス最適化

### キャッシング
- API レスポンスを 5 分間クライアント側でキャッシング
- 同じカテゴリの再選択時に API 呼び出しなし

### レスポンシブデザイン
- モバイル（≤767px）
- タブレット（768px-1024px）
- デスクトップ（≥1025px）

## 📝 コミット履歴

主要な修正:
- Security and quality improvements (XSS対策、セッション管理、ログレファクタリング)
- Implement API authentication (Bearer Token認証)
- Improve responsive design (タブレット対応)
- Implement client-side API response caching
- Enhance input validation for query parameters

## 🤝 貢献ガイド

バグ報告や機能要望は GitHub Issues にお願いします。

### 修正方法
1. Fork the repository
2. Feature branch を作成 (`git checkout -b feature/AmazingFeature`)
3. コミット (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Pull Request を作成

### コーディング規約
- Frontend: React best practices を遵守
- Backend: PEP 8 に従う
- コミットメッセージ: 英語、現在形を使用

## 📄 ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) ファイルを参照してください。

## 📞 サポート

問題が発生した場合:
1. [Issues](https://github.com/your-repo/issues) で同じ問題が報告されていないか確認
2. 詳細な手順とエラーメッセージを含めて Issue を作成

## 🙏 謝辞

このプロジェクトは以下の情報源をもとに作成されています:

- 内閣府（防災担当）
- 総務省消防庁
- 東京消防庁
- 気象庁
- 環境省
- 農林水産省
- 厚生労働省
- 東京都
- 警視庁
- 空飛ぶ捜索医療団"ARROWS"
- Yahoo!天気・災害

---

**最終更新:** 2026年8月5日

## 関連リンク

- [API ドキュメント](./API.md)
- [セットアップガイド](./SETUP.md)
- [セキュリティ対応](./SECURITY_FIX.md)
