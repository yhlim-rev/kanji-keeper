'use client'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { isConfigured } from '@/lib/supabase'

export default function Nav() {
  const { ui, setUi, t } = useI18n()
  return (
    <>
    <nav className="nav">
      <Link href="/" className="brand">Kanji Keeper</Link>
      <Link href="/" className="m">{t('dict')}</Link>
      <Link href="/quiz" className="m">{t('quiz')}</Link>
      <div className="pill" style={{ marginLeft: 'auto' }} role="group" aria-label="Interface language">
        <button className={ui === 'en' ? 'on' : ''} onClick={() => setUi('en')}>EN</button>
        <button className={ui === 'ja' ? 'on' : ''} onClick={() => setUi('ja')}>日本語</button>
      </div>
    </nav>
    {!isConfigured && (
      <div className="card" style={{ borderColor: 'var(--acc)', marginBottom: 16 }}>
        Supabase is not connected yet. Open src/lib/supabase.ts and paste your Project URL and anon key (or fill .env.local), then restart the dev server.
      </div>
    )}
    </>
  )
}
