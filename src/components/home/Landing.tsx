'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function Landing() {
  const { t } = useLocale()
  const feats = [t.featUpload, t.featChunk, t.featVector, t.featSearch, t.featStream]

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div>
        <h1 className="display text-6xl leading-none tracking-[-0.03em] text-[#ffaa00] sm:text-7xl">{t.brand}</h1>
        <p className="mt-4 text-2xl text-[#f4e6c8]">{t.product}</p>
        <p className="mt-5 max-w-[42rem] text-lg leading-relaxed text-[#f4e6c8]/80">{t.heroLead}</p>
        <div className="filament mt-8" />
        <Link href="/desk" className="btn mt-8 inline-block">
          {t.enter}
        </Link>
      </div>
      <div className="relative">
        <div className="paper-stack" aria-hidden />
        <motion.ul
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="sheet relative space-y-3 p-8"
        >
        {feats.map((feat) => (
          <li key={feat} className="flex items-center gap-3 border-b border-[#f4e6c8]/10 py-3 last:border-0">
            <span className="h-2 w-2 rounded-full bg-[#ff7a00]" />
            {feat}
          </li>
        ))}
        </motion.ul>
      </div>
    </div>
  )
}
