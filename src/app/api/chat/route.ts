import { NextRequest } from 'next/server'
import { chatModel, hasLiveModel, streamText } from '@/lib/models'
import { searchChunks } from '@/lib/index-document'

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { question?: string; documentId?: string; locale?: string }
  const question = body.question?.trim()
  if (!question) {
    return new Response(JSON.stringify({ error: 'question' }), { status: 400 })
  }

  const locale = body.locale === 'en' ? 'en' : 'pt'
  const hits = await searchChunks(question, body.documentId)
  const sources = hits.map((hit) => ({
    title: hit.title,
    page: hit.page,
    score: hit.score,
    excerpt: hit.content.slice(0, 220),
  }))
  const context = hits
    .map((hit, index) => `[${index + 1}] ${hit.title} (p.${hit.page})\n${hit.content}`)
    .join('\n\n')

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(sse({ type: 'sources', sources })))

      const model = chatModel()
      if (model && hasLiveModel()) {
        const result = streamText({
          model,
          system:
            locale === 'en'
              ? 'Answer only from the provided excerpts. Cite sources as [n]. If the excerpts do not contain the answer, say so. Reply in English.'
              : 'Responde só com os excertos dados. Cita fontes como [n]. Se os excertos não chegarem, diz-o. Responde em português de Portugal.',
          prompt: `Context:\n${context || '(empty)'}\n\nQuestion: ${question}`,
        })
        for await (const delta of result.textStream) {
          controller.enqueue(encoder.encode(sse({ type: 'text', text: delta })))
        }
      } else {
        const answer = lexicalAnswer(question, hits, locale)
        for (const word of answer.split(/(\s+)/)) {
          controller.enqueue(encoder.encode(sse({ type: 'text', text: word })))
        }
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}

function lexicalAnswer(
  question: string,
  hits: { title: string; page: number; content: string }[],
  locale: 'pt' | 'en',
) {
  if (!hits.length) {
    return locale === 'en'
      ? 'I did not find matching passages in the indexed documents.'
      : 'Não encontrei passagens que batam com a pergunta nos documentos indexados.'
  }

  const lead =
    locale === 'en'
      ? `From the closest passages to “${question}”:`
      : `Com as passagens mais próximas de “${question}”:`
  const body = hits
    .slice(0, 3)
    .map((hit, index) => `[${index + 1}] ${hit.title}, p.${hit.page}: ${hit.content.slice(0, 320)}`)
    .join('\n\n')
  return `${lead}\n\n${body}`
}
