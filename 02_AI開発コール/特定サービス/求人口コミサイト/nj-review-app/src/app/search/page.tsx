import { prisma } from "@/lib/prisma";
import { Star, MapPin, Building2, SlidersHorizontal, ChevronDown } from "lucide-react";
import Link from "next/link";
import { SalaryFilter } from "@/components/SalaryFilter";

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: { q?: string; area?: string; type?: string; min_pay?: string; max_pay?: string } 
}) {
  const minPay = searchParams.min_pay ? parseInt(searchParams.min_pay) : undefined;
  const maxPay = searchParams.max_pay ? parseInt(searchParams.max_pay) : undefined;

  const shops = await prisma.shop.findMany({
    where: {
      AND: [
        searchParams.q ? {
          OR: [
            { name: { contains: searchParams.q } },
            { description: { contains: searchParams.q } },
          ]
        } : {},
        searchParams.area ? { area: { contains: searchParams.area } } : {},
        searchParams.type ? { type: searchParams.type } : {},
        minPay ? { hourlyPayMin: { gte: minPay } } : {},
        maxPay ? { hourlyPayMin: { lte: maxPay } } : {},
      ]
    }
  });

  const activeFilters = [
    searchParams.area,
    searchParams.type,
    searchParams.q,
    minPay ? `¥${minPay.toLocaleString()}〜` : "",
    maxPay ? `〜¥${maxPay.toLocaleString()}` : "",
  ].filter(Boolean).join("・");

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="container py-8 flex flex-col md:flex-row gap-8">
        {/* Filter Sidebar */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-primary/5 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" /> 絞り込み
              </h3>
              <Link href="/search" className="text-primary text-xs font-bold hover:underline">リセット</Link>
            </div>

            <section className="space-y-4">
              <h4 className="font-bold text-sm">エリア</h4>
              <div className="space-y-2">
                {["銀座", "六本木", "新宿", "渋谷"].map(area => (
                  <Link 
                    key={area} 
                    href={`/search?area=${area}${searchParams.type ? `&type=${searchParams.type}` : ""}`}
                    className={`flex items-center gap-3 cursor-pointer group px-3 py-2 rounded-xl transition-colors ${searchParams.area === area ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                  >
                    <MapPin className={`w-4 h-4 ${searchParams.area === area ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">{area}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="space-y-4 border-t pt-6">
              <h4 className="font-bold text-sm">営業形態</h4>
              <div className="space-y-2">
                {["キャバクラ", "ラウンジ", "ガールズバー", "スナック"].map(type => (
                  <Link 
                    key={type} 
                    href={`/search?type=${type}${searchParams.area ? `&area=${searchParams.area}` : ""}`}
                    className={`flex items-center gap-3 cursor-pointer group px-3 py-2 rounded-xl transition-colors ${searchParams.type === type ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                  >
                    <Building2 className={`w-4 h-4 ${searchParams.type === type ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">{type}</span>
                  </Link>
                ))}
              </div>
            </section>

            <SalaryFilter currentMin={searchParams.min_pay} currentMax={searchParams.max_pay} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-serif">{shops.length}件のお店が見つかりました</h2>
              <p className="text-xs text-muted-foreground">
                {activeFilters || "すべての店舗"} の検索結果
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">並び替え:</span>
              <button className="bg-white px-4 py-2 rounded-full text-sm font-bold border flex items-center gap-2">
                標準 (評価が高い順) <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {shops.map((shop) => {
              const photos = shop.photos ? JSON.parse(shop.photos) : ["https://images.unsplash.com/photo-1560624052-449f5ddf0c3d?q=80&w=400&h=300&fit=crop"];
              return (
                <Link key={shop.id} href={`/shops/${shop.id}`} className="block group">
                  <div className="bg-white rounded-[32px] p-4 flex flex-col md:flex-row gap-6 border border-primary/5 hover:border-primary/20 hover:shadow-xl transition-all">
                    <div className="w-full md:w-64 aspect-[4/3] rounded-2xl overflow-hidden shrink-0">
                      <img 
                        src={photos[0]} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        alt="" 
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{shop.name}</h3>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-bold text-foreground">{shop.rating}</span>
                            <span className="text-xs text-muted-foreground">({shop.reviewCount})</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs px-2 py-1 bg-muted rounded-md flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {shop.area}
                          </span>
                          <span className="text-xs px-2 py-1 bg-muted rounded-md flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {shop.type}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-2xl">
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">時給</div>
                          <div className="font-bold text-primary">¥{shop.hourlyPayMin.toLocaleString()} 〜</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">バック率</div>
                          <div className="font-bold text-primary">{shop.backRate}%</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-muted-foreground italic">
                          「とても働きやすい環境です...」
                        </div>
                        <div className="text-primary font-bold text-sm flex items-center">
                          詳細を見る <ChevronDown className="w-4 h-4 -rotate-90 ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

