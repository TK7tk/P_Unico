import Layout from '@/components/Layout'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Noto_Sans_JP, Noto_Serif_JP } from 'next/font/google'

const notoMain = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans',
})

const notoSerif = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-serif',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${notoMain.variable} ${notoSerif.variable} font-sans`}>
      <Component {...pageProps} />
    </div>
  )
}

