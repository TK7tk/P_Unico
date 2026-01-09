const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const boards = [
    { name: 'ニュース速報', category: 'ニュース', description: '最新のニュースについて議論する板です。' },
    { name: '雑談', category: '生活', description: '日常の些細な出来事や雑談を楽しむ板です。' },
    { name: 'プログラミング', category: '技術', description: '開発やコーディングに関する情報交換。' },
    { name: 'アニメ・漫画', category: '趣味', description: '最新のアニメや漫画の感想・考察。' },
    { name: '美味しいお店', category: '生活', description: '全国の美味しい飲食店情報を共有。' },
  ]

  for (const board of boards) {
    await prisma.board.create({
      data: {
        name: board.name,
        category: board.category,
        description: board.description,
      },
    })
  }

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

