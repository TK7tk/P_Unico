import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { Folder, Hash, MessageCircle } from 'lucide-react'

interface Board {
  id: string
  name: string
  description: string
  category: string
}

export default function Home() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/boards')
      .then(res => res.json())
      .then(data => {
        setBoards(data)
        setLoading(false)
      })
  }, [])

  const categories = Array.from(new Set(boards.map(b => b.category)))

  return (
    <Layout title="掲示板一覧">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl">掲示板一覧</h1>
          <p className="text-muted max-w-lg mx-auto">
            完全匿名で利用できる掲示板です。興味のあるカテゴリを選んで、会話に参加しましょう。
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid gap-10">
            {categories.map(category => (
              <section key={category} className="space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-primary/20 pb-2">
                  <Folder className="text-primary" size={24} />
                  <h2 className="text-2xl m-0">{category}</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {boards
                    .filter(b => b.category === category)
                    .map(board => (
                      <Link
                        key={board.id}
                        href={`/boards/${board.id}`}
                        className="dusty-card p-6 hover:border-primary hover:bg-secondary/10 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl m-0 group-hover:text-primary-dark transition-colors">
                            {board.name}
                          </h3>
                          <Hash className="text-primary-light" size={20} />
                        </div>
                        <p className="text-muted text-sm line-clamp-2">
                          {board.description}
                        </p>
                      </Link>
                    ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

