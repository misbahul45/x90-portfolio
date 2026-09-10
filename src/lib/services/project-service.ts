import { prisma } from "#/db"
import { slugify } from "#/lib/slug"
import {
  projectCreateSchema,
  projectUpdateSchema,
} from "#/lib/schemas/project"
import type {
  ProjectCreateInput,
  ProjectUpdateInput,
} from "#/lib/schemas/project"

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
}

const projectInclude = {
  category: true,
} as const

async function ensureUniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const candidate = slugify(base)
  let slug = candidate.length > 0 ? candidate : `project-${Date.now().toString(36)}`
  let attempt = 0
  while (true) {
    const existing = await prisma.project.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) {
      return slug
    }
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

export const projectService = {
  async list(options: ListOptions = {}) {
    const where: Record<string, unknown> = {}
    if (options.featuredOnly) where.featured = true
    if (options.categorySlug) where.category = { slug: options.categorySlug }
    const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
    const page = Math.max(1, options.page ?? 1)
    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: projectInclude,
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
    return prisma.project.findUnique({
      where: { slug },
      include: projectInclude,
    })
  },

  async byId(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: projectInclude,
    })
  },

  async create(input: ProjectCreateInput) {
    const data = projectCreateSchema.parse(input)
    const slug = await ensureUniqueSlug(data.slug ?? data.title)
    return prisma.project.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        content: typeof data.content === "string" ? data.content : JSON.stringify(data.content),
        coverImage: data.coverImage ?? null,
        technologies: data.technologies,
        githubUrl: data.githubUrl ?? null,
        demoUrl: data.demoUrl ?? null,
        featured: data.featured,
        order: data.order,
        categoryId: data.categoryId ?? null,
      },
      include: projectInclude,
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
    if (data.slug !== undefined) {
      updateData.slug = await ensureUniqueSlug(data.slug, data.id)
    }
    return prisma.project.update({
      where: { id: data.id },
      data: updateData,
      include: projectInclude,
    })
  },

  async delete(id: string) {
    return prisma.project.delete({ where: { id } })
  },

  async count() {
    return prisma.project.count()
  },
}
