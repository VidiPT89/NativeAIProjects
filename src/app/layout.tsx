import type { Metadata } from 'next'
import { Barlow_Condensed, Karla } from 'next/font/google'
import { Providers } from '@/components/layout/Providers'
import { SiteChrome } from '@/components/layout/SiteChrome'
import './globals.css'

const display = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
})

const body = Karla({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'FOLIO · Chat with your PDF',
  description: 'Upload a PDF, retrieve relevant chunks with pgvector and stream cited answers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {/* FOLIO: night desk for paper. Black, burnt orange, amber. Upload, ask, cited stream. */}
        <Providers>
          <div className="sky" aria-hidden>
            <span className="ember e1" />
            <span className="ember e2" />
          </div>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  )
}
