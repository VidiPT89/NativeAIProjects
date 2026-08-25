import assert from 'node:assert/strict'
import { test } from 'node:test'
import { chunkText, cosine, lexicalEmbedding } from '../src/lib/rag'

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
