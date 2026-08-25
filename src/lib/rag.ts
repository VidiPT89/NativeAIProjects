export const EMBEDDING_DIM = 1536
export const CHUNK_SIZE = 900
export const CHUNK_OVERLAP = 140

export type TextChunk = {
  content: string
  page: number
}

export function chunkText(text: string, pageHint = 1): TextChunk[] {
  const cleaned = text.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim()
  if (!cleaned) return []

  const pages = cleaned.split(/\f+/)
  const out: TextChunk[] = []

  pages.forEach((pageText, index) => {
    const page = pages.length > 1 ? index + 1 : pageHint
    const body = pageText.trim()
    if (!body) return

    if (body.length <= CHUNK_SIZE) {
      out.push({ content: body, page })
      return
    }

    let start = 0
    while (start < body.length) {
      const end = Math.min(body.length, start + CHUNK_SIZE)
      let slice = body.slice(start, end)
      if (end < body.length) {
        const lastBreak = Math.max(slice.lastIndexOf('\n'), slice.lastIndexOf('. '), slice.lastIndexOf(' '))
        if (lastBreak > CHUNK_SIZE * 0.5) slice = slice.slice(0, lastBreak + 1)
      }
      const content = slice.trim()
      if (content) out.push({ content, page })
      if (end >= body.length) break
      start += Math.max(slice.length - CHUNK_OVERLAP, 1)
    }
  })

  return out
}

function fnv1a(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function lexicalEmbedding(text: string): number[] {
  const vector = new Array<number>(EMBEDDING_DIM).fill(0)
  const tokens = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 2)

  for (const token of tokens) {
    const a = fnv1a(token) % EMBEDDING_DIM
    const b = fnv1a(`b:${token}`) % EMBEDDING_DIM
    vector[a] += 1
    vector[b] += 0.5
  }

  return l2Normalize(vector)
}

export function l2Normalize(vector: number[]): number[] {
  const mag = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1
  return vector.map((value) => value / mag)
}

export function cosine(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length)
  let dot = 0
  let magA = 0
  let magB = 0
  for (let i = 0; i < n; i += 1) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  return dot / ((Math.sqrt(magA) || 1) * (Math.sqrt(magB) || 1))
}

export function toVectorLiteral(values: number[]): string {
  return `[${values.map((value) => value.toFixed(8)).join(',')}]`
}
