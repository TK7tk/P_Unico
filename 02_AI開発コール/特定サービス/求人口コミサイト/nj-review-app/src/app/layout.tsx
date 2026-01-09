import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";

const sans = Noto_Sans_JP({ 
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

const serif = Noto_Serif_JP({ 
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  title: "Night Job Review - 夜のお店求人口コミサイト",
  description: "女の子が安心してお店を選べるリアルな口コミプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={cn(
        "min-h-screen bg-background font-sans text-foreground",
        sans.variable,
        serif.variable
      )}>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <h1 className="text-xl font-serif text-primary">Night Job Review</h1>
            <nav className="flex items-center gap-4">
              <button className="text-sm font-medium text-muted-foreground hover:text-primary">ログイン</button>
              <button className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary-dark transition-colors">
                会員登録
              </button>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t bg-muted py-8">
          <div className="container text-center text-sm text-muted-foreground">
            &copy; 2026 Night Job Review. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}

