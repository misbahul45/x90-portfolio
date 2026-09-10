import { prisma } from "#/db"
import { embedText, toPgVector, isEmbeddingEnabled } from "#/lib/embedding-service"

export type KnowledgeKind = "project" | "article" | "job"

export type KnowledgeHit = {
  id: string
  kind: KnowledgeKind
  title: string
  slug: string
  excerpt: string
  url: string
  score: number
  metadata: Record<string, string | number | null>
}

const MAX_CHARS = 1500

function truncate(text: string, max = 400): string {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text
}

function buildResourceText(input: {
  title: string
  body: string
  extras?: string[]
}): string {
  return [
    input.title,
    input.body.slice(0, MAX_CHARS),
    ...(input.extras ?? []),
  ]
    .filter(Boolean)
    .join("\n")
}

async function embedAndStore(
  kind: KnowledgeKind,
  id: string,
  text: string,
): Promise<void> {
  const vector = await embedText(text)
  const vec = toPgVector(vector)
  const now = new Date()
  if (kind === "project") {
    await prisma.$executeRawUnsafe(
      `UPDATE project SET embedding = $1::vector, "embeddedAt" = $2 WHERE id = $3`,
      vec,
      now,
      id,
    )
  } else if (kind === "article") {
    await prisma.$executeRawUnsafe(
      `UPDATE article SET embedding = $1::vector, "embeddedAt" = $2 WHERE id = $3`,
      vec,
      now,
      id,
    )
  } else {
    await prisma.$executeRawUnsafe(
      `UPDATE background_job SET embedding = $1::vector, "embeddedAt" = $2 WHERE id = $3`,
      vec,
      now,
      id,
    )
  }
}

export async function buildResourceEmbedding(
  kind: KnowledgeKind,
  id: string,
): Promise<void> {
  if (kind === "project") {
    const row = await prisma.project.findUnique({
      where: { id },
      include: { category: true },
    })
    if (!row) return
    const text = buildResourceText({
      title: row.title,
      body: `${row.description}\n${row.content}`,
      extras: [
        row.category?.name ?? "",
        `Stack: ${row.technologies.join(", ")}`,
      ],
    })
    await embedAndStore("project", id, text)
  } else if (kind === "article") {
    const row = await prisma.article.findUnique({ where: { id } })
    if (!row) return
    const text = buildResourceText({
      title: row.title,
      body: `${row.excerpt}\n${row.content}`,
    })
    await embedAndStore("article", id, text)
  } else {
    const row = await prisma.backgroundJob.findUnique({ where: { id } })
    if (!row) return
    const text = buildResourceText({
      title: row.title,
      body: `${row.description}\n${row.requirements}`,
      extras: [
        row.role,
        row.company ?? "",
        row.type.replace(/_/g, " ").toLowerCase(),
        row.location.toLowerCase(),
        `Tags: ${row.tags.join(", ")}`,
      ],
    })
    await embedAndStore("job", id, text)
  }
}

