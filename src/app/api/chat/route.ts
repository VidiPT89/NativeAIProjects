import { NextRequest } from 'next/server'
import { chatModel, hasLiveModel, streamText } from '@/lib/models'
import { searchChunks } from '@/lib/index-document'
import { clipHistory, clipQuestion, type ChatLine } from '@/lib/chat'

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`
}

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    question?: string
    documentId?: string
    locale?: string
    history?: ChatLine[]
  }
  const question = clipQuestion(body.question ?? '')
  if (!question) {
    return new Response(JSON.stringify({ error: 'question' }), { status: 400 })
  }

  const locale = body.locale === 'en' ? 'en' : 'pt'
  const hits = await searchChunks(question, body.documentId)
  const sources = hits.map((hit) => ({
    title: hit.title,
    page: hit.page,
    score: hit.score,
    excerpt: hit.content.slice(0, 280),
  }))
  const context = hits
    .map((hit, index) => `[${index + 1}] ${hit.title} (p.${hit.page})\n${hit.content}`)
    .join('\n\n')
  const history = clipHistory(body.history ?? [])

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => controller.enqueue(encoder.encode(sse(data)))
      send({ type: 'sources', sources })

      try {
        const model = chatModel()
        if (model && hasLiveModel()) {
          const result = streamText({
            model,
            system:
              locale === 'en'
                ? `You are FOLIO. Answer only from the excerpts. Cite them as [n]. If they do not contain the answer, say so. Reply in English.\n\nExcerpts:\n${context || '(empty)'}`
                : `És o FOLIO. Responde só com os excertos. Cita-os como [n]. Se não chegarem, diz-o. Português de Portugal.\n\nExcertos:\n${context || '(vazio)'}`,
            messages: [
              ...history.map((line) => ({ role: line.role, content: line.content })),
              { role: 'user' as const, content: question },
            ],
          })
          for await (const delta of result.textStream) {
            send({ type: 'text', text: delta })
          }
        } else {
          const answer = lexicalAnswer(question, hits, locale)
          for (const word of answer.split(/(\s+)/)) {
            send({ type: 'text', text: word })
          }
        }
      } catch {
        send({
          type: 'text',
          text:
            locale === 'en'
              ? ' The model could not finish this answer. Try again in a moment.'
              : ' O modelo não conseguiu acabar a resposta. Tenta outra vez daqui a pouco.',
        })
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
