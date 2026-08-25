'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { ReactNode } from 'react'

export function SiteChrome({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useLocale()

  return (
    <div className="relative z-10 min-h-dvh">
      <header className="sticky top-4 z-20 mx-auto w-[min(1280px,calc(100%-1.5rem))]">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-[#f4e6c8]/12 bg-black/70 px-4 py-2 backdrop-blur-md">
          <Link href="/" className="display text-xl tracking-[0.28em] text-[#ffaa00]">
            {t.brand}
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="/desk" className="btn">
              {t.enter}
            </Link>
            <div className="flex overflow-hidden rounded-full border border-[#f4e6c8]/25">
              <button
                type="button"
                className={`px-3 py-1 text-xs font-bold ${locale === 'pt' ? 'bg-[#ff7a00] text-black' : ''}`}
                onClick={() => setLocale('pt')}
              >
                PT
              </button>
              <button
                type="button"
                className={`px-3 py-1 text-xs font-bold ${locale === 'en' ? 'bg-[#ff7a00] text-black' : ''}`}
                onClick={() => setLocale('en')}
              >
                EN
              </button>
            </div>
          </nav>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="mx-auto w-[min(1280px,calc(100%-1.5rem))] py-10"
      >
        {children}
      </motion.main>

      <footer className="mx-auto mt-8 w-[min(1280px,calc(100%-1.5rem))] border-t border-[#f4e6c8]/10 py-10 text-center text-sm text-[#f4e6c8]/70">
        <p className="display text-lg tracking-[0.28em] text-[#ffaa00]">{t.brand}</p>
        <p className="mt-2">{t.tagline}</p>
        <p className="mt-4">{t.developed}</p>
        <p className="mt-2 flex justify-center gap-4">
          <a href="https://ividi.dev/" className="text-[#ff7a00] hover:text-[#ffaa00]">
            ividi.dev
          </a>
          <a href="https://github.com/VidiPT89/" className="text-[#ff7a00] hover:text-[#ffaa00]">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}
