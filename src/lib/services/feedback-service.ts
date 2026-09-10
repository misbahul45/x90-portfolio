import { prisma } from "#/db"
import { FEEDBACK_STATUS, type FeedbackStatus } from "#/lib/domain/feedback"
import {
  feedbackSchema,
  feedbackStatusUpdateSchema,
} from "#/lib/schemas/feedback"
import type {
  FeedbackInput,
  FeedbackStatusUpdateInput,
} from "#/lib/schemas/feedback"

type AdminListOptions = {
  status?: FeedbackStatus
  type?: FeedbackInput["type"]
}

export const feedbackService = {
  async submit(input: FeedbackInput) {
    const data = feedbackSchema.parse(input)
    return prisma.feedback.create({ data })
  },

  async recentPublic(limit = 3) {
    return prisma.feedback.findMany({
      where: { status: { not: FEEDBACK_STATUS.ARCHIVED } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        message: true,
        type: true,
        createdAt: true,
      },
    })
  },

  async adminList(options: AdminListOptions = {}) {
    const where: Record<string, unknown> = {}
    if (options.status) where.status = options.status
    if (options.type) where.type = options.type
    return prisma.feedback.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    })
  },

  async byId(id: string) {
    return prisma.feedback.findUnique({ where: { id } })
  },

  async updateStatus(input: FeedbackStatusUpdateInput) {
    const data = feedbackStatusUpdateSchema.parse(input)
    return prisma.feedback.update({
      where: { id: data.id },
      data: { status: data.status },
    })
  },

  async delete(id: string) {
    return prisma.feedback.delete({ where: { id } })
  },

  async count(filter?: { status?: FeedbackStatus }) {
    return prisma.feedback.count({ where: filter })
  },
}
