import { ARTICLE_STATUS, type ArticleStatus } from "#/lib/domain/article-status"
import { prisma } from "#/db"
import { slugify } from "#/lib/slug"
import { articleCreateSchema, articleUpdateSchema } from "#/lib/schemas/article"
import type { ArticleCreateInput, ArticleUpdateInput } from "#/lib/schemas/article"

export type Page<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

type ListOptions = {
  status?: ArticleStatus
  categorySlug?: string
  page?: number
  pageSize?: number
}

const DEFAULT_PAGE_SIZE = 9

type ArticleWithRelations = NonNullable<Awaited<ReturnType<typeof prisma.article.findFirst<{ include: typeof articleInclude }>>>>

const articleInclude = {
  author: {
    select: { id: true, name: true, email: true, image: true },
  },
  category: true,
  tags: {
    include: { tag: true },
  },
} as const

function readingTimeFromContent(contentJson: string): number {
  try {
    const parsed = JSON.parse(contentJson) as {
      content?: Array<{ content?: Array<{ text?: string }> }>
    }
    const text = JSON.stringify(parsed)
    const words = text.split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.round(words / 200))
  } catch {
    return 1
  }
}

function buildPage<T>(items: T[], total: number, page: number, pageSize: number): Page<T> {
  return {
    items,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  }
}

async function ensureUniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const candidate = slugify(base)
  let slug = candidate.length > 0 ? candidate : `article-${Date.now().toString(36)}`
  let attempt = 0
  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) {
      return slug
    }
    attempt += 1
    slug = `${candidate}-${attempt + 1}`
  }
}

export const articleService = {
  async list(options: ListOptions = {}): Promise<Page<ArticleWithRelations>> {
    const where: Record<string, unknown> = {}
    if (options.status) {
      where.status = options.status
    }
    if (options.categorySlug) {
      where.category = { slug: options.categorySlug }
    }
    const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
    const page = Math.max(1, options.page ?? 1)
    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: articleInclude,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.article.count({ where }),
    ])
    return buildPage(items, total, page, pageSize)
  },

  async listAll(options: Omit<ListOptions, "page" | "pageSize"> = {}) {
    return this.list({ ...options, pageSize: 1000, page: 1 })
  },

  async listPublished(options: Omit<ListOptions, "status"> = {}) {
    return this.list({ ...options, status: ARTICLE_STATUS.PUBLISHED })
  },

  async bySlug(slug: string) {
    return prisma.article.findUnique({
      where: { slug },
      include: articleInclude,
    })
  },

  async byId(id: string) {
    return prisma.article.findUnique({
      where: { id },
      include: articleInclude,
    })
  },

  async create(input: ArticleCreateInput, authorId: string) {
    const data = articleCreateSchema.parse(input)
    const slug = await ensureUniqueSlug(data.slug ?? data.title)
    const contentString = typeof data.content === "string" ? data.content : JSON.stringify(data.content)
    const readingTime = readingTimeFromContent(contentString)
    return prisma.article.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: contentString,
        coverImage: data.coverImage ?? null,
        status: data.status,
        publishedAt:
          data.publishedAt ??
          (data.status === ARTICLE_STATUS.PUBLISHED ? new Date() : null),
        readingTime,
        authorId,
        categoryId: data.categoryId ?? null,
        tags: {
          create: data.tagIds.map((tagId) => ({ tagId })),
        },
      },
      include: articleInclude,
    })
  },

  async update(input: ArticleUpdateInput) {
    const data = articleUpdateSchema.parse(input)
    const existing = await prisma.article.findUnique({ where: { id: data.id } })
    if (!existing) {
      throw new Error(`Article ${data.id} not found`)
    }
    const updateData: Record<string, unknown> = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt
    if (data.content !== undefined) {
      const contentString = typeof data.content === "string" ? data.content : JSON.stringify(data.content)
      updateData.content = contentString
      updateData.readingTime = readingTimeFromContent(contentString)
    }
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage
    if (data.status !== undefined) {
      updateData.status = data.status
      if (data.status === ARTICLE_STATUS.PUBLISHED && !existing.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
    if (data.slug !== undefined) {
      updateData.slug = await ensureUniqueSlug(data.slug, data.id)
    }
    if (data.tagIds !== undefined) {
      await prisma.tagOnArticle.deleteMany({ where: { articleId: data.id } })
      if (data.tagIds.length > 0) {
        await prisma.tagOnArticle.createMany({
          data: data.tagIds.map((tagId) => ({ articleId: data.id, tagId })),
        })
      }
    }
    return prisma.article.update({
      where: { id: data.id },
      data: updateData,
      include: articleInclude,
    })
  },

  async delete(id: string) {
    return prisma.article.delete({ where: { id } })
  },

  async counts() {
    const [published, drafts, total] = await Promise.all([
      prisma.article.count({ where: { status: ARTICLE_STATUS.PUBLISHED } }),
      prisma.article.count({ where: { status: ARTICLE_STATUS.DRAFT } }),
      prisma.article.count(),
    ])
    return { published, drafts, total }
  },
}
