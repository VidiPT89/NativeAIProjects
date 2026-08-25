import { prisma } from '@/lib/prisma'
import { chunkText, toVectorLiteral, type TextChunk } from '@/lib/rag'
import { embedText } from '@/lib/models'
import { randomUUID } from 'node:crypto'

export async function indexDocument(title: string, text: string, pageCount: number) {
  const pieces = chunkText(text)
  if (!pieces.length) {
    throw new Error('empty')
  }

  const document = await prisma.document.create({
    data: { title, pageCount: pageCount || Math.max(...pieces.map((piece) => piece.page)) },
  })

  await insertChunks(document.id, pieces)
  return document
}

export async function insertChunks(documentId: string, pieces: TextChunk[]) {
  for (const piece of pieces) {
    const embedding = await embedText(piece.content)
    const id = randomUUID()
    const vector = toVectorLiteral(embedding)
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Chunk" (id, "documentId", content, page, embedding, "createdAt")
       VALUES ($1, $2, $3, $4, $5::vector, NOW())`,
      id,
      documentId,
      piece.content,
      piece.page,
      vector,
    )
  }
}

export type RetrievedChunk = {
  id: string
  content: string
  page: number
  documentId: string
  title: string
  score: number
}

export async function searchChunks(query: string, documentId?: string, limit = 6): Promise<RetrievedChunk[]> {
  const embedding = await embedText(query)
  const vector = toVectorLiteral(embedding)
  const rows = documentId
    ? await prisma.$queryRawUnsafe<RetrievedChunk[]>(
        `SELECT c.id, c.content, c.page, c."documentId", d.title,
                (1 - (c.embedding <=> $1::vector))::float AS score
         FROM "Chunk" c
         JOIN "Document" d ON d.id = c."documentId"
         WHERE c."documentId" = $2
         ORDER BY c.embedding <=> $1::vector
         LIMIT $3`,
        vector,
        documentId,
        limit,
      )
    : await prisma.$queryRawUnsafe<RetrievedChunk[]>(
        `SELECT c.id, c.content, c.page, c."documentId", d.title,
                (1 - (c.embedding <=> $1::vector))::float AS score
         FROM "Chunk" c
         JOIN "Document" d ON d.id = c."documentId"
         ORDER BY c.embedding <=> $1::vector
         LIMIT $2`,
        vector,
        limit,
      )

  return rows
}
