import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { embed, streamText } from 'ai'
import { EMBEDDING_DIM, lexicalEmbedding, l2Normalize } from '@/lib/rag'

export function hasLiveModel(): boolean {
  return Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)
}

export async function embedText(text: string): Promise<number[]> {
  if (process.env.OPENAI_API_KEY) {
    const result = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: text,
    })
    return l2Normalize(result.embedding.slice(0, EMBEDDING_DIM))
  }
  return lexicalEmbedding(text)
}

export function chatModel() {
  if (process.env.OPENAI_API_KEY) {
    return openai(process.env.AI_MODEL || 'gpt-4o-mini')
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic(process.env.AI_MODEL || 'claude-3-5-haiku-latest')
  }
  return null
}

export { streamText }
