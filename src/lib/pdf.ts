import { extractText, getDocumentProxy } from 'unpdf'

export async function extractPdfText(buffer: ArrayBuffer): Promise<{ text: string; pageCount: number }> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer))
  const { text, totalPages } = await extractText(pdf, { mergePages: false })
  const pages = Array.isArray(text) ? text : [text]
  const joined = pages.map((page) => page.trim()).filter(Boolean).join('\f')
  return { text: joined, pageCount: totalPages || pages.length || 1 }
}

export function titleFromFilename(name: string): string {
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || name
}
