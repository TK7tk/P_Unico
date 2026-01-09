import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { threadId, name, email, content } = req.body

    if (!threadId || !content) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
      const thread = await prisma.thread.findUnique({
        where: { id: threadId },
        include: { _count: { select: { posts: true } } }
      })

      if (!thread) return res.status(404).json({ error: 'Thread not found' })
      if (thread._count.posts >= 1000) return res.status(400).json({ error: 'Thread is full' })

      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
      const ipHash = crypto.createHash('md5').update(ip as string + new Date().toDateString()).digest('hex').slice(0, 8)

      const post = await prisma.post.create({
        data: {
          threadId,
          number: thread._count.posts + 1,
          name: name || '名無しさん',
          email,
          content,
          ipHash,
        }
      })

      // Update thread last updated time
      await prisma.thread.update({
        where: { id: threadId },
        data: { lastUpdatedAt: new Date() }
      })

      res.status(201).json(post)
    } catch (error) {
      res.status(500).json({ error: 'Failed to create post' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

