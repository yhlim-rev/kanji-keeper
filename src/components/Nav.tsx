'use client'
import Link from 'next/link'
import Image from 'next/image'
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
          <Image src="/logo.png" alt="" width={46} height={29} priority />
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
