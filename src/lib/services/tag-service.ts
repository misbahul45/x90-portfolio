import { prisma } from "#/db"
import { slugify } from "#/lib/slug"
import { tagCreateSchema, tagUpdateSchema } from "#/lib/schemas/tag"
import type { TagCreateInput, TagUpdateInput } from "#/lib/schemas/tag"

async function ensureUniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const candidate = slugify(base) || `tag-${Date.now().toString(36)}`
  let slug = candidate
  let attempt = 0
  while (true) {
    const existing = await prisma.tag.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) return slug
    attempt += 1
    slug = `${candidate}-${attempt + 1}`
  }
}

export const tagService = {
  async list() {
    return prisma.tag.findMany({ orderBy: { name: "asc" } })
  },

  async bySlug(slug: string) {
    return prisma.tag.findUnique({ where: { slug } })
  },

  async byId(id: string) {
    return prisma.tag.findUnique({ where: { id } })
  },

  async create(input: TagCreateInput) {
    const data = tagCreateSchema.parse(input)
    const slug = await ensureUniqueSlug(data.slug ?? data.name)
    return prisma.tag.create({ data: { slug, name: data.name } })
  },

  async update(input: TagUpdateInput) {
    const data = tagUpdateSchema.parse(input)
    const existing = await prisma.tag.findUnique({ where: { id: data.id } })
    if (!existing) throw new Error(`Tag ${data.id} not found`)
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.slug !== undefined) {
      updateData.slug = await ensureUniqueSlug(data.slug, data.id)
    }
    return prisma.tag.update({ where: { id: data.id }, data: updateData })
  },

  async delete(id: string) {
    return prisma.tag.delete({ where: { id } })
  },

  async count() {
    return prisma.tag.count()
  },
}
