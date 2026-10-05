'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import type { Lang } from './supabase'

const T = {
  en: { dict: 'Dictionary', quiz: 'Quiz', search: 'Search kanji, reading or meaning', soon: 'Waiting for sponsorship',
    meaning: 'Meaning', tip: 'Memory tip', words: 'Example words', sents: 'Example sentences', on: 'On', kun: 'Kun',
    start: 'Start quiz', mode: 'Question type', mMeaning: 'Meaning', mReading: 'Reading', mMixed: 'Mixed', rd: 'How do you read this kanji?', level: 'Level', count: 'Questions', rev: 'Which kanji means “{m}”?', fwd: 'What does this kanji mean?',
    next: 'Next question', finish: 'See result', right: 'Correct!', wrong: 'Not quite.', why: 'Why',
    score: 'Score', again: 'Try again', load: 'Loading…', empty: 'No kanji for this level yet.',
    err: 'Could not load data. The database may be waking up, so try again in a minute.', strokes: 'strokes', back: 'Back to dictionary' },
  ja: { dict: '辞典', quiz: 'クイズ', search: '漢字・読み・意味で検索', soon: 'スポンサー募集中',
    meaning: '意味', tip: '覚え方', words: '例の言葉', sents: '例文', on: '音読み', kun: '訓読み',
    start: 'クイズを始める', mode: '問題の種類', mMeaning: '意味', mReading: '読み', mMixed: 'ミックス', rd: 'この漢字の読み方は？', level: 'レベル', count: '問題数', rev: '「{m}」を意味する漢字はどれ？', fwd: 'この漢字の意味は？',
    next: '次の問題', finish: '結果を見る', right: '正解！', wrong: 'ちがいます。', why: '解説',
    score: 'スコア', again: 'もう一度', load: '読み込み中…', empty: 'このレベルはまだありません。',
    err: 'データを読み込めません。データベースが起動中かもしれません。少し待ってからもう一度お試しください。', strokes: '画', back: '辞典にもどる' },
}
type Key = keyof typeof T.en
type Ctx = { ui: 'en' | 'ja'; setUi: (u: 'en' | 'ja') => void; lang: Lang; setLang: (l: Lang) => void; t: (k: Key, v?: Record<string, string>) => string }
const C = createContext<Ctx>(null as unknown as Ctx)
export const useI18n = () => useContext(C)

export function I18n({ children }: { children: ReactNode }) {
  const [ui, setUiState] = useState<'en' | 'ja'>('en')
  const [lang, setLang] = useState<Lang>('en') // language of kanji content (meaning, tips, translations)
  const setUi = (u: 'en' | 'ja') => { setUiState(u); setLang(u) }
  const t = (k: Key, v: Record<string, string> = {}) =>
    Object.entries(v).reduce((s, [a, b]) => s.replace(`{${a}}`, b), T[ui][k])
  return <C.Provider value={{ ui, setUi, lang, setLang, t }}>{children}</C.Provider>
}

export function LangPills() {
  const { lang, setLang } = useI18n()
  return (
    <div className="pill" role="group" aria-label="Content language">
      {([['en', 'English'], ['ja', '日本語'], ['zh', '中文']] as const).map(([k, n]) => (
        <button key={k} className={lang === k ? 'on' : ''} onClick={() => setLang(k)}>{n}</button>
      ))}
    </div>
  )
}
