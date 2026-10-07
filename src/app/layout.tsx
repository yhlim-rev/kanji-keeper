import './globals.css'
import type { Metadata } from 'next'
import { Zen_Maru_Gothic, Noto_Serif_JP } from 'next/font/google'
import { I18n } from '@/lib/i18n'
import { Auth } from '@/lib/auth'
import Nav from '@/components/Nav'

const sans = Zen_Maru_Gothic({ weight: ['400', '700'], preload: false, variable: '--sans' })
const serif = Noto_Serif_JP({ weight: ['700'], preload: false, variable: '--serif' })

export const metadata: Metadata = { title: 'Kanji Keeper', description: 'JLPT N5〜N2 の漢字を、意味・読み・例文で学ぶアプリ' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${sans.variable} ${serif.variable}`}>
      <body><I18n><Auth><div className="w"><Nav />{children}</div></Auth></I18n></body>
    </html>
  )
}
