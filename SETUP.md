# セットアップガイド

このガイドに従って、防災コンシェルジュを開発環境または本番環境で実行できます。

## 📋 前提条件

- **Node.js:** 18.0.0 以上
- **Python:** 3.10 以上
- **Git:** 最新版
- **npm** または **yarn**

### インストール確認

```bash
node --version    # v18.0.0以上
python --version  # Python 3.10以上
git --version     # git version 2.0以上
npm --version     # 9.0.0以上
```

---

## 🚀 クイックスタート（開発環境）

### 1. リポジトリをクローン

```bash
git clone https://github.com/your-repo/bousai-chatbot.git
cd bousai-chatbot
```

### 2. Backend のセットアップ

```bash
cd backend

# 仮想環境を作成
python -m venv venv

# 仮想環境を有効化
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 依存関係をインストール
pip install -r requirements.txt

# 環境変数ファイルを作成
cp .env.example .env
# .env を編集してSupabase情報を追加
```

**backend/.env の設定例:**
```env
SUPABASE_URL=https://xaqhiexouefcwphjeaao.supabase.co
SUPABASE_KEY=your-new-supabase-key
DEBUG_MODE=false
ALLOWED_ORIGINS=https://bousai-chatbot.vercel.app,http://localhost:3000
API_KEY=your-secure-api-key
```

### 3. Frontend のセットアップ

別のターミナルウィンドウで:

```bash
cd frontend/bousai-chatbot

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm start
```

### 4. サーバーの起動

Backend サーバー（backend ディレクトリで）:
```bash
uvicorn main:app --reload --port 8001
```

サーバーが起動すると:
- Backend: http://localhost:8001
- Frontend: http://localhost:3000
- API Docs: http://localhost:8001/docs

---

## 🔧 環境変数の設定

### Backend (.env)

**必須:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

**オプション:**
```env
DEBUG_MODE=false                                                    # 本番環境では必ず false
ALLOWED_ORIGINS=https://bousai-chatbot.vercel.app,http://localhost:3000
API_KEY=bousai-api-key-prod-2024
```

### Frontend

Frontend は環境変数をハードコードで保持しています（`.env` ファイル不要）:
```javascript
const API_BASE_URL = 'https://bousai-chatbot-production.up.railway.app';
const API_KEY = 'bousai-api-key-prod-2024';
```

デモ環境では http://localhost:8001 を使用:
```javascript
const API_BASE_URL = 'http://localhost:8001';
```

---

## 📱 ブラウザでテスト

1. http://localhost:3000 にアクセス
2. スプラッシュスクリーンが表示されたら5秒待機
3. 各機能をテスト:
   - ✅ **防災クイズ** - 「クイズ」と入力
   - ✅ **防災知識** - 「知識」と入力
   - ✅ **避難所検索** - 「避難」と入力
   - ✅ **防災ラボ** - 「便利技」と入力

---

## 🌐 本番環境へのデプロイ

### Frontend（Vercel）

1. **GitHub にプッシュ:**
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

2. **Vercel ダッシュボード:**
   - https://vercel.com/dashboard にアクセス
   - プロジェクトを選択
   - 自動デプロイが開始

3. **環境変数設定:**
   - Settings → Environment Variables
   - 本番用の変数を設定（不要、ハードコード）

### Backend（Railway）

1. **Railway CLI をインストール:**
```bash
npm install -g @railway/cli
# または
railway login
```

2. **Railway にデプロイ:**
```bash
cd backend
railway up
```

3. **環境変数設定（Railway ダッシュボード）:**
   - Variables を選択
   - 以下を追加:
     ```
     SUPABASE_URL=https://...
     SUPABASE_KEY=your-key
     DEBUG_MODE=false
     ALLOWED_ORIGINS=https://bousai-chatbot.vercel.app
     API_KEY=your-api-key
     ```

---

## 🔐 セキュリティ手順

### デプロイ前の確認

- [ ] `.env` が `.gitignore` に含まれている
- [ ] DEBUG_MODE が false に設定されている
- [ ] API キーが強固な文字列である
- [ ] Supabase キーが正しくローテーションされている
- [ ] CORS 設定が適切である

### 本番環境での推奨設定

```env
DEBUG_MODE=false
ALLOWED_ORIGINS=https://bousai-chatbot.vercel.app
API_KEY=strongly-random-api-key-here
```

---

## 🧪 テスト

### API テスト

```bash
# ヘルスチェック
curl http://localhost:8001/health

# クイズ取得（認証なし - テスト用）
curl -X GET "http://localhost:8001/api/quizzes?category=地震" \
  -H "Authorization: Bearer bousai-api-key-prod-2024"

# 避難所検索
curl -X POST "http://localhost:8001/api/shelters/nearby" \
  -H "Authorization: Bearer bousai-api-key-prod-2024" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 35.6762, "longitude": 139.6503}'
```

### Frontend テスト

```bash
# テストを実行（テスト実装時）
npm test

# ビルドをテスト
npm run build
npx serve -s build
```

---

## 🆘 トラブルシューティング

### Backend が起動しない

**エラー:** `ModuleNotFoundError: No module named 'fastapi'`

**解決:**
```bash
# 仮想環境を有効化
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# 依存関係をインストール
pip install -r requirements.txt
```

### Frontend がビルドできない

**エラー:** `npm ERR! code ENOENT`

**解決:**
```bash
# キャッシュをクリア
npm cache clean --force

# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### API が接続できない

**エラー:** `Network Error`

**確認項目:**
- Backend が http://localhost:8001 で起動しているか
- API キーが正しいか
- CORS 設定が許可しているか
- ファイアウォールがブロックしていないか

### Supabase キーが無効

**エラー:** `{"detail": "無効な API キー"}`

**解決:**
1. Supabase ダッシュボードにアクセス
2. Settings → API を確認
3. Service Role キーを再生成
4. `.env` を更新
5. Backend を再起動

---

## 📦 依存関係の更新

### Frontend

```bash
cd frontend/bousai-chatbot

# 最新版をチェック
npm outdated

# 依存関係をアップデート
npm update

# 特定のパッケージをアップデート
npm install package-name@latest
```

### Backend

```bash
cd backend

# 仮想環境を有効化
source venv/bin/activate

# 最新版をチェック
pip list --outdated

# 依存関係をアップデート
pip install --upgrade package-name
```

---

## 📚 参考資料

- [FastAPI ドキュメント](https://fastapi.tiangolo.com/)
- [React ドキュメント](https://react.dev)
- [Supabase ドキュメント](https://supabase.com/docs)
- [Vercel デプロイガイド](https://vercel.com/docs)
- [Railway デプロイガイド](https://docs.railway.app)

---

## 🐛 デバッグモード

開発時に詳細なエラーメッセージを表示するには:

**backend/.env:**
```env
DEBUG_MODE=true
```

デバッグモードでは:
- ✅ エラーの詳細情報が表示されます
- ✅ API の詳細ログが出力されます
- ❌ **本番環境では使用しないでください**

---

**最終更新:** 2026年8月5日
