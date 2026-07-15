# 防災チャットボット - アーキテクチャと外部ツール・サービス説明

## 概要
防災チャットボットは、複数の外部ツール・サービスを組み合わせて構築されています。このドキュメントでは、各ツールの役割と専門用語を説明します。

---

## 外部ツール・サービス（専門用語版）

### 1️⃣ Supabase
- **役割**：PostgreSQL ベースの BaaS（Backend as a Service）
- **詳細**：クラウドデータベースとして、リアルタイムデータを管理。REST API でアクセス可能
- **用途**：quizzes, knowledge, shelters, bousai_lab テーブルでデータを永続化
- **テーブル一覧**：
  - quizzes：防災クイズのデータ
  - knowledge：防災知識のデータ
  - shelters：避難所情報
  - bousai_lab：防災ラボのリンク集
  - quiz_scores：クイズのスコア記録

### 2️⃣ FastAPI
- **役割**：Python の非同期ウェブフレームワーク
- **詳細**：REST API エンドポイント（`/api/quizzes`, `/api/shelters/nearby` など）を公開。Supabase との仲介
- **用途**：バックエンド サーバー（localhost:8001）として動作
- **エンドポイント例**：
  - GET `/api/quizzes`：クイズデータ取得
  - POST `/api/shelters/nearby`：近くの避難所検索（Haversine 計算）
  - GET `/api/police-tips`：防災ラボデータ取得

### 3️⃣ React
- **役割**：JavaScript ライブラリ（UI フレームワーク）
- **詳細**：コンポーネントベースの SPA（Single Page Application）。状態管理に useState, useEffect フック使用
- **用途**：フロントエンド UI（localhost:3000）の構築と動的レンダリング
- **主なコンポーネント**：ChatBot.jsx

### 4️⃣ Python
- **役割**：バックエンド言語
- **詳細**：FastAPI, Supabase, Haversine 計算など、サーバーサイドロジックを実装
- **用途**：避難所検索の距離計算（Haversine formula）、データ処理
- **ファイル**：backend/main.py

### 5️⃣ Node.js
- **役割**：JavaScript ランタイム環境
- **詳細**：React（JavaScript ベース）をブラウザ外で実行。開発サーバーを起動
- **用途**：`npm start` で React の dev サーバーを起動

### 6️⃣ npm
- **役割**：Node Package Manager
- **詳細**：package.json に基づき、依存ライブラリ（React, axios など）をインストール・管理
- **用途**：プロジェクト依存関係の解決
- **主な依存パッケージ**：
  - react：UI フレームワーク
  - axios：HTTP クライアント
  - react-scripts：ビルドツール

### 7️⃣ Git
- **役割**：分散型バージョン管理システム（VCS）
- **詳細**：コミット履歴でコード変更を追跡。ブランチ管理も可能
- **用途**：コード履歴管理、変更の差分追跡

### 8️⃣ Google Maps API
- **役割**：Directions API（ルート検索 API）
- **詳細**：ジオロケーション座標（緯度経度）を基に経路を計算し、Google Maps で表示
- **用途**：避難所への Google Maps リンク生成（`https://www.google.com/maps/dir/...`）

### 9️⃣ Geolocation API
- **役割**：W3C Geolocation API（ブラウザネイティブ API）
- **詳細**：GPS、Wi-Fi、携帯基地局から現在地の座標（latitude, longitude）を取得
- **用途**：`navigator.geolocation.getCurrentPosition()` で避難所検索の起点座標を取得

---

## アーキテクチャ図（技術用語版）

```
ブラウザ（Client）
    ↓
React（JavaScript SPA）
    ↓ axios（HTTP クライアント）
FastAPI（Python ウェブフレームワーク）
    ↓ Supabase Python SDK
Supabase（PostgreSQL BaaS + REST API）
    
+ Git（VCS）
+ npm（Package Manager）
+ Node.js（Runtime）
+ Geolocation API（W3C Browser API）
+ Google Maps API（外部 REST API）
```

---

## 起動方法

### バックエンド
```bash
cd backend
python -m uvicorn main:app --reload --port 8001
```

### フロントエンド
```bash
cd frontend/bousai-chatbot
npm start
```

---

## 今後の参考

このアーキテクチャは、他の Web アプリケーション開発でも応用できます。特に：

- **リアルタイムデータが必要な場合**：Supabase などの BaaS を検討
- **地理的情報が必要な場合**：Geolocation API + Google Maps API の組み合わせ
- **複雑な計算が必要な場合**：バックエンド（FastAPI など）で処理
- **UI の保持が必要な場合**：SessionStorage でブラウザローカルに状態を保存

---

最終更新：2026年7月10日
