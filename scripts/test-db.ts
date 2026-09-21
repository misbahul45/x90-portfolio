#!/usr/bin/env bun
/**
 * scripts/test-db.ts
 *
 * Non-destructive DB audit. Exercises one read per model + one CRUD cycle on
 * feedback (create → update → read → delete) + public-boundary probe for DRAFT.
 */

import { PrismaClient } from '../src/generated/prisma/client.ts'
import { PrismaNeon } from '@prisma/adapter-neon'

type Result = { name: string; ok: boolean; detail: string }

const results: Result[] = []

function record(name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail })
  const tag = ok ? '[32mPASS[0m' : '[31mFAIL[0m'
  console.log(`${tag}  ${name}  ${detail}`)
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL missing')
  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) })

  try {
    const userCount = await prisma.user.count()
    record('read: user', true, `count=${userCount}`)

    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    record('read: admin exists', !!admin, admin ? `email=${admin.email}` : 'no ADMIN user')

    const articleCount = await prisma.article.count()
    const publishedCount = await prisma.article.count({ where: { status: 'PUBLISHED' } })
    record('read: article total', true, `count=${articleCount}`)
    record('read: article published', true, `count=${publishedCount}`)
    record('seed: published article >=1', publishedCount >= 1, `count=${publishedCount}`)

    const projectCount = await prisma.project.count()
    const projectPublishedCount = await prisma.project.count({ where: { status: 'PUBLISHED' } })
    record('read: project total', true, `count=${projectCount}`)
    record('read: project published', true, `count=${projectPublishedCount}`)
    record('seed: published project >=1', projectPublishedCount >= 1, `count=${projectPublishedCount}`)

    const categoryCount = await prisma.category.count()
    record('read: category', true, `count=${categoryCount}`)
    record('seed: categories >=4', categoryCount >= 4, `count=${categoryCount}`)

    const tagCount = await prisma.tag.count()
    record('read: tag', true, `count=${tagCount}`)
    record('seed: tags >=3', tagCount >= 3, `count=${tagCount}`)

    record('read: team_member', true, `count=${await prisma.teamMember.count()}`)
    record('read: feedback', true, `count=${await prisma.feedback.count()}`)
    record('read: brief', true, `count=${await prisma.brief.count()}`)

    const prCount = await prisma.projectResearch.count()
    record('read: project_research', true, `count=${prCount}`)
    record('relation: project<->research link', prCount > 0, `links=${prCount}`)

    record('read: uploaded_file', true, `count=${await prisma.uploadedFile.count()}`)
    record('read: background_job', true, `count=${await prisma.backgroundJob.count()}`)

    // WRITE cycle on feedback
    const stamp = `audit_${Date.now()}`
    const created = await prisma.feedback.create({
      data: { name: 'Audit Probe', email: 'audit@example.com', message: stamp, type: 'GENERAL', status: 'NEW' },
    })
    record('write: feedback create', !!created.id, `id=${created.id}`)

    const updated = await prisma.feedback.update({ where: { id: created.id }, data: { status: 'READ' } })
    record('write: feedback update', updated.status === 'READ', `status=${updated.status}`)

    const found = await prisma.feedback.findUnique({ where: { id: created.id } })
    record('write: feedback read after update', !!found && found.status === 'READ', `status=${found?.status}`)

    const deleted = await prisma.feedback.delete({ where: { id: created.id } })
    record('write: feedback delete', deleted.id === created.id, `deleted=${deleted.id}`)

    // Public boundary probe
    const draftProj = await prisma.project.create({
      data: {
        title: `Audit Draft ${stamp}`,
        slug: `audit-draft-${stamp}`,
        description: 'must not surface publicly',
        content: JSON.stringify({ type: 'doc', content: [] }),
        technologies: [],
        status: 'DRAFT',
      },
    })
    const pubProj = await prisma.project.findMany({ where: { status: 'PUBLISHED' }, select: { id: true } })
    record('boundary: DRAFT project hidden', !pubProj.some((p) => p.id === draftProj.id), pubProj.length > 0 ? 'ok' : 'public empty')
    await prisma.project.delete({ where: { id: draftProj.id } })

    if (admin) {
      const draftArt = await prisma.article.create({
        data: {
          title: `Audit Draft Article ${stamp}`,
          slug: `audit-draft-article-${stamp}`,
          excerpt: 'must not surface publicly',
          content: JSON.stringify({ type: 'doc', content: [] }),
          status: 'DRAFT',
          authorId: admin.id,
        },
      })
      const pubArt = await prisma.article.findMany({ where: { status: 'PUBLISHED' }, select: { id: true } })
      record('boundary: DRAFT article hidden', !pubArt.some((a) => a.id === draftArt.id), pubArt.length > 0 ? 'ok' : 'public empty')
      await prisma.article.delete({ where: { id: draftArt.id } })
    } else {
      record('boundary: DRAFT article hidden', true, 'skipped (no admin)')
    }

    // ProjectResearch link + reverse lookup
    if (projectPublishedCount > 0 && publishedCount > 0) {
      // Probe creates a fresh article + project pair so the composite PK does
      // not collide with any pre-seeded relations.
      const probeProject = await prisma.project.create({
        data: {
          title: `Audit Link Probe ${stamp}`,
          slug: `audit-link-${stamp}`,
          description: 'audit probe',
          content: JSON.stringify({ type: 'doc', content: [] }),
          technologies: [],
          status: 'DRAFT',
        },
      })
      const probeArticle = admin
        ? await prisma.article.create({
            data: {
              title: `Audit Link Article ${stamp}`,
              slug: `audit-link-article-${stamp}`,
              excerpt: 'audit probe',
              content: JSON.stringify({ type: 'doc', content: [] }),
              status: 'DRAFT',
              authorId: admin.id,
            },
          })
        : null
      if (probeArticle) {
        try {
          const link = await prisma.projectResearch.create({
            data: { projectId: probeProject.id, articleId: probeArticle.id, relation: 'audit' },
          })
          record('write: project_research link', !!link, `${link.projectId}->${link.articleId}`)
        } catch (error) {
          record('write: project_research link', false, error instanceof Error ? error.message : 'unknown')
        }
        await prisma.article.delete({ where: { id: probeArticle.id } })
      } else {
        record('write: project_research link', true, 'skipped (no admin)')
      }
      await prisma.project.delete({ where: { id: probeProject.id } })
    }
  } catch (error) {
    record('runtime: error', false, error instanceof Error ? error.message : String(error))
  } finally {
    await prisma.$disconnect()
  }

  const failed = results.filter((r) => !r.ok)
  console.log('')
  console.log(`Total: ${results.length}  Failed: ${failed.length}`)
  if (failed.length > 0) {
    console.log('Failures:')
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Fatal:', error)
  process.exit(1)
})
