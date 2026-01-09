# Pink BBS (5ch Style Anonymous Board)

ダスティピンク（#B78791）を基調とした、上質でモダンなデザインの匿名掲示板アプリケーションです。

## 🚀 技術スタック

- **フロントエンド**: Next.js (Pages Router) + TypeScript
- **データベース**: SQLite (Prisma ORM)
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide Icons
- **アニメーション**: Framer Motion
- **フォント**: Noto Serif JP / Noto Sans JP

## ✨ 主要機能

- **板（カテゴリ）一覧**: カテゴリ別に整理された掲示板リスト
- **スレッド作成**: 新しいトピックの作成
- **レス投稿**: スレッドへの返信機能（名前、メール、本文）
- **匿名性**: IPアドレスのハッシュ化によるID生成
- **デザイン**: 5chをモデルにしつつ、清潔感のあるピンクテーマを採用

## 🛠️ ローカルでの実行方法

1. **依存関係のインストール**
   ```bash
   cd 02_AI開発コール/特定サービス/5ch/bbs-app
   npm install
   ```

2. **データベースのセットアップ**
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

4. **ブラウザで確認**
   [http://localhost:3000](http://localhost:3000) にアクセスしてください。

## 📁 フォルダ構成

- `src/pages`: ページ定義（APIルート含む）
- `src/components`: UIコンポーネント
- `src/styles`: グローバルスタイル（Tailwind）
- `src/lib`: ユーティリティ（Prismaクライアント）
- `prisma`: データベーススキーマとシードデータ

