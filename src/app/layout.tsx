import './globals.css'
import type { Metadata } from 'next'
import { Zen_Maru_Gothic, Noto_Serif_JP } from 'next/font/google'
import { I18n } from '@/lib/i18n'
import Nav from '@/components/Nav'

const sans = Zen_Maru_Gothic({ weight: ['400', '700'], preload: false, variable: '--sans' })
const serif = Noto_Serif_JP({ weight: ['700'], preload: false, variable: '--serif' })

export const metadata: Metadata = { title: 'Kanji Keeper', description: 'Learn Japanese kanji N5 to N2 in English, Japanese and Chinese.' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body><I18n><div className="w"><Nav />{children}</div></I18n></body>
    </html>
  )
}
