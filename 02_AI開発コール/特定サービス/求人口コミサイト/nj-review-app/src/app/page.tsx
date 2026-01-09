import { MapPin, Building2, Users, Star } from "lucide-react";
import Link from "next/link";
import { HeroSearch } from "@/components/HeroSearch";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const featuredShops = await prisma.shop.findMany({
    take: 3,
    orderBy: { rating: 'desc' }
  });

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center bg-gradient-to-b from-white via-muted to-secondary/30 overflow-hidden">
        <div className="container relative z-10 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif text-primary-dark">
              理想の夜、<br className="md:hidden" />見つかる。
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              実際に働いている女の子のリアルな口コミと写真から、あなたにぴったりのお店を探しましょう。
            </p>
          </div>

          <HeroSearch />
        </div>
      </section>

      {/* Preset Categories */}
      <section className="container grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Building2 />, name: "キャバクラ" },
          { icon: <Users />, name: "ラウンジ" },
          { icon: <Star />, name: "ガールズバー" },
          { icon: <MapPin />, name: "スナック" },
        ].map((cat) => (
          <Link 
            key={cat.name} 
            href={`/search?type=${cat.name}`}
            className="flex flex-col items-center gap-3 p-6 bg-white border border-primary/10 rounded-2xl hover:border-primary/40 hover:shadow-md transition-all group text-center"
          >
            <div className="p-4 bg-muted rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              {cat.icon}
            </div>
            <span className="font-bold text-sm">{cat.name}</span>
          </Link>
        ))}
      </section>

      {/* Featured Shops */}
      <section className="container space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-serif">人気のお店</h3>
          <Link href="/search" className="text-primary text-sm font-bold hover:underline">すべて見る</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredShops.map((shop) => {
            const photos = shop.photos ? JSON.parse(shop.photos) : ["https://images.unsplash.com/photo-1560624052-449f5ddf0c3d?q=80&w=400&h=300&fit=crop"];
            return (
              <Link key={shop.id} href={`/shops/${shop.id}`} className="group">
                <div className="bg-white rounded-3xl overflow-hidden border border-primary/10 hover:shadow-xl transition-all h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={photos[0]} 
                      alt={shop.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white px-3 py-1 rounded-full text-xs">
                      {shop.area}
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-bold">{shop.name}</h4>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold text-foreground">{shop.rating}</span>
                        <span className="text-xs text-muted-foreground">({shop.reviewCount}件)</span>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className="px-2 py-1 bg-muted rounded-md">{shop.type}</span>
                      <span className="px-2 py-1 bg-muted rounded-md">時給 ¥{shop.hourlyPayMin.toLocaleString()}〜</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-primary/5 py-16">
        <div className="container grid grid-cols-3 gap-8 text-center">
          {[
            { label: "総口コミ数", value: "50,000+" },
            { label: "掲載店舗数", value: "5,000+" },
            { label: "登録キャスト", value: "100,000+" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-2">
              <div className="text-3xl font-serif text-primary font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