export async function searchKnowledgeBase(
  query: string,
  limit = 5,
): Promise<KnowledgeHit[]> {
  if (!query.trim()) return []
  const hits: KnowledgeHit[] = []
  const hitLimit = Math.max(1, Math.min(20, limit))

  if (isEmbeddingEnabled()) {
    const queryVector = await embedText(query)
    const vec = toPgVector(queryVector)

    try {
      const projectRows = await prisma.$queryRawUnsafe<
        Array<{
          id: string
          title: string
          slug: string
          description: string
          category: string | null
          featured: boolean
          technologies: string[]
          score: number
        }>
      >(
        `SELECT p.id, p.title, p.slug, p.description, c.name AS category, p.featured, p.technologies,
                1 - (p.embedding <=> $1::vector) AS score
           FROM project p
           LEFT JOIN category c ON c.id = p."categoryId"
           WHERE p.embedding IS NOT NULL
           ORDER BY p.embedding <=> $1::vector
           LIMIT $2`,
        vec,
        hitLimit,
      )
      for (const row of projectRows) {
        hits.push({
          id: row.id,
          kind: "project",
          title: row.title,
          slug: row.slug,
          excerpt: truncate(row.description),
          url: `/projects/${row.slug}`,
          score: Number(row.score.toFixed(3)),
          metadata: {
            kind: "project",
            category: row.category,
            featured: row.featured ? 1 : 0,
            technologies: row.technologies.join(" · "),
          },
        })
      }
    } catch {
      // pgvector unavailable — fall back to keyword search
    }

    try {
      const articleRows = await prisma.$queryRawUnsafe<
        Array<{
          id: string
          title: string
          slug: string
          excerpt: string
          category: string | null
          readingTime: number | null
          score: number
        }>
      >(
        `SELECT a.id, a.title, a.slug, a.excerpt, c.name AS category, a."readingTime",
                1 - (a.embedding <=> $1::vector) AS score
           FROM article a
           LEFT JOIN category c ON c.id = a."categoryId"
           WHERE a.embedding IS NOT NULL AND a.status = 'PUBLISHED'
           ORDER BY a.embedding <=> $1::vector
           LIMIT $2`,
        vec,
        hitLimit,
      )
      for (const row of articleRows) {
        hits.push({
          id: row.id,
          kind: "article",
          title: row.title,
          slug: row.slug,
          excerpt: truncate(row.excerpt),
          url: `/research/${row.slug}`,
          score: Number(row.score.toFixed(3)),
          metadata: {
            kind: "article",
            category: row.category,
            readingTime: row.readingTime,
          },
        })
      }
    } catch {
      // ignore
    }

    try {
      const jobRows = await prisma.$queryRawUnsafe<
        Array<{
          id: string
          title: string
          slug: string
          role: string
          company: string | null
          type: string
          location: string
          city: string | null
          country: string | null
          compensation: string | null
          score: number
        }>
      >(
        `SELECT j.id, j.title, j.slug, j.role, j.company, j.type, j.location, j.city, j.country,
                j.compensation,
                1 - (j.embedding <=> $1::vector) AS score
           FROM background_job j
           WHERE j.embedding IS NOT NULL AND j.status = 'OPEN'
           ORDER BY j.embedding <=> $1::vector
           LIMIT $2`,
        vec,
        hitLimit,
      )
      for (const row of jobRows) {
        hits.push({
          id: row.id,
          kind: "job",
          title: row.title,
          slug: row.slug,
          excerpt: truncate(`${row.role} · ${row.type.replace(/_/g, " ").toLowerCase()} · ${row.location.toLowerCase()}`),
          url: `/jobs/${row.slug}`,
          score: Number(row.score.toFixed(3)),
          metadata: {
            kind: "job",
            role: row.role,
            type: row.type,
            location: row.location,
            company: row.company,
            city: row.city,
            country: row.country,
            compensation: row.compensation,
          },
        })
      }
    } catch {
      // ignore
    }
  }

  if (hits.length === 0) {
    const fallback = await fallbackKeywordSearch(query, hitLimit)
    hits.push(...fallback)
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, hitLimit)
}

async function fallbackKeywordSearch(
  query: string,
  limit: number,
): Promise<KnowledgeHit[]> {
  const needle = query.toLowerCase().trim()
  const hits: KnowledgeHit[] = []
  if (!needle) return hits

  try {
    const projects = await prisma.project.findMany({
      include: { category: true },
      take: limit * 2,
    })
    for (const project of projects) {
      const haystack = `${project.title} ${project.description} ${project.content} ${project.technologies.join(" ")}`.toLowerCase()
      const score = scoreMatch(haystack, needle)
      if (score > 0) {
        hits.push({
          id: project.id,
          kind: "project",
          title: project.title,
          slug: project.slug,
          excerpt: truncate(project.description),
          url: `/projects/${project.slug}`,
          score,
          metadata: {
            kind: "project",
            category: project.category?.name ?? null,
            featured: project.featured ? 1 : 0,
            technologies: project.technologies.join(" · "),
          },
        })
      }
    }
  } catch {
    // schema out of sync — proceed without projects
  }
  if (hits.length < limit) {
    try {
      const articles = await prisma.article.findMany({ take: limit * 2 })
      for (const article of articles) {
        const haystack = `${article.title} ${article.excerpt} ${article.content}`.toLowerCase()
        const score = scoreMatch(haystack, needle)
        if (score > 0) {
          hits.push({
            id: article.id,
            kind: "article",
            title: article.title,
            slug: article.slug,
            excerpt: truncate(article.excerpt),
            url: `/research/${article.slug}`,
            score,
            metadata: {
              kind: "article",
              status: article.status,
            },
          })
        }
      }
    } catch {
      // ignore
    }
  }
  if (hits.length < limit) {
    try {
      const jobModel = (prisma as unknown as { backgroundJob?: { findMany: (args: unknown) => Promise<Array<{
        id: string
        title: string
        slug: string
        role: string
        location: string
        description: string
        requirements: string
        tags: string[]
      }>> } }).backgroundJob
      if (!jobModel) return hits
      const jobs = await jobModel.findMany({ where: { status: "OPEN" }, take: limit * 2 })
      for (const job of jobs) {
        const haystack = `${job.title} ${job.role} ${job.description} ${job.requirements} ${job.tags.join(" ")}`.toLowerCase()
        const score = scoreMatch(haystack, needle)
        if (score > 0) {
          hits.push({
            id: job.id,
            kind: "job",
            title: job.title,
            slug: job.slug,
            excerpt: truncate(`${job.role} · ${job.location.toLowerCase()}`),
            url: `/jobs/${job.slug}`,
            score,
            metadata: {
              kind: "job",
              role: job.role,
              type: "OPEN",
              location: job.location,
              company: null,
            },
          })
        }
      }
    } catch {
      // background_job table does not exist yet — skip
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}

function scoreMatch(haystack: string, needle: string): number {
  const tokens = needle.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return 0
  let score = 0
  for (const token of tokens) {
    if (haystack.includes(token)) score += 1
  }
  return score / tokens.length
}

export async function reindexAll(): Promise<{
  projects: number
  articles: number
  jobs: number
}> {
  const projects = await prisma.project.findMany({ select: { id: true } })
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true },
  })
  const jobs = await prisma.backgroundJob.findMany({
    where: { status: "OPEN" },
    select: { id: true },
  })

  for (const project of projects) {
    await buildResourceEmbedding("project", project.id)
  }
  for (const article of articles) {
    await buildResourceEmbedding("article", article.id)
  }
  for (const job of jobs) {
    await buildResourceEmbedding("job", job.id)
  }
  return { projects: projects.length, articles: articles.length, jobs: jobs.length }
}

