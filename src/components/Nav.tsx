'use client'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { isConfigured, supabase } from '@/lib/supabase'

export default function Nav() {
  const { t } = useI18n()
  const { user } = useAuth()
  return (
    <>
      <nav className="nav">
        <Link href="/" className="logo" aria-label="Kanji Keeper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8834a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
        </Link>
        <Link href="/" className="brand">Kanji Keeper</Link>
        <Link href="/dictionary" className="m">{t('dict')}</Link>
        <Link href="/quiz" className="m">{t('quiz')}</Link>
        <Link href={user ? '/quiz?review=1' : '/login'} className="m">{t('review')}</Link>
        <div style={{ marginLeft: 'auto' }}>
          {user
            ? <button className="btn ghost" onClick={() => supabase.auth.signOut()}>{t('logout')}</button>
            : <Link href="/login" className="btn ghost">{t('login')}</Link>}
        </div>
      </nav>
      {!isConfigured && <div className="card" style={{ borderColor: 'var(--acc)', marginBottom: 16 }}>{t('setup')}</div>}
    </>
  )
}
