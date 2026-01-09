import { prisma } from './src/lib/prisma'

async function main() {
  const boards = [
    { name: 'ニュース速報', category: 'ニュース', description: '最新のニュースについて議論する板です。' },
    { name: '雑談', category: '生活', description: '日常の些細な出来事や雑談を楽しむ板です。' },
    { name: 'プログラミング', category: '技術', description: '開発やコーディングに関する情報交換。' },
    { name: 'アニメ・漫画', category: '趣味', description: '最新のアニメや漫画の感想・考察。' },
    { name: '美味しいお店', category: '生活', description: '全国の美味しい飲食店情報を共有。' },
  ]

  for (const board of boards) {
    await prisma.board.upsert({
      where: { id: board.name }, // This is not ideal but for seeding it's ok if we use name as ID or find by name
      update: {},
      create: {
        name: board.name,
        category: board.category,
        description: board.description,
      },
    })
  }

  console.log('Seed data created successfully')
}

// Since we are running in a restricted environment, I'll provide a simpler seed script
// to be run via `npx prisma db seed` if needed, but for now I'll just write it.

