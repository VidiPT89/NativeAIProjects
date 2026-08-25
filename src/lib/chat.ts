export const MAX_PDF_BYTES = 15 * 1024 * 1024

export type PdfReject = 'type' | 'size' | null

export function rejectPdf(file: { name: string; type: string; size: number }): PdfReject {
  const name = file.name.toLowerCase()
  const pdf = file.type === 'application/pdf' || name.endsWith('.pdf')
  if (!pdf) return 'type'
  if (file.size > MAX_PDF_BYTES) return 'size'
  return null
}

export type ChatLine = { role: 'user' | 'assistant'; content: string }

export function clipHistory(lines: ChatLine[], maxTurns = 6, maxChars = 700): ChatLine[] {
  return lines
    .filter((line) => (line.role === 'user' || line.role === 'assistant') && line.content.trim())
    .slice(-maxTurns)
    .map((line) => ({
      role: line.role,
      content: line.content.trim().slice(0, maxChars),
    }))
}

export function pickHits<T extends { score: number }>(rows: T[], min = 0.04, limit = 5): T[] {
  const strong = rows.filter((row) => row.score >= min)
  return (strong.length ? strong : rows).slice(0, limit)
}

export function filledKey(value?: string): boolean {
  return (value?.trim().length ?? 0) > 8
}

export function clipQuestion(text: string, max = 4000): string {
  return text.trim().slice(0, max)
}

export function parseSseBlock(block: string): { type: string; text?: string; sources?: unknown } | null {
  const line = block.replace(/^data: /, '').trim()
  if (!line) return null
  try {
    return JSON.parse(line) as { type: string; text?: string; sources?: unknown }
  } catch {
    return null
  }
}
