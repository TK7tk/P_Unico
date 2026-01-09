import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { PlusSquare, Type, AlignLeft, User } from 'lucide-react'

export default function NewThreadPage() {
  const router = useRouter()
  const { boardId } = router.query
  const [boardName, setBoardName] = useState('')
  const [formData, setFormData] = useState({ title: '', name: '', content: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (boardId) {
      fetch(`/api/boards/${boardId}`)
        .then(res => res.json())
        .then(data => setBoardName(data.name))
    }
  }, [boardId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId, ...formData })
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/threads/${data.id}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout
      title="新規スレッド作成"
      breadcrumb={[
        { label: boardName, href: `/boards/${boardId}` },
        { label: '新規スレッド作成' }
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl m-0">新規スレッド作成</h1>
          <p className="text-muted">{boardName} 板に新しいスレッドを作成します。</p>
        </div>

        <form onSubmit={handleSubmit} className="dusty-card p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-muted">
                <Type size={16} />
                スレッドタイトル（必須）
              </label>
              <input
                required
                type="text"
                className="dusty-input text-lg"
                placeholder="興味を引くタイトルを入力"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-muted">
                <User size={16} />
                お名前（任意）
              </label>
              <input
                type="text"
                className="dusty-input"
                placeholder="名無しさん"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-muted">
                <AlignLeft size={16} />
                最初の書き込み（必須）
              </label>
              <textarea
                required
                rows={8}
                className="dusty-input"
                placeholder="スレッドの主旨を詳しく入力してください"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="dusty-button w-full py-4 text-lg flex items-center justify-center gap-3"
          >
            <PlusSquare size={24} />
            {submitting ? '作成中...' : 'スレッドを作成する'}
          </button>
        </form>
      </div>
    </Layout>
  )
}

