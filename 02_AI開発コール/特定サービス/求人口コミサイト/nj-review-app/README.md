# Night Job Review (NJ Review)

夜のお店（キャバクラ、ラウンジ、ガールズバー等）のキャスト向け求人口コミプラットフォーム。

## 🚀 特徴
- **リアルな口コミ**: 実際に働いているキャストによる時給、客層、店の雰囲気の生の声。
- **洗練されたデザイン**: ダスティピンクを基調とした、インスタ映えする上品なUI。
- **詳細な検索**: エリア、営業形態、給与条件による絞り込み。
- **キャストプロフィール**: 働いている女の子の雰囲気や年代を確認可能。

## 🛠️ 技術スタック
- **Frontend**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS, Framer Motion (アニメーション)
- **UI Components**: Radix UI (Tabs), Lucide Icons
- **Database**: SQLite, Prisma (ORM)

## 📁 ディレクトリ構成
- `src/app`: ページ構成（Home, Search, Shop Detail）
- `src/styles`: グローバルスタイルとテーマ設定
- `src/lib`: Prismaクライアント、ユーティリティ
- `prisma/schema.prisma`: データベーススキーマ定義

## 🏃 実行方法 (ローカル)

1. **依存関係のインストール**:
   ```bash
   npm install
   ```

2. **データベースのセットアップ**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **シードデータの投入**:
   ```bash
   npx ts-node prisma/seed.ts
   ```

4. **開発サーバーの起動**:
   ```bash
   npm run dev
   ```

## 🎨 デザインガイド
- **カラーパレット**: 
  - メイン: `#B78791` (Dusty Pink)
  - 背景: `#FFFFFF`, `#FFF4F0`
- **フォント**: 
  - 見出し: Noto Serif JP
  - 本文: Noto Sans JP

