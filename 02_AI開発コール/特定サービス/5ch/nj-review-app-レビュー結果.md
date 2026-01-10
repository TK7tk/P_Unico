# 求人口コミサイト Next.jsアプリケーション - 包括的コードレビュー

  ## 概要

  このNext.js 14のApp Routerベースの求人口コミサイトは、夜のお店に特化したレビュープラットフォームです。Prisma ORM、TypeScript、Tailwind CSSを使用しており、全体的にモダンな技術スタックで構成されています。UIは洗練されており、基本的な機能実装は完了していますが、**セキュリティ、パフォーマンス、エラーハンドリング、データバリデーションの観点で重大な改善点**が多数見つかりました。

  ## 強み

  - **モダンなスタック**: Next.js 14のApp Router、Server Components、TypeScriptの適切な採用
  - **優れたUI/UX設計**: Tailwind CSS + Framer Motionによる洗練されたデザインと滑らかなアニメーション     
  - **コンポーネント分離**: Server ComponentsとClient Componentsの適切な使い分け
  - **一貫したデザインシステム**: カスタムフォント（Noto Sans/Serif JP）と統一されたスタイリング

  ---

  ## 問題点と改善提案

  ### **[重大度: Critical] - セキュリティ - SQLインジェクション脆弱性**

  **問題点**: `src/app/search/page.tsx` (14-29行目) において、ユーザー入力（`searchParams`）がバリデーションなしでPrismaクエリに直接使用されています。

  **影響**:
  - Prismaはパラメータ化されたクエリを使用するためSQLインジェクションのリスクは低減されていますが、入力値 の検証がないため、不正な値（極端に大きな数値、負の値など）によるロジックエラーやDoS攻撃のリスクがあります 
  - XSS攻撃のリスク（特に`searchParams.q`が後で表示される場合）

  **改善提案**:

  ```typescript
  // search/page.tsx の改善例
  import { z } from 'zod'; // zodをインストール: npm install zod

  // バリデーションスキーマの定義
  const searchSchema = z.object({
    q: z.string().max(100).optional(),
    area: z.string().max(50).optional(),
    type: z.enum(['キャバクラ', 'ラウンジ', 'ガールズバー', 'スナック']).optional(),
    min_pay: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : undefined),      
    max_pay: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : undefined),      
  });

  export default async function SearchPage({ searchParams }: { searchParams: { ... } }) {
    // バリデーション実行
    const validationResult = searchSchema.safeParse(searchParams);

    if (!validationResult.success) {
      // エラーハンドリング（不正なパラメータを無視またはエラー表示）
      return <div>不正な検索パラメータです</div>;
    }

    const { q, area, type, min_pay, max_pay } = validationResult.data;

    // さらに範囲チェック
    if (min_pay && (min_pay < 0 || min_pay > 100000)) {
      return <div>給与範囲が不正です</div>;
    }

    // ... Prismaクエリ実行
  }

  ---
  [重大度: Critical] - セキュリティ - XSS脆弱性

  問題点: src/app/page.tsx (59行目) と src/app/shops/[id]/page.tsx (19行目) において、JSON.parse(shop.photos) の結果が直接imgタグのsrcに使用されています。

  影響:
  - データベースに悪意のあるJavaScriptコードを含むURLが格納された場合、XSS攻撃が可能
  - onerror イベントなどを利用した攻撃のリスク

  改善提案:

  // lib/validators.ts (新規作成)
  import { z } from 'zod';

  const urlSchema = z.string().url().refine(
    (url) => url.startsWith('https://') || url.startsWith('http://'),
    { message: "有効なURLではありません" }
  );

  export function parseAndValidatePhotos(photosJson: string | null): string[] {
    if (!photosJson) {
      return ["https://images.unsplash.com/photo-1560624052-449f5ddf0c3d?q=80&w=400&h=300&fit=crop"];     
    }

    try {
      const parsed = JSON.parse(photosJson);
      if (!Array.isArray(parsed)) return [];

      // 各URLをバリデーション
      return parsed.filter(url => {
        const result = urlSchema.safeParse(url);
        return result.success;
      });
    } catch {
      return ["https://images.unsplash.com/photo-1560624052-449f5ddf0c3d?q=80&w=400&h=300&fit=crop"];     
    }
  }

  // page.tsx での使用
  import { parseAndValidatePhotos } from '@/lib/validators';

  const photos = parseAndValidatePhotos(shop.photos);

  ---
  [重大度: High] - パフォーマンス - N+1クエリ問題

  問題点: src/app/search/page.tsx (14-29行目) で、shopsを取得した後、各shopに対してJSONパースが実行されて います。大量のデータでパフォーマンス問題が発生します。

  影響:
  - 検索結果が多い場合、レスポンスが遅延
  - サーバーリソースの無駄な消費

  改善提案:

  // search/page.tsx の改善
  export default async function SearchPage({ searchParams }: { ... }) {
    // ページネーション追加
    const page = parseInt(searchParams.page || '1');
    const perPage = 20;
    const skip = (page - 1) * perPage;

    const [shops, totalCount] = await Promise.all([
      prisma.shop.findMany({
        where: { ... },
        take: perPage,
        skip: skip,
        orderBy: { rating: 'desc' }, // ソート追加
      }),
      prisma.shop.count({ where: { ... } }), // 総件数取得
    ]);

    // 事前に全ての写真をパース（エラーハンドリング付き）
    const shopsWithPhotos = shops.map(shop => ({
      ...shop,
      parsedPhotos: parseAndValidatePhotos(shop.photos),
    }));

    // ... レンダリング
  }

  ---
  [重大度: High] - エラーハンドリング - 404ページの不足

  問題点: src/app/shops/[id]/page.tsx (15-17行目) で、店舗が見つからない場合の処理が不十分です。

  影響:
  - ユーザーエクスペリエンスの低下
  - SEOへの悪影響（適切な404ステータスコードが返されない）

  改善提案:

  // shops/[id]/page.tsx
  import { notFound } from 'next/navigation';

  export default async function ShopDetail({ params }: { params: { id: string } }) {
    // IDのバリデーション
    if (!params.id || typeof params.id !== 'string') {
      notFound();
    }

    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        girls: {
          take: 20,
        },
      }
    });

    if (!shop) {
      notFound(); // Next.js の notFound() を使用（404ステータスを返す）
    }

    // ... 通常のレンダリング
  }

  // shops/[id]/not-found.tsx (新規作成)
  export default function NotFound() {
    return (
      <div className="container py-20 text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p>店舗が見つかりませんでした</p>
        <Link href="/search" className="text-primary underline">
          検索ページに戻る
        </Link>
      </div>
    );
  }

  ---
  [重大度: High] - セキュリティ - Prismaログ設定の問題

  問題点: src/lib/prisma.ts (8行目) で、log: ['query'] が設定されており、本番環境でもクエリログが出力され ます。

  影響:
  - 本番環境でセンシティブなデータがログに記録される可能性
  - パフォーマンスへの影響

  改善提案:

  // lib/prisma.ts の改善
  import { PrismaClient } from '@prisma/client'

  const globalForPrisma = global as unknown as { prisma: PrismaClient }

  export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'], // 本番環境ではerrorのみ
    })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

  ---
  [重大度: High] - データベース設計 - インデックスの欠如

  問題点: prisma/schema.prisma で、頻繁に検索されるカラム（area, type, ratingなど）にインデックスが設定さ れていません。

  影響:
  - 検索クエリのパフォーマンス低下
  - データ量増加に伴うスケーラビリティ問題

  改善提案:

  // schema.prisma の改善
  model Shop {
    id           String   @id @default(cuid())
    name         String
    area         String
    type         String
    hourlyPayMin Int
    hourlyPayMax Int
    backRate     Int
    description  String?
    photos       String   // JSON array
    rating       Float    @default(0)
    reviewCount  Int      @default(0)
    girlsCount   Int      @default(0)
    createdAt    DateTime @default(now())
    updatedAt    DateTime @updatedAt
    reviews      Review[]
    girls        Girl[]

    @@index([area])           // エリアでの検索を高速化
    @@index([type])           // タイプでの検索を高速化
    @@index([rating])         // 評価順ソートを高速化
    @@index([hourlyPayMin])   // 時給フィルタリングを高速化
    @@index([area, type])     // 複合検索を高速化
  }

  model Review {
    id        String   @id @default(cuid())
    rating    Int
    content   String   @db.Text  // Textタイプに変更（長文対応）
    userName  String
    photos    String?  // JSON array
    shopId    String
    shop      Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade) // カスケード削除 追加
    createdAt DateTime @default(now())

    @@index([shopId])         // 店舗ごとのレビュー取得を高速化
    @@index([createdAt])      // 日付順ソートを高速化
  }

  model Girl {
    id           String   @id @default(cuid())
    name         String
    ageGroup     String
    shift        String
    introduction String   @db.Text  // Textタイプに変更
    photo        String
    rating       Float    @default(0)
    reviewCount  Int      @default(0)
    shopId       String
    shop         Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)

    @@index([shopId])
  }

  ---
  [重大度: Medium] - パフォーマンス - Next.js Image最適化未使用

  問題点: 全てのファイルで<img>タグが使用されており、Next.jsの<Image>コンポーネントが使用されていません。 

  影響:
  - 自動的な画像最適化が行われない
  - 遅延ロードが適用されない
  - ページロード時間の増加

  改善提案:

  // page.tsx の改善
  import Image from 'next/image';

  <div className="relative aspect-[4/3] overflow-hidden">
    <Image
      src={photos[0]}
      alt={shop.name}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover group-hover:scale-110 transition-transform duration-500"
      priority={false} // 上位3件のみpriorityをtrueに
    />
    {/* ... */}
  </div>

  // next.config.js の設定が必要
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
        // 他の画像ホストもここに追加
      ],
    },
  };

  module.exports = nextConfig;

  ---
  優先度付きアクションアイテム

  即座に対応すべき項目（P0 - Critical）:

  1. ユーザー入力のバリデーション実装（zod導入）
  2. JSON.parseのエラーハンドリングと型定義
  3. Prismaログ設定の本番環境対応
  4. データベースインデックスの追加

  早急に対応すべき項目（P1 - High）:

  5. Next.js Image コンポーネントへの移行
  6. 404エラーページの実装
  7. ページネーションの実装

  ---
  総評

  このプロジェクトは優れたUI/UXとモダンなアーキテクチャを持っていますが、本番環境へのデプロイ前に必ずセキ ュリティとパフォーマンスの問題に対処する必要があります。特に以下の点は必須です。

  1. 入力バリデーション: 全てのユーザー入力を検証
  2. エラーハンドリング: 予期しない状況への対応
  3. データベース最適化: インデックス追加とクエリ最適化
  4. 型安全性: TypeScriptの恩恵を最大限活用

  これらの改善を実施することで、セキュアで高パフォーマンス、かつ保守性の高いアプリケーションになります。  
