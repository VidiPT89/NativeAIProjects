import { indexDocument } from '../src/lib/index-document'

const SAMPLE = `FOLIO — notas de exemplo sobre calistenia.

\f

Progressão básica
O plano começa com flexões, agachamentos, prancha e elevações assistidas.
Cada sessão tem aquecimento de cinco minutos, bloco de força e um fecho de mobilidade.

\f

Recuperação
O sono e a proteína importam tanto como as séries. Sem recuperação o volume não cola.
Se a dor articular persistir mais de três dias, reduz a carga e troca o padrão.`

async function main() {
  const existing = await import('../src/lib/prisma').then((mod) =>
    mod.prisma.document.findFirst({ where: { title: 'Notas de calistenia' } }),
  )
  if (existing) return
  await indexDocument('Notas de calistenia', SAMPLE, 3)
}

main()
  .then(async () => {
    const { prisma } = await import('../src/lib/prisma')
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    process.exit(1)
  })
