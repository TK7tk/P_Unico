import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const boards = await prisma.board.findMany({
        orderBy: { displayOrder: 'asc' },
      })
      res.status(200).json(boards)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch boards' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

