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
    .filter((line) => line.content.trim())
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
