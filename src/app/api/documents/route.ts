import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractPdfText, titleFromFilename } from '@/lib/pdf'
import { indexDocument } from '@/lib/index-document'

export async function GET() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { chunks: true } } },
  })
  return NextResponse.json(documents)
}

export async function POST(request: NextRequest) {
  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file' }, { status: 400 })
  }

  try {
    const buffer = await file.arrayBuffer()
    const { text, pageCount } = await extractPdfText(buffer)
    const document = await indexDocument(titleFromFilename(file.name), text, pageCount)
    return NextResponse.json(document)
  } catch (error) {
    const message = error instanceof Error && error.message === 'empty' ? 'empty' : 'pdf'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
