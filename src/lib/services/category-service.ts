import { prisma } from "#/db"
import { slugify } from "#/lib/slug"
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "#/lib/schemas/category"
import type {
  CategoryCreateInput,
  CategoryUpdateInput,
} from "#/lib/schemas/category"

async function ensureUniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const candidate = slugify(base) || `category-${Date.now().toString(36)}`
  let slug = candidate
  let attempt = 0
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) return slug
    attempt += 1
    slug = `${candidate}-${attempt + 1}`
  }
}

export const categoryService = {
  async list() {
    return prisma.category.findMany({ orderBy: { name: "asc" } })
  },

  async bySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } })
  },

  async byId(id: string) {
    return prisma.category.findUnique({ where: { id } })
  },

  async create(input: CategoryCreateInput) {
    const data = categoryCreateSchema.parse(input)
    const slug = await ensureUniqueSlug(data.slug ?? data.name)
    return prisma.category.create({ data: { slug, name: data.name } })
  },

  async update(input: CategoryUpdateInput) {
    const data = categoryUpdateSchema.parse(input)
    const existing = await prisma.category.findUnique({ where: { id: data.id } })
    if (!existing) throw new Error(`Category ${data.id} not found`)
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.slug !== undefined) {
      updateData.slug = await ensureUniqueSlug(data.slug, data.id)
    }
    return prisma.category.update({ where: { id: data.id }, data: updateData })
  },

  async delete(id: string) {
    return prisma.category.delete({ where: { id } })
  },

  async count() {
    return prisma.category.count()
  },
}
