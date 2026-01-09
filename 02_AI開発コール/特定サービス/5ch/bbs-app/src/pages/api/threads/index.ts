import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { boardId, title, name, content } = req.body

    if (!title || !content || !boardId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
      const ipHash = crypto.createHash('md5').update(ip as string + new Date().toDateString()).digest('hex').slice(0, 8)

      const thread = await prisma.thread.create({
        data: {
          title,
          boardId,
          posts: {
            create: {
              number: 1,
              name: name || '名無しさん',
              content,
              ipHash,
            }
          }
        }
      })
      res.status(201).json(thread)
    } catch (error) {
      res.status(500).json({ error: 'Failed to create thread' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

