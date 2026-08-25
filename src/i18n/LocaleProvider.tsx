'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { dictionaries, type Dictionary, type Locale } from './dictionaries'

const STORAGE = 'folio-locale'

type Ctx = {
  locale: Locale
  t: Dictionary
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<Ctx | null>(null)

function readLocale(): Locale {
  if (typeof window === 'undefined') return 'pt'
  const stored = localStorage.getItem(STORAGE)
  return stored === 'en' || stored === 'pt' ? stored : 'pt'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt')

  useEffect(() => {
    setLocaleState(readLocale())
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE, locale)
    document.documentElement.lang = locale === 'pt' ? 'pt-PT' : 'en'
  }, [locale])

  const value = useMemo<Ctx>(
    () => ({
      locale,
      t: dictionaries[locale],
      setLocale: setLocaleState,
    }),
    [locale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('LocaleProvider missing')
  return ctx
}