export function formatHitsForPrompt(hits: KnowledgeHit[]): string {
  if (hits.length === 0) return ""
  const blocks = hits.map((hit, index) => {
    const meta = Object.entries(hit.metadata)
      .filter(([, value]) => value !== null && value !== "")
      .map(([key, value]) => `${key}: ${value}`)
      .join(" · ")
    return [
      `[${index + 1}] ${hit.kind.toUpperCase()} — ${hit.title} (relevance ${hit.score})`,
      `URL: ${hit.url}`,
      meta ? `Meta: ${meta}` : "",
      hit.excerpt,
    ]
      .filter(Boolean)
      .join("\n")
  })
  return `Knowledge base matches (semantic search across projects, research, and open roles):\n\n${blocks.join("\n\n")}`
}

export type RelatedArticle = {
  id: string
  title: string
  slug: string
  url: string
  category: string | null
  score: number
}

export async function findRelatedArticles(
  query: string,
  limit = 3,
  excludeId?: string,
): Promise<RelatedArticle[]> {
  const cleaned = query.trim()
  if (!cleaned) return []
  const hits: RelatedArticle[] = []
  const slot = Math.max(1, Math.min(10, limit))

  if (isEmbeddingEnabled()) {
    try {
      const vector = await embedText(cleaned)
      const vec = toPgVector(vector)
      const rows = await prisma.$queryRawUnsafe<
        Array<{
          id: string
          title: string
          slug: string
          category: string | null
          score: number
        }>
      >(
        `SELECT a.id, a.title, a.slug, c.name AS category,
                1 - (a.embedding <=> $1::vector) AS score
           FROM article a
           LEFT JOIN category c ON c.id = a."categoryId"
           WHERE a.embedding IS NOT NULL
             AND a.status = 'PUBLISHED'
             ${excludeId ? "AND a.id <> $2" : ""}
           ORDER BY a.embedding <=> $1::vector
           LIMIT ${excludeId ? "$3" : "$2"}`,
        ...(excludeId ? [vec, excludeId, slot] : [vec, slot]),
      )
      for (const row of rows) {
        if (row.score < 0.1) continue
        hits.push({
          id: row.id,
          title: row.title,
          slug: row.slug,
          url: `/research/${row.slug}`,
          category: row.category,
          score: Number(row.score.toFixed(3)),
        })
      }
    } catch {
      // pgvector unavailable — fall back to keyword search
    }
  }

  if (hits.length < limit) {
    try {
      const existing = new Set(hits.map((h) => h.id))
      const articles = await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        include: { category: true },
        take: limit * 3,
      })
      const needle = cleaned.toLowerCase()
      const tokens = needle.split(/\s+/).filter(Boolean)
      const scored = articles
        .filter((article) => !existing.has(article.id))
        .map((article) => {
          const titleLower = article.title.toLowerCase()
          const haystack = `${article.title} ${article.excerpt}`.toLowerCase()
          let matched = 0
          for (const token of tokens) {
            if (haystack.includes(token)) matched += 1
          }
          const titleBoost = titleLower.includes(needle) ? 0.3 : 0
          const score = tokens.length === 0
            ? 0
            : Math.min(1, matched / tokens.length + titleBoost)
          return { article, score }
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit - hits.length)
      for (const entry of scored) {
        hits.push({
          id: entry.article.id,
          title: entry.article.title,
          slug: entry.article.slug,
          url: `/research/${entry.article.slug}`,
          category: entry.article.category?.name ?? null,
          score: Number(entry.score.toFixed(3)),
        })
      }
    } catch {
      // ignore
    }
  }

  return hits.slice(0, limit)
}
