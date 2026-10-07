'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

const C = createContext<{ user: User | null; ready: boolean }>({ user: null, ready: false })
export const useAuth = () => useContext(C)

export function Auth({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])
  return <C.Provider value={{ user, ready }}>{children}</C.Provider>
}
