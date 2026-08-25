'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

type Doc = {
  id: string
  title: string
  pageCount: number
  createdAt: string
  _count: { chunks: number }
}

type Source = { title: string; page: number; score: number; excerpt: string }

type ChatTurn = {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}

export function Desk() {
  const { t, locale } = useLocale()
  const [docs, setDocs] = useState<Doc[]>([])
  const [selected, setSelected] = useState<string>('all')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [question, setQuestion] = useState('')
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [drag, setDrag] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadDocs = useCallback(async () => {
    const res = await fetch('/api/documents')
    if (res.ok) setDocs((await res.json()) as Doc[])
  }, [])

  useEffect(() => {
    void loadDocs()
  }, [loadDocs])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns])

  async function upload(file: File) {
    setBusy(true)
    setError('')
    const body = new FormData()
    body.append('file', file)
    const res = await fetch('/api/documents', { method: 'POST', body })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      setError(data.error === 'empty' ? t.errorEmpty : t.errorPdf)
    } else {
      await loadDocs()
    }
    setBusy(false)
  }

  async function remove(id: string) {
    await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    if (selected === id) setSelected('all')
    await loadDocs()
  }

  async function ask() {
    const text = question.trim()
    if (!text || busy) return
    setQuestion('')
    const userTurn: ChatTurn = { id: crypto.randomUUID(), role: 'user', content: text }
    setTurns((prev) => [...prev, userTurn])
    setBusy(true)
    setError('')

    const assistantId = crypto.randomUUID()
    setTurns((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          documentId: selected === 'all' ? undefined : selected,
          locale,
        }),
      })
      if (!res.ok || !res.body) throw new Error('chat')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let answer = ''
      let sources: Source[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''
        for (const part of parts) {
          const line = part.replace(/^data: /, '').trim()
          if (!line) continue
          const event = JSON.parse(line) as { type: string; text?: string; sources?: Source[] }
          if (event.type === 'sources' && event.sources) sources = event.sources
          if (event.type === 'text' && event.text) {
            answer += event.text
            setTurns((prev) =>
              prev.map((turn) => (turn.id === assistantId ? { ...turn, content: answer, sources } : turn)),
            )
          }
        }
      }
    } catch {
      setError(t.errorChat)
      setTurns((prev) => prev.filter((turn) => turn.id !== assistantId && turn.id !== userTurn.id))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="sheet p-5">
        <h2 className="display text-2xl tracking-[0.16em] text-[#ffaa00]">{t.documents}</h2>
        <label
          className={`mt-4 block cursor-pointer rounded-2xl border border-dashed px-4 py-8 text-center text-sm ${
            drag ? 'border-[#ff7a00] bg-[#ff7a00]/10' : 'border-[#f4e6c8]/25'
          }`}
          onDragOver={(event) => {
            event.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDrag(false)
            const file = event.dataTransfer.files[0]
            if (file) void upload(file)
          }}
        >
          {busy ? t.uploading : t.drop}
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void upload(file)
              event.target.value = ''
            }}
          />
        </label>
        <button type="button" className="btn mt-3 w-full" onClick={() => fileRef.current?.click()} disabled={busy}>
          {t.upload}
        </button>
        <p className="mt-3 text-xs text-[#f4e6c8]/55">{t.demoHint}</p>
        <div className="filament my-4" />
        <button
          type="button"
          className={`mb-2 w-full rounded-xl px-3 py-2 text-left text-sm ${selected === 'all' ? 'bg-[#ff7a00] text-black' : 'hover:bg-[#ff7a00]/10'}`}
          onClick={() => setSelected('all')}
        >
          {t.allDocs}
        </button>
        <ul className="space-y-2">
          {docs.length === 0 ? <li className="text-sm text-[#f4e6c8]/60">{t.emptyDocs}</li> : null}
          {docs.map((doc) => (
            <li key={doc.id} className="flex items-start gap-2">
              <button
                type="button"
                className={`flex-1 rounded-xl px-3 py-2 text-left ${selected === doc.id ? 'bg-[#ff7a00] text-black' : 'hover:bg-[#ff7a00]/10'}`}
                onClick={() => setSelected(doc.id)}
              >
                <span className="block font-semibold">{doc.title}</span>
                <span className="block text-xs opacity-80">
                  {doc.pageCount} {t.pages} · {doc._count.chunks} {t.chunks}
                </span>
              </button>
              <button type="button" className="btn-ghost text-xs" onClick={() => void remove(doc.id)}>
                {t.delete}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="sheet flex min-h-[70vh] flex-col p-5">
        <h2 className="display text-2xl tracking-[0.16em] text-[#ffaa00]">{t.ask}</h2>
        <div ref={listRef} className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
          {turns.length === 0 ? <p className="text-[#f4e6c8]/60">{t.emptyChat}</p> : null}
          <AnimatePresence>
            {turns.map((turn) => (
              <motion.article
                key={turn.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl px-4 py-3 ${turn.role === 'user' ? 'ml-8 bg-[#ff7a00]/15' : 'mr-8 bg-black/40'}`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {turn.content || (busy ? t.thinking : '')}
                </p>
                {turn.sources?.length ? (
                  <ul className="mt-3 space-y-1 text-xs text-[#ffaa00]">
                    <li className="font-bold uppercase tracking-wider text-[#f4e6c8]/70">{t.sources}</li>
                    {turn.sources.map((source, index) => (
                      <li key={`${source.title}-${index}`}>
                        {source.title} · {t.page} {source.page}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
        {error ? <p className="mt-3 text-sm text-[#ff7a00]">{error}</p> : null}
        <form
          className="mt-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            void ask()
          }}
        >
          <input
            className="field"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={t.placeholder}
            disabled={busy}
          />
          <button type="submit" className="btn shrink-0" disabled={busy || !question.trim()}>
            {t.send}
          </button>
        </form>
      </section>
    </div>
  )
}
