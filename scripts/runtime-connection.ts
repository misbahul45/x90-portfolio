#!/usr/bin/env bun
/**
 * scripts/runtime-connection.ts
 *
 * Prove the production app runtime can talk to Neon DB via the
 * PrismaNeon adapter (HTTP/WebSocket transport for the Neon pooler).
 */

import { PrismaClient } from '../src/generated/prisma/client.ts'
import { PrismaNeon } from '@prisma/adapter-neon'

async function probe() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL missing')

  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) })

  const start = performance.now()
  const ok = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 as ok`
  const latency = Math.round(performance.now() - start)
  if (ok.length !== 1 || Number(ok[0]?.ok) !== 1) {
    throw new Error(`unexpected SELECT 1 result: ${JSON.stringify(ok)}`)
  }
  console.log(`runtime.db SELECT 1 ok  (${latency} ms)`)

  const projects = await prisma.project.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, slug: true, title: true, status: true },
    take: 5,
  })
  console.log(`runtime.project.findMany(PUBLISHED) ok  count=${projects.length}`)

  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, slug: true, title: true, status: true },
    take: 5,
  })
  console.log(`runtime.article.findMany(PUBLISHED) ok  count=${articles.length}`)

  if (projects.length > 0) {
    const slug = projects[0]!.slug
    const detail = await prisma.project.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: { category: true, research: { include: { article: true } } },
    })
    if (!detail) throw new Error(`detail lookup failed for ${slug}`)
    console.log(
      `runtime.project.findFirst(${slug}) ok  category=${detail.category?.name ?? '—'}  research_links=${detail.research.length}`,
    )
  }

  await prisma.$disconnect()
}

probe()
  .then(() => console.log('runtime connection verified.'))
  .catch((error) => {
    console.error('runtime connection FAILED:', error)
    process.exit(1)
  })
