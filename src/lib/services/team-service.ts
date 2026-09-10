import { prisma } from "#/db"
import {
  teamMemberSchema,
  teamMemberUpdateSchema,
} from "#/lib/schemas/team-member"
import type {
  TeamMemberInput,
  TeamMemberUpdateInput,
} from "#/lib/schemas/team-member"

type ListOptions = {
  featuredOnly?: boolean
}

export const teamService = {
  async list(options: ListOptions = {}) {
    const where: Record<string, unknown> = {}
    if (options.featuredOnly) where.featured = true
    return prisma.teamMember.findMany({
      where,
      orderBy: [{ featured: "desc" }, { order: "asc" }, { name: "asc" }],
    })
  },

  async byId(id: string) {
    return prisma.teamMember.findUnique({ where: { id } })
  },

  async create(input: TeamMemberInput) {
    const data = teamMemberSchema.parse(input)
    return prisma.teamMember.create({ data })
  },

  async update(input: TeamMemberUpdateInput) {
    const data = teamMemberUpdateSchema.parse(input)
    const existing = await prisma.teamMember.findUnique({ where: { id: data.id } })
    if (!existing) throw new Error(`TeamMember ${data.id} not found`)
    const updateData: Record<string, unknown> = {}
    for (const key of [
      "name",
      "role",
      "bio",
      "avatar",
      "github",
      "linkedin",
      "website",
      "featured",
      "order",
    ] as const) {
      if (data[key] !== undefined) updateData[key] = data[key]
    }
    return prisma.teamMember.update({ where: { id: data.id }, data: updateData })
  },

  async delete(id: string) {
    return prisma.teamMember.delete({ where: { id } })
  },

  async count() {
    return prisma.teamMember.count()
  },
}
