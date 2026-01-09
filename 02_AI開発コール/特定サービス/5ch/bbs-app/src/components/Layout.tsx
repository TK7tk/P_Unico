import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, MessageSquare, ChevronRight } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  breadcrumb?: { label: string; href?: string }[]
}

const Layout: React.FC<LayoutProps> = ({ children, title, breadcrumb }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <Head>
        <title>{title ? `${title} | BBS` : 'Dusty Pink BBS'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white group-hover:bg-primary-dark transition-colors">
              <MessageSquare size={24} />
            </div>
            <span className="text-xl font-serif font-bold text-primary">Pink BBS</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-muted hover:text-primary flex items-center gap-1 transition-colors">
              <Home size={18} />
              <span>ホーム</span>
            </Link>
          </nav>
        </div>
      </header>

      {breadcrumb && (
        <div className="bg-secondary/30 border-b border-border/50">
          <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-2 text-sm text-muted">
            <Link href="/" className="hover:text-primary">トップ</Link>
            {breadcrumb.map((item, i) => (
              <React.Fragment key={i}>
                <ChevronRight size={14} />
                {item.href ? (
                  <Link href={item.href} className="hover:text-primary">{item.label}</Link>
                ) : (
                  <span className="text-foreground font-medium">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="bg-white border-t border-border py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-primary font-serif font-bold mb-2">Pink BBS</p>
          <p className="text-muted text-sm">&copy; 2024 Anonymous Bulletin Board. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout

