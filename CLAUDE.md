# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

P_Unicoは、AI開発のナレッジベースおよび複数のWebアプリケーション開発プロジェクトを含むリポジトリです。

## リポジトリ構成

```
P_Unico/
├── p-unico-app/           # メインアプリ（Next.js 14 ぷよぷよゲーム）
├── 01_基礎情報/           # 参考URL・情報URL
├── 02_AI開発コール/       # AI開発手法・仕様書
│   └── 特定サービス/      # 各サービスプロジェクト（5ch, 適職診断等）
├── 03_プロンプト/         # プロンプトエンジニアリングテンプレート
├── 100_メモ/              # 作業メモ
├── 101_ナレッジ/          # 技術ナレッジベース
└── トレーニング/          # Obsidianトレーニング用
```

## 開発コマンド

### p-unico-app（メインアプリ）

```bash
cd p-unico-app

npm run dev      # 開発サーバー起動 (http://localhost:3000)
npm run build    # 本番ビルド
npm run start    # 本番サーバー起動
npm run lint     # ESLint実行
```

### 自動Git同期

```bash
./auto-git-push.sh   # 変更があれば自動コミット&プッシュ
```

## 技術スタック（メインアプリ）

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript (strict mode)
- **スタイリング**: Tailwind CSS
- **パスエイリアス**: `@/*` → プロジェクトルート

## 開発方針

### 基本原則（`02_AI開発コール/00_サマリ.md`より）

- 1度の作成で実際に使えるものを作る（何度もやり取りしない）
- まず作る → 即利用 → 確認 → 修正のループ
- ワークフロー&フォルダ設計を重視

### 推奨技術構成（ローカル開発）

- フロントエンド: Next.js (Pages Router) + TypeScript
- データベース: SQLite
- スタイリング: Tailwind CSS + shadcn/ui + Radix
- アイコン: Lucide Icons
- アニメーション: Framer-motion

### 本番向け追加構成

- 認証: Clerk
- DB: Supabase
- 決済: Stripe

## 特定サービスプロジェクト

`02_AI開発コール/特定サービス/`配下に各プロジェクトの仕様書・実装があります：

- **5ch**: 掲示板アプリ（Next.js + Prisma + SQLite）
- **適職診断**: キャリア診断サービス
- **求人口コミサイト**: レビューサイト
- **AI-CFO**: 財務AI

## プロンプトテンプレート

`03_プロンプト/`に各種プロンプト技法のテンプレートがあります：
- Chain of Thought、Few-Shot Learning、XML構造化、JSON形式等
