import assert from 'node:assert/strict'
import { test } from 'node:test'
import { chunkText, cosine, lexicalEmbedding } from '../src/lib/rag'
import { clipHistory, pickHits, rejectPdf } from '../src/lib/chat'

test('chunkText splits long pages and keeps page numbers', () => {
  const page = `${'flexões '.repeat(80)}\f${'agachamentos '.repeat(80)}`
  const chunks = chunkText(page)
  assert.ok(chunks.length >= 2)
  assert.equal(chunks[0].page, 1)
  assert.equal(chunks.at(-1)?.page, 2)
})

test('lexical embeddings rank a matching query above noise', () => {
  const aboutPushups = lexicalEmbedding('flexões no chão com o peito perto do solo')
  const aboutSleep = lexicalEmbedding('sono profundo e recuperação muscular')
  const query = lexicalEmbedding('como fazer flexões')
  assert.ok(cosine(query, aboutPushups) > cosine(query, aboutSleep))
})

test('empty text produces no chunks', () => {
  assert.deepEqual(chunkText('   '), [])
})

test('PDF guard rejects the wrong type and oversized files', () => {
  assert.equal(rejectPdf({ name: 'notes.txt', type: 'text/plain', size: 12 }), 'type')
  assert.equal(rejectPdf({ name: 'notes.pdf', type: 'application/pdf', size: 16 * 1024 * 1024 }), 'size')
  assert.equal(rejectPdf({ name: 'notes.pdf', type: 'application/pdf', size: 1200 }), null)
})

test('chat history keeps the last turns and clips long bodies', () => {
  const lines = clipHistory(
    [
      { role: 'user', content: 'a' },
      { role: 'assistant', content: 'b'.repeat(900) },
      { role: 'user', content: 'c' },
    ],
    2,
    10,
  )
  assert.equal(lines.length, 2)
  assert.equal(lines[0].content.length, 10)
  assert.equal(lines[1].content, 'c')
})

test('pickHits prefers scores above the floor', () => {
  const rows = pickHits(
    [
      { score: 0.01 },
      { score: 0.2 },
      { score: 0.09 },
    ],
    0.04,
    5,
  )
  assert.deepEqual(
    rows.map((row) => row.score),
    [0.2, 0.09],
  )
})
