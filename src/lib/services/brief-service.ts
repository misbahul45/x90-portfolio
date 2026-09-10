import { prisma } from "#/db"
import {
  briefCreateSchema,
  briefStatusUpdateSchema,
} from "#/lib/schemas/brief"
import type {
  BriefCreateInput,
  BriefStatusUpdateInput,
} from "#/lib/schemas/brief"
import type { BriefStatus } from "#/lib/schemas/brief"

type AdminListOptions = {
  status?: BriefStatus
  service?: BriefCreateInput["service"]
}

export const briefService = {
  async submit(input: BriefCreateInput) {
    const data = briefCreateSchema.parse(input)
    return prisma.brief.create({ data })
  },

  async adminList(options: AdminListOptions = {}) {
    const where: Record<string, unknown> = {}
    if (options.status) where.status = options.status
    if (options.service) where.service = options.service
    return prisma.brief.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    })
  },

  async byId(id: string) {
    return prisma.brief.findUnique({ where: { id } })
  },

  async updateStatus(input: BriefStatusUpdateInput) {
    const data = briefStatusUpdateSchema.parse(input)
    return prisma.brief.update({
      where: { id: data.id },
      data: { status: data.status },
    })
  },

  async delete(id: string) {
    return prisma.brief.delete({ where: { id } })
  },

  async count(filter?: { status?: BriefStatus }) {
    return prisma.brief.count({ where: filter })
  },
}
