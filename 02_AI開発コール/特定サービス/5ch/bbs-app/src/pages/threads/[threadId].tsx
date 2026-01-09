import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { Send, User, Clock, Hash, CornerDownRight } from 'lucide-react'

interface Post {
  id: string
  number: number
  name: string
  email: string | null
  content: string
  ipHash: string
  createdAt: string
}

interface Thread {
  id: string
  title: string
  posts: Post[]
  board: { id: string; name: string }
}

export default function ThreadPage() {
  const router = useRouter()
  const { threadId } = router.query
  const [thread, setThread] = useState<Thread | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', content: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchThread = async () => {
    if (threadId) {
      const res = await fetch(`/api/threads/${threadId}`)
      const data = await res.json()
      setThread(data)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchThread()
  }, [threadId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.content.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, ...formData })
      })
      if (res.ok) {
        setFormData({ ...formData, content: '' })
        await fetchThread()
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  if (!thread) return <Layout>Thread not found</Layout>

  return (
    <Layout
      title={thread.title}
      breadcrumb={[
        { label: thread.board.name, href: `/boards/${thread.board.id}` },
        { label: thread.title }
      ]}
    >
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl m-0">{thread.title}</h1>
        </div>

        <div className="space-y-4">
          {thread.posts.map(post => (
            <div key={post.id} className="dusty-card">
              <div className="bg-secondary/10 px-4 py-2 border-b border-border flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
                <span className="font-bold text-primary">{post.number}</span>
                <span className="flex items-center gap-1 font-medium">
                  <User size={14} className="text-primary-light" />
                  {post.email ? (
                    <a href={`mailto:${post.email}`} className="text-blue-500 hover:underline">{post.name}</a>
                  ) : (
                    <span>{post.name}</span>
                  )}
                </span>
                <span className="flex items-center gap-1 text-muted">
                  <Clock size={14} />
                  {new Date(post.createdAt).toLocaleString('ja-JP')}
                </span>
                <span className="flex items-center gap-1 text-muted">
                  <Hash size={14} />
                  ID:{post.ipHash}
                </span>
              </div>
              <div className="p-4 whitespace-pre-wrap break-words text-foreground leading-relaxed">
                {post.content.split(/(>>\d+)/g).map((part, i) => (
                  part.match(/^>>\d+$/) ? (
                    <span key={i} className="text-primary font-bold">{part}</span>
                  ) : part
                ))}
              </div>
            </div>
          ))}
        </div>

        <section className="mt-12 space-y-6">
          <div className="flex items-center gap-2 border-b-2 border-primary/20 pb-2">
            <CornerDownRight className="text-primary" size={24} />
            <h2 className="text-2xl m-0">レスを投稿する</h2>
          </div>

          <form onSubmit={handleSubmit} className="dusty-card p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-muted">お名前（任意）</label>
                <input
                  type="text"
                  className="dusty-input"
                  placeholder="名無しさん"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-muted">メール（任意）</label>
                <input
                  type="email"
                  className="dusty-input"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-muted">本文（必須）</label>
              <textarea
                required
                rows={5}
                className="dusty-input"
                placeholder="内容を入力してください"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="dusty-button w-full flex items-center justify-center gap-2"
            >
              <Send size={20} />
              {submitting ? '投稿中...' : '投稿する'}
            </button>
          </form>
        </section>
      </div>
    </Layout>
  )
}

