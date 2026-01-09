import { prisma } from "@/lib/prisma";
import { Star, MapPin, Building2, Clock, Phone, Globe, Coins, Users, Smile, ChevronRight } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";

export default async function ShopDetail({ params }: { params: { id: string } }) {
  const shop = await prisma.shop.findUnique({
    where: { id: params.id },
    include: {
      reviews: true,
      girls: true,
    }
  });

  if (!shop) {
    return <div className="container py-20 text-center">店舗が見つかりませんでした</div>;
  }

  const photos = shop.photos ? JSON.parse(shop.photos) : ["https://images.unsplash.com/photo-1560624052-449f5ddf0c3d?q=80&w=800&h=600&fit=crop"];

  return (
    <div className="bg-[#FFF4F0] min-h-screen pb-20">
      <div className="container py-8 space-y-10">
        {/* Header */}
        <div className="space-y-6">
          <Link href="/search" className="inline-flex items-center text-sm font-bold text-primary hover:underline gap-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> 検索結果に戻る
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-primary font-bold">
                <span className="bg-primary/10 px-3 py-1 rounded-full">{shop.area}</span>
                <span className="bg-primary/10 px-3 py-1 rounded-full">{shop.type}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif">{shop.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-xl font-bold text-foreground">{shop.rating}</span>
                </div>
                <span className="text-muted-foreground underline text-sm">{shop.reviewCount}件の口コミ</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 md:flex-none bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95">
                応募する
              </button>
              <button className="flex-1 md:flex-none border border-primary/20 bg-white hover:bg-muted px-8 py-3 rounded-full font-bold text-primary transition-colors">
                保存する
              </button>
            </div>
          </div>

          {/* Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px] md:h-[400px]">
            <div className="rounded-3xl overflow-hidden shadow-md">
              <img src={photos[0]} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="hidden md:grid grid-rows-2 gap-4">
              <div className="rounded-3xl overflow-hidden shadow-md">
                <img src={photos[1] || photos[0]} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="rounded-3xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-dashed border-primary/30">
                + すべての写真を見る
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="relative z-10">
          <Tabs.Root defaultValue="basic" className="bg-white rounded-[40px] shadow-2xl border border-primary/10 overflow-hidden mb-12">
            <Tabs.List className="flex border-b bg-white overflow-x-auto whitespace-nowrap scrollbar-hide">
              {[
                { id: "basic", label: "基本情報" },
                { id: "salary", label: "給与情報" },
                { id: "reviews", label: `口コミ (${shop.reviews.length})` },
                { id: "girls", label: "働いている女の子" },
              ].map((tab) => (
                <Tabs.Trigger
                  key={tab.id}
                  value={tab.id}
                  className="px-8 py-5 text-sm font-bold text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-primary/5 data-[state=active]:border-b-4 data-[state=active]:border-primary transition-all"
                >
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Tabs.Content value="basic" className="p-8 md:p-12 space-y-12 bg-white">
            <section className="space-y-8">
              <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                <Building2 className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-serif">店舗概要</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {[
                  { label: "営業時間", value: shop.type === "ガールズバー" ? "19:00 〜 翌5:00" : "20:00 〜 翌1:00", icon: <Clock className="w-4 h-4" /> },
                  { label: "定休日", value: shop.type === "ガールズバー" ? "年中無休" : "日曜日・祝日", icon: <Smile className="w-4 h-4" /> },
                  { label: "住所", value: `東京都${shop.area === "銀座" ? "中央区銀座" : shop.area === "渋谷" ? "渋谷区道玄坂" : "港区六本木"} 1-2-3 NJビル`, icon: <MapPin className="w-4 h-4" /> },
                  { label: "電話番号", value: "03-xxxx-xxxx", icon: <Phone className="w-4 h-4" /> },
                  { label: "客層", value: shop.area === "銀座" ? "30代〜50代 経営者中心" : "20代〜40代 幅広い層", icon: <Users className="w-4 h-4" /> },
                  { label: "店の雰囲気", value: shop.area === "銀座" ? "高級感・モダン" : "アットホーム・賑やか", icon: <Building2 className="w-4 h-4" /> },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-muted py-4 group hover:bg-muted/5 transition-colors px-2">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="font-bold text-sm text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </Tabs.Content>

          <Tabs.Content value="salary" className="p-8 md:p-12 space-y-12 bg-white">
            <section className="space-y-6">
              <h3 className="text-xl flex items-center gap-2">
                <Coins className="w-5 h-5" /> 給与・条件
              </h3>
              <div className="bg-secondary/30 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">基本時給</div>
                  <div className="text-2xl font-bold text-primary">¥{shop.hourlyPayMin.toLocaleString()} 〜</div>
                </div>
                <div className="text-center space-y-2 border-x border-primary/10">
                  <div className="text-sm text-muted-foreground">指名料バック</div>
                  <div className="text-2xl font-bold text-primary">{shop.backRate}%</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">平均月収</div>
                  <div className="text-2xl font-bold text-primary">¥600,000〜</div>
                </div>
              </div>
            </section>
          </Tabs.Content>

          <Tabs.Content value="reviews" className="p-8 md:p-12 space-y-8 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xl">キャストからの口コミ</h3>
              <button className="text-primary text-sm font-bold border-b border-primary">口コミを投稿する</button>
            </div>
            <div className="space-y-6">
              {shop.reviews.map((review) => (
                <div key={review.id} className="p-6 bg-muted/10 rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                        {review.userName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{review.userName}</div>
                        <div className="text-xs text-muted-foreground">1週間前</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold text-foreground">{review.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{review.content}</p>
                  {review.photos && (
                    <div className="flex gap-2">
                      {(JSON.parse(review.photos) as string[]).map((p: string, i: number) => (
                        <div key={i} className="w-20 h-20 rounded-xl overflow-hidden">
                          <img src={p} className="w-full h-full object-cover" alt="" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Tabs.Content>

          <Tabs.Content value="girls" className="p-8 md:p-12 space-y-8 bg-white">
            <h3 className="text-xl">現在働いている女の子</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {shop.girls.map((girl) => (
                <div key={girl.id} className="text-center space-y-3 group cursor-pointer">
                  <div className="relative aspect-square rounded-full overflow-hidden border-4 border-white shadow-md group-hover:shadow-xl transition-shadow">
                    <img src={girl.photo} className="w-full h-full object-cover" alt={girl.name} />
                  </div>
                  <div>
                    <div className="font-bold">{girl.name}</div>
                    <div className="text-xs text-muted-foreground">{girl.ageGroup}</div>
                  </div>
                </div>
              ))}
            </div>
          </Tabs.Content>
        </Tabs.Root>
        </div>
      </div>
    </div>
  );
}

