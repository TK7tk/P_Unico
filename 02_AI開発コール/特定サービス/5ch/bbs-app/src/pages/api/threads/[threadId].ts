import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { threadId } = req.query

  if (req.method === 'GET') {
    try {
      const thread = await prisma.thread.findUnique({
        where: { id: threadId as string },
        include: {
          posts: {
            orderBy: { number: 'asc' }
          },
          board: true
        }
      })
      if (!thread) return res.status(404).json({ error: 'Thread not found' })
      res.status(200).json(thread)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch thread' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

