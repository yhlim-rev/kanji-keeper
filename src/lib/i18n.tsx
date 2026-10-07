'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import type { Lang } from './supabase'

// The whole interface is Japanese. Edit the texts here.
const J = {
  dict: '辞典', quiz: 'クイズ', review: '復習', login: 'ログイン', signup: '新規登録', logout: 'ログアウト',
  email: 'メールアドレス', password: 'パスワード（6文字以上）', toSignup: 'アカウントを作る', toLogin: 'ログインはこちら',
  checkMail: '確認メールを送りました。メールのリンクを開いてからログインしてください。',
  setup: 'Supabase に接続されていません。src/lib/supabase.ts に Project URL と anon key を貼り付けて（または .env.local に設定して）、開発サーバーを再起動してください。',
  search: '漢字・読み・意味で検索', soon: 'スポンサー募集中', meaning: '意味', tip: '覚え方', words: '例の言葉', sents: '例文',
  on: '音読み', kun: '訓読み', start: 'クイズを始める', mode: '問題の種類', mMeaning: '意味', mReading: '読み', mMixed: 'ミックス',
  rd: 'この漢字の読み方は？', level: 'レベル', count: '問題数', rev: '「{m}」を意味する漢字はどれ？', fwd: 'この漢字の意味は？',
  next: '次の問題', finish: '結果を見る', right: '正解！', wrong: 'ちがいます。', score: 'スコア', again: 'もう一度',
  load: '読み込み中…', empty: 'このレベルはまだありません。',
  err: 'データを読み込めません。データベースが起動中かもしれません。少し待ってからもう一度お試しください。',
  strokes: '画', back: '辞典にもどる',
  tag: 'JLPT N5〜N2', h1a: '毎日ちょっとずつ漢字を学ぼう。', h1b: '忘れる前に復習。',
  sub: '意味・読み・例文をやさしい日本語で。間隔をあけた復習で、忘れる前にもう一度出会えます。',
  startReview: '今日の復習を始める', tryQuiz: 'クイズに挑戦', kotd: '今日の漢字', dueToday: '今日の復習', streak: '連続学習',
  learned: '覚えた漢字', cards: '枚', days: '日', kanjiUnit: '字', browse: 'レベルから探す',
  loginHint: 'ログインすると、復習の記録と連続日数が保存されます。',
}
type Key = keyof typeof J
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: Key, v?: Record<string, string>) => string }
const C = createContext<Ctx>(null as unknown as Ctx)
export const useI18n = () => useContext(C)

export function I18n({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ja') // language of the kanji content (meaning, tips, translations)
  const t = (k: Key, v: Record<string, string> = {}) => Object.entries(v).reduce((s, [a, b]) => s.replace(`{${a}}`, b), J[k])
  return <C.Provider value={{ lang, setLang, t }}>{children}</C.Provider>
}

export function LangPills() {
  const { lang, setLang } = useI18n()
  return (
    <div className="pill" role="group" aria-label="説明の言語">
      {([['ja', '日本語'], ['en', 'English'], ['zh', '中文']] as const).map(([k, n]) => (
        <button key={k} className={lang === k ? 'on' : ''} onClick={() => setLang(k)}>{n}</button>
      ))}
    </div>
  )
}
