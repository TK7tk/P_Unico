import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.review.deleteMany()
  await prisma.girl.deleteMany()
  await prisma.shop.deleteMany()

  // --- Shop 1: Club Royal (Ginza) ---
  const shop1 = await prisma.shop.create({
    data: {
      name: "Club Royal 銀座",
      area: "銀座",
      type: "キャバクラ",
      hourlyPayMin: 7000,
      hourlyPayMax: 15000,
      backRate: 45,
      description: "銀座の夜を彩る最高級の空間。一流のお客様をお迎えする最高のおもてなしを提供しています。",
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1560624052-449f5ddf0c3d?q=80&w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1574096079513-d8259312b785?q=80&w=800&h=600&fit=crop"
      ]),
      rating: 4.9,
      reviewCount: 320,
      girlsCount: 45,
      girls: {
        create: [
          {
            name: "エレナ",
            ageGroup: "20代前半",
            shift: "週5日",
            introduction: "落ち着いた会話が得意です。一緒にお酒を楽しみましょう。",
            photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&h=400&fit=crop",
            rating: 5.0,
            reviewCount: 68,
          },
          {
            name: "美玲",
            ageGroup: "20代前半",
            shift: "週3日",
            introduction: "笑顔でお迎えします！お話しするのが大好きです。",
            photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400&h=400&fit=crop",
            rating: 4.8,
            reviewCount: 42,
          }
        ]
      },
      reviews: {
        create: [
          {
            rating: 5,
            content: "銀座の一流店だけあって、客層が本当に素晴らしいです。給与も約束通りしっかりいただけます。",
            userName: "キャストA",
            photos: JSON.stringify(["https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=400&h=300&fit=crop"])
          },
          {
            rating: 4,
            content: "レベルは高いですが、その分学べることも多いです。スタッフの方もプロ意識が高いです。",
            userName: "キャストB"
          }
        ]
      }
    }
  })

  // --- Shop 2: Girls Bar Moonlight (Shibuya) ---
  const shop2 = await prisma.shop.create({
    data: {
      name: "Moonlight 渋谷",
      area: "渋谷",
      type: "ガールズバー",
      hourlyPayMin: 3000,
      hourlyPayMax: 5000,
      backRate: 30,
      description: "渋谷駅から徒歩3分！未経験でも楽しく働けるアットホームなガールズバーです。",
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=800&h=600&fit=crop"
      ]),
      rating: 4.2,
      reviewCount: 150,
      girlsCount: 20,
      girls: {
        create: [
          {
            name: "ナナ",
            ageGroup: "10代後半",
            shift: "週2日",
            introduction: "大学生です！楽しくワイワイ飲むのが好きです。",
            photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&fit=crop",
            rating: 4.5,
            reviewCount: 25,
          },
          {
            name: "ゆい",
            ageGroup: "20代前半",
            shift: "週4日",
            introduction: "カラオケ大好きです！一緒に盛り上がりましょう！",
            photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&h=400&fit=crop",
            rating: 4.3,
            reviewCount: 30,
          }
        ]
      },
      reviews: {
        create: [
          {
            rating: 4,
            content: "みんな仲が良くて、シフトの融通も利くので副業にぴったりです。",
            userName: "キャストC"
          },
          {
            rating: 5,
            content: "未経験で不安でしたが、お酒の作り方から丁寧に教えてもらえました。",
            userName: "キャストD"
          }
        ]
      }
    }
  })

  // --- Shop 3: Lounge Serene (Roppongi) ---
  const shop3 = await prisma.shop.create({
    data: {
      name: "Lounge Serene 六本木",
      area: "六本木",
      type: "ラウンジ",
      hourlyPayMin: 5000,
      hourlyPayMax: 9000,
      backRate: 40,
      description: "六本木の隠れ家的ラウンジ。落ち着いた大人の空間で、ゆったりとした時間を提供します。",
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1572116469696-31de0f17cc3b?q=80&w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1560624052-449f5ddf0c3d?q=80&w=800&h=600&fit=crop"
      ]),
      rating: 4.6,
      reviewCount: 210,
      girlsCount: 25,
      girls: {
        create: [
          {
            name: "しおり",
            ageGroup: "20代後半",
            shift: "週3日",
            introduction: "OLをしながら働いています。落ち着いた雰囲気で接客します。",
            photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&fit=crop",
            rating: 4.7,
            reviewCount: 50,
          },
          {
            name: "カレン",
            ageGroup: "20代前半",
            shift: "週5日",
            introduction: "モデルの卵です。美容の話が得意です！",
            photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=400&fit=crop",
            rating: 4.9,
            reviewCount: 35,
          }
        ]
      },
      reviews: {
        create: [
          {
            rating: 5,
            content: "無理な営業がなく、自分のペースで働けるのが一番の魅力です。",
            userName: "キャストE"
          },
          {
            rating: 4,
            content: "お店の内装がとても綺麗で、モチベーションが上がります。",
            userName: "キャストF"
          }
        ]
      }
    }
  })

  console.log('3 shops, 6 girls, and 6 reviews created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
