import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { boardId } = req.query

  if (req.method === 'GET') {
    try {
      const board = await prisma.board.findUnique({
        where: { id: boardId as string },
        include: {
          threads: {
            include: {
              _count: {
                select: { posts: true }
              }
            },
            orderBy: { lastUpdatedAt: 'desc' }
          }
        }
      })
      if (!board) return res.status(404).json({ error: 'Board not found' })
      res.status(200).json(board)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch board' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

