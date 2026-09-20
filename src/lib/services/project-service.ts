import { prisma } from "#/db"
import { slugify } from "#/lib/slug"
import { projectCreateSchema, projectUpdateSchema } from "#/lib/schemas/project"
import type { ProjectCreateInput, ProjectUpdateInput } from "#/lib/schemas/project"
import { PROJECT_STATUS } from "#/lib/domain/project-status"

export type Page<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

const DEFAULT_PAGE_SIZE = 9

type ListOptions = {
  featuredOnly?: boolean
  categorySlug?: string
  page?: number
  pageSize?: number
  status?: typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS]
  includeStatuses?: Array<typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS]>
}

const publicProjectInclude = {
  category: true,
  research: {
    include: {
      article: {
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          status: true,
          publishedAt: true,
          category: { select: { id: true, slug: true, name: true } },
        },
      },
    },
  },
} as const

const adminProjectInclude = {
  category: true,
  research: { include: { article: { select: { id: true, slug: true, title: true } } } },
} as const

async function ensureUniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const candidate = slugify(base)
  let slug = candidate.length > 0 ? candidate : `project-${Date.now().toString(36)}`
  let attempt = 0
  while (true) {
    const existing = await prisma.project.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) return slug
    attempt += 1
    slug = `${candidate}-${attempt + 1}`
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

function resolveStatusFilter(options: ListOptions) {
  if (options.includeStatuses && options.includeStatuses.length > 0) {
    return { in: options.includeStatuses }
  }
  if (options.status) {
    return options.status
  }
  return PROJECT_STATUS.PUBLISHED
}

export const projectService = {
  async list(options: ListOptions = {}) {
    const where: Record<string, unknown> = { status: resolveStatusFilter(options) }
    if (options.featuredOnly) where.featured = true
    if (options.categorySlug) where.category = { slug: options.categorySlug }
    const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
    const page = Math.max(1, options.page ?? 1)
    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: publicProjectInclude,
        orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ])
    return buildPage(items, total, page, pageSize)
  },

  async listAll(options: Omit<ListOptions, "page" | "pageSize"> = {}) {
    return this.list({ ...options, pageSize: 1000, page: 1 })
  },

  async bySlug(slug: string) {
    return prisma.project.findFirst({
      where: { slug, status: PROJECT_STATUS.PUBLISHED },
      include: publicProjectInclude,
    })
  },

  async bySlugAdmin(slug: string) {
    return prisma.project.findUnique({
      where: { slug },
      include: adminProjectInclude,
    })
  },

  async byId(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: adminProjectInclude,
    })
  },

  async create(input: ProjectCreateInput) {
    const data = projectCreateSchema.parse(input)
    const slug = await ensureUniqueSlug(data.slug ?? data.title)
    const publishedAt =
      data.publishedAt ?? (data.status === PROJECT_STATUS.PUBLISHED ? new Date() : null)
    const { researchArticleIds, ...rest } = data
    return prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          title: rest.title,
          slug,
          description: rest.description,
          content: typeof rest.content === "string" ? rest.content : JSON.stringify(rest.content),
          coverImage: rest.coverImage ?? null,
          technologies: rest.technologies,
          githubUrl: rest.githubUrl ?? null,
          demoUrl: rest.demoUrl ?? null,
          featured: rest.featured,
          order: rest.order,
          status: rest.status,
          publishedAt,
          categoryId: rest.categoryId ?? null,
        },
      })
      if (researchArticleIds.length > 0) {
        await tx.projectResearch.createMany({
          data: researchArticleIds.map((articleId) => ({
            projectId: created.id,
            articleId,
            relation: "related",
          })),
        })
      }
      return tx.project.findUniqueOrThrow({
        where: { id: created.id },
        include: adminProjectInclude,
      })
    })
  },

  async update(input: ProjectUpdateInput) {
    const data = projectUpdateSchema.parse(input)
    const existing = await prisma.project.findUnique({ where: { id: data.id } })
    if (!existing) throw new Error(`Project ${data.id} not found`)
    const updateData: Record<string, unknown> = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.content !== undefined) {
      updateData.content =
        typeof data.content === "string" ? data.content : JSON.stringify(data.content)
    }
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage
    if (data.technologies !== undefined) updateData.technologies = data.technologies
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
    if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl
    if (data.demoUrl !== undefined) updateData.demoUrl = data.demoUrl
    if (data.featured !== undefined) updateData.featured = data.featured
    if (data.order !== undefined) updateData.order = data.order
    if (data.status !== undefined) {
      updateData.status = data.status
      if (data.status === PROJECT_STATUS.PUBLISHED && !existing.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt
    if (data.slug !== undefined) {
      updateData.slug = await ensureUniqueSlug(data.slug, data.id)
    }
    return prisma.$transaction(async (tx) => {
      if (data.researchArticleIds !== undefined) {
        await tx.projectResearch.deleteMany({ where: { projectId: data.id } })
        if (data.researchArticleIds.length > 0) {
          await tx.projectResearch.createMany({
            data: data.researchArticleIds.map((articleId) => ({
              projectId: data.id,
              articleId,
              relation: "related",
            })),
          })
        }
      }
      return tx.project.update({
        where: { id: data.id },
        data: updateData,
        include: adminProjectInclude,
      })
    })
  },

  async delete(id: string) {
    return prisma.project.delete({ where: { id } })
  },

  async count() {
    return prisma.project.count({ where: { status: PROJECT_STATUS.PUBLISHED } })
  },

  async related(projectId: string, limit = 3) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { categoryId: true, category: { select: { slug: true } } },
    })
    if (!project) return []
    return prisma.project.findMany({
      where: {
        status: PROJECT_STATUS.PUBLISHED,
        id: { not: projectId },
        categoryId: project.categoryId,
      },
      include: { category: true },
      orderBy: [{ featured: "desc" }, { order: "asc" }],
      take: limit,
    })
  },

  async relatedArticles(projectId: string) {
    return prisma.projectResearch.findMany({
      where: {
        projectId,
        article: { status: PROJECT_STATUS.PUBLISHED },
      },
      include: {
        article: {
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            publishedAt: true,
            readingTime: true,
            category: { select: { id: true, slug: true, name: true } },
            author: { select: { id: true, name: true } },
          },
        },
      },
      take: 4,
    })
  },

  async projectsByArticle(articleId: string) {
    return prisma.projectResearch.findMany({
      where: {
        articleId,
        project: { status: PROJECT_STATUS.PUBLISHED },
      },
      include: {
        project: {
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            category: { select: { id: true, slug: true, name: true } },
          },
        },
      },
      take: 4,
    })
  },
}
