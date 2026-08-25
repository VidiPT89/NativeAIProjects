import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { embed, streamText } from 'ai'
import { filledKey } from '@/lib/chat'
import { EMBEDDING_DIM, lexicalEmbedding, l2Normalize } from '@/lib/rag'

export function hasLiveModel(): boolean {
  return filledKey(process.env.OPENAI_API_KEY) || filledKey(process.env.ANTHROPIC_API_KEY)
}

export async function embedText(text: string): Promise<number[]> {
  if (filledKey(process.env.OPENAI_API_KEY)) {
    const result = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: text,
    })
    return l2Normalize(result.embedding.slice(0, EMBEDDING_DIM))
  }
  return lexicalEmbedding(text)
}

export function chatModel() {
  if (filledKey(process.env.OPENAI_API_KEY)) {
    const id = process.env.AI_MODEL
    return openai(id && !id.startsWith('claude') ? id : 'gpt-4o-mini')
  }
  if (filledKey(process.env.ANTHROPIC_API_KEY)) {
    const id = process.env.AI_MODEL
    return anthropic(id && id.startsWith('claude') ? id : 'claude-3-5-haiku-latest')
  }
  return null
}

export { streamText }
