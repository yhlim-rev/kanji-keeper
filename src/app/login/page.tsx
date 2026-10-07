'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'

export default function Login() {
  const { t } = useI18n()
  const router = useRouter()
  const [signup, setSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('')
    const { data, error } = signup
      ? await supabase.auth.signUp({ email, password: pw })
      : await supabase.auth.signInWithPassword({ email, password: pw })
    setBusy(false)
    if (error) return setMsg(error.message)
    if (signup && !data.session) return setMsg(t('checkMail')) // email confirmation is switched on in Supabase
    router.push('/')
  }

  return (
    <form className="card stack" style={{ maxWidth: 420, margin: '24px auto' }} onSubmit={submit}>
      <h1 style={{ margin: 0 }}>{signup ? t('signup') : t('login')}</h1>
      <label className="stack" style={{ gap: 6 }}>{t('email')}
        <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="stack" style={{ gap: 6 }}>{t('password')}
        <input type="password" required minLength={6} autoComplete={signup ? 'new-password' : 'current-password'} value={pw} onChange={e => setPw(e.target.value)} /></label>
      <button className="btn" disabled={busy}>{signup ? t('signup') : t('login')}</button>
      {msg && <p className="m" role="alert" style={{ margin: 0 }}>{msg}</p>}
      <button type="button" className="m" style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit', textAlign: 'left', padding: 0 }}
        onClick={() => { setSignup(!signup); setMsg('') }}>{signup ? t('toLogin') : t('toSignup')}</button>
    </form>
  )
}
