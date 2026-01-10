 # Next.js求人口コミサイト セキュリティ & パフォーマンス改善実装計画

  ## 1. プロジェクト概要

  **対象**: `/mnt/c/Users/西田貴彦/Documents/Cursor/P_Unico/02_AI開発コール/特定サービス/求人口コミサイト/nj-review-app`

  **技術スタック**:
  - Next.js 14.1.0 (App Router)
  - TypeScript 5.3.3
  - Prisma 5.10.2 (SQLite)
  - React 18.2.0
  - Tailwind CSS 3.4.1

  **発見された問題**: 7件（Critical: 4件、High: 3件）

  ## 2. 実装戦略

  ### フェーズ分割
  Phase 1 (セキュリティ基盤) → Phase 2 (DB最適化) → Phase 3 (UI最適化) → Phase 4 (統合テスト)

  ## 3. 詳細実装ステップ

  ### Phase 1: セキュリティ基盤整備（Critical P0対応）

  #### Step 1.1: zodライブラリのインストール
  ```bash
  cd /mnt/c/Users/西田貴彦/Documents/Cursor/P_Unico/02_AI開発コール/特定サービス/求人口コミサイト/nj-review-app
  npm install zod

  Step 1.2: バリデーションスキーマの作成

  新規ファイル: src/lib/validators.ts

  import { z } from "zod";

  // 検索パラメータのバリデーションスキーマ
  export const searchParamsSchema = z.object({
    q: z.string().max(100).optional(),
    area: z.string().max(50).optional(),
    type: z.enum(["キャバクラ", "ラウンジ", "ガールズバー", "スナック"]).optional(),
    min_pay: z.coerce.number().int().min(0).max(100000).optional(),
    max_pay: z.coerce.number().int().min(0).max(100000).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  });

  export type SearchParams = z.infer<typeof searchParamsSchema>;

  // 店舗IDのバリデーション
  export const shopIdSchema = z.string().cuid();

  // URLバリデーション関数
  export function isValidImageUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") return false;
      const allowedDomains = [
        "images.unsplash.com",
        "unsplash.com",
      ];
      return allowedDomains.some(domain => parsed.hostname.includes(domain));
    } catch {
      return false;
    }
  }

  // JSON配列のパースとバリデーション
  export function parsePhotoArray(jsonString: string | null): string[] {
    if (!jsonString) {
      return ["https://images.unsplash.com/photo-1560624052-449f5ddf0c3d?q=80&w=400&h=300&fit=crop"];     
    }

    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        console.error("Photos is not an array");
        return ["https://images.unsplash.com/photo-1560624052-449f5ddf0c3d?q=80&w=400&h=300&fit=crop"];   
      }

      const validUrls = parsed.filter(url =>
        typeof url === "string" && isValidImageUrl(url)
      );

      if (validUrls.length === 0) {
        return ["https://images.unsplash.com/photo-1560624052-449f5ddf0c3d?q=80&w=400&h=300&fit=crop"];   
      }

      return validUrls;
    } catch (error) {
      console.error("Failed to parse photos JSON:", error);
      return ["https://images.unsplash.com/photo-1560624052-449f5ddf0c3d?q=80&w=400&h=300&fit=crop"];     
    }
  }

  Step 1.3: 検索ページの修正

  修正ファイル: src/app/search/page.tsx

  主要な変更点:
  - searchParamsSchema.safeParse()でバリデーション
  - エラー時は/searchへリダイレクト
  - parsePhotoArray()でXSS対策
  - ページネーション実装（skip/take）
  - 総件数取得とページネーションUI追加

  Step 1.4: ホームページの修正

  修正ファイル: src/app/page.tsx

  - parsePhotoArray()でJSON.parse置換

  Step 1.5: 店舗詳細ページの修正

  修正ファイル: src/app/shops/[id]/page.tsx

  - shopIdSchema.safeParse()でIDバリデーション
  - notFound()で適切な404レスポンス
  - parsePhotoArray()でJSON.parse置換

  Step 1.6: 404ページの作成

  新規ファイル: src/app/shops/[id]/not-found.tsx

  import Link from "next/link";
  import { ChevronRight } from "lucide-react";

  export default function NotFound() {
    return (
      <div className="container py-20 text-center space-y-6">
        <h1 className="text-4xl font-serif text-primary">404</h1>
        <p className="text-xl text-muted-foreground">店舗が見つかりませんでした</p>
        <p className="text-sm text-muted-foreground">
          お探しの店舗は削除されたか、URLが間違っている可能性があります。
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-dark transition-colors"
        >
          検索ページに戻る <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  Step 1.7: Prismaログ設定の修正

  修正ファイル: src/lib/prisma.ts

  import { PrismaClient } from '@prisma/client'

  const globalForPrisma = global as unknown as { prisma: PrismaClient }

  export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

  Phase 2: データベース最適化（Critical P0対応）

  Step 2.1: インデックスマイグレーションの作成

  修正ファイル: prisma/schema.prisma

  model Shop {
    id           String   @id @default(cuid())
    name         String
    area         String
    type         String
    hourlyPayMin Int
    hourlyPayMax Int
    backRate     Int
    description  String?
    photos       String
    rating       Float    @default(0)
    reviewCount  Int      @default(0)
    girlsCount   Int      @default(0)
    createdAt    DateTime @default(now())
    updatedAt    DateTime @updatedAt
    reviews      Review[]
    girls        Girl[]

    @@index([area])
    @@index([type])
    @@index([rating])
    @@index([hourlyPayMin])
    @@index([area, type])
    @@index([area, type, hourlyPayMin])
  }

  model Review {
    id        String   @id @default(cuid())
    rating    Int
    content   String
    userName  String
    photos    String?
    shopId    String
    shop      Shop     @relation(fields: [shopId], references: [id])
    createdAt DateTime @default(now())

    @@index([shopId])
  }

  model Girl {
    id           String   @id @default(cuid())
    name         String
    ageGroup     String
    shift        String
    introduction String
    photo        String
    rating       Float    @default(0)
    reviewCount  Int      @default(0)
    shopId       String
    shop         Shop     @relation(fields: [shopId], references: [id])

    @@index([shopId])
  }

  Step 2.2: マイグレーション実行

  npx prisma migrate dev --name add_search_indexes
  npx prisma generate

  Phase 3: UI最適化（High P1対応）

  Step 3.1: Next.js Imageの設定

  修正ファイル: next.config.js

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
  }

  module.exports = nextConfig

  Step 3.2-3.4: Image対応

  全ページで<img>を<Image>コンポーネントに置き換え:
  - src/app/page.tsx
  - src/app/search/page.tsx
  - src/app/shops/[id]/page.tsx

  import Image from 'next/image';

  <div className="relative aspect-[4/3] overflow-hidden">
    <Image
      src={photos[0]}
      alt={shop.name}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  </div>

  Phase 4: 統合テストと検証

  確認項目:

  バリデーション
  - /search?min_pay=abc → /searchにリダイレクト
  - /shops/invalid-id → 404ページ表示

  ページネーション
  - ページ移動が正常に動作

  画像表示
  - 全ページで画像が正常表示
  - Next.js Imageの最適化が働いている

  パフォーマンス
  - 複合フィルターの高速化
  - インデックスが使用されている

  4. 修正ファイル一覧

  新規作成（3ファイル）

  1. src/lib/validators.ts
  2. src/app/shops/[id]/not-found.tsx
  3. prisma/migrations/[timestamp]_add_search_indexes/

  修正（6ファイル）

  1. src/app/page.tsx
  2. src/app/search/page.tsx
  3. src/app/shops/[id]/page.tsx
  4. src/lib/prisma.ts
  5. prisma/schema.prisma
  6. next.config.js

  依存関係

  - package.json (npm install zodで自動更新)

  5. データベースマイグレーション

  # マイグレーション作成
  npx prisma migrate dev --name add_search_indexes

  # 本番環境適用
  npx prisma migrate deploy

  6. 検証方法

  セキュリティ検証

  # バリデーションテスト
  curl "http://localhost:3000/search?min_pay=abc"  # → /searchへリダイレクト
  curl "http://localhost:3000/shops/invalid-id"    # → 404

  # ログ確認
  NODE_ENV=production npm start  # クエリログが出ないこと

  パフォーマンス検証

  -- インデックス使用確認
  EXPLAIN QUERY PLAN SELECT * FROM Shop WHERE area = '銀座' AND type = 'キャバクラ';

  画像最適化検証

  - DevTools Network → WebP形式
  - /_next/image?url=... のURL

  7. リスク対策

  Critical リスク

  - DBマイグレーション失敗: バックアップ必須
  cp prisma/dev.db prisma/dev.db.backup.$(date +%Y%m%d)

  注意点

  - 各Phase完了後に動作確認
  - 既存機能を壊さない
  - 型エラーがないこと確認

  8. 成功基準

  - 全Critical/High問題解決
  - 不正入力がバリデーションで弾かれる
  - XSS攻撃が防止されている
  - 検索でインデックスが使用される
  - 画像がNext.js Imageで最適化
  - ビルドエラーなし

  9. 推定時間

  約5.5時間

  10. 重要ファイル

  - src/lib/validators.ts - バリデーション中核
  - src/app/search/page.tsx - 最多脆弱性
  - prisma/schema.prisma - パフォーマンス改善
  - src/app/shops/[id]/page.tsx - 404処理パターン
  - next.config.js - Image設定

  ---