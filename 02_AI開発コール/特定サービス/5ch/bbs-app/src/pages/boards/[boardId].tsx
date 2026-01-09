import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { Plus, MessageSquare, Clock, ListFilter } from 'lucide-react'

interface Thread {
  id: string
  title: string
  lastUpdatedAt: string
  _count: { posts: number }
}

interface Board {
  id: string
  name: string
  threads: Thread[]
}

export default function BoardPage() {
  const router = useRouter()
  const { boardId } = router.query
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (boardId) {
      fetch(`/api/boards/${boardId}`)
        .then(res => res.json())
        .then(data => {
          setBoard(data)
          setLoading(false)
        })
    }
  }, [boardId])

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  if (!board) return <Layout>Board not found</Layout>

  return (
    <Layout
      title={board.name}
      breadcrumb={[{ label: board.name }]}
    >
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl m-0">{board.name}</h1>
            <p className="text-muted">スレッド一覧（{board.threads.length}件）</p>
          </div>
          <Link
            href={`/threads/new?boardId=${board.id}`}
            className="dusty-button flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <Plus size={20} />
            新規スレッド作成
          </Link>
        </div>

        <div className="dusty-card">
          <div className="bg-secondary/20 px-6 py-3 border-b border-border flex items-center gap-4 text-sm font-bold text-primary">
            <ListFilter size={16} />
            <span>最新のスレッド</span>
          </div>
          <div className="divide-y divide-border">
            {board.threads.length === 0 ? (
              <div className="p-10 text-center text-muted">
                まだスレッドがありません。
              </div>
            ) : (
              board.threads.map((thread, i) => (
                <Link
                  key={thread.id}
                  href={`/threads/${thread.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-secondary/5 transition-colors group"
                >
                  <div className="space-y-1">
                    <h3 className="text-lg m-0 group-hover:text-primary-dark transition-colors">
                      {i + 1}: {thread.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        {thread._count.posts} レス
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center gap-2 text-xs text-muted">
                    <Clock size={12} />
                    {new Date(thread.lastUpdatedAt).toLocaleString('ja-JP')}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

