import { prisma } from "#/db"
import { ARTICLE_STATUS } from "#/lib/domain/article-status"
import {
  buildArticleDraft,
  type ExperimentMethod,
  type ExperimentStatus,
  type ScalarValue,
} from "#/lib/domain/experiments"
import {
  experimentCreateSchema,
  experimentUpdateSchema,
  type ExperimentCreateInput,
  type ExperimentUpdateInput,
} from "#/lib/schemas/experiment"
import { articleService } from "#/lib/services/article-service"
import { slugify } from "#/lib/slug"

type ListOptions = {
  status?: ExperimentStatus
}

const experimentInclude = {
  article: { select: { id: true, slug: true, title: true, status: true } },
  project: { select: { id: true, slug: true, title: true } },
} as const

function asScalarRecord(value: unknown): Record<string, ScalarValue> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {}
  const result: Record<string, ScalarValue> = {}
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") {
      result[key] = entry
    }
  }
  return result
}

function asNumberRecord(value: unknown): Record<string, number> {
  const result: Record<string, number> = {}
  for (const [key, entry] of Object.entries(asScalarRecord(value))) {
    if (typeof entry === "number") result[key] = entry
  }
  return result
}

async function ensureUniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const candidate = slugify(base)
  let slug = candidate.length > 0 ? candidate : `experiment-${Date.now().toString(36)}`
  let attempt = 0
  while (true) {
    const existing = await prisma.experiment.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) return slug
    attempt += 1
    slug = `${candidate}-${attempt + 1}`
  }
}

export const experimentService = {
  async list(options: ListOptions = {}) {
    return prisma.experiment.findMany({
      where: options.status ? { status: options.status } : {},
      include: experimentInclude,
      orderBy: [{ updatedAt: "desc" }],
    })
  },

  async byId(id: string) {
    return prisma.experiment.findUnique({ where: { id }, include: experimentInclude })
  },

  async create(input: ExperimentCreateInput) {
    const data = experimentCreateSchema.parse(input)
    const slug = await ensureUniqueSlug(data.slug ?? data.title)
    return prisma.experiment.create({
      data: {
        title: data.title,
        slug,
        summary: data.summary,
        baseModel: data.baseModel,
        method: data.method,
        datasetName: data.datasetName ?? null,
        datasetSize: data.datasetSize ?? null,
        hyperparams: data.hyperparams,
        metrics: data.metrics,
        status: data.status,
        stage: data.stage,
        notes: data.notes,
        articleId: data.articleId ?? null,
        projectId: data.projectId ?? null,
      },
      include: experimentInclude,
    })
  },

  async update(input: ExperimentUpdateInput) {
    const data = experimentUpdateSchema.parse(input)
    const existing = await prisma.experiment.findUnique({ where: { id: data.id } })
    if (!existing) throw new Error(`Experiment ${data.id} not found`)
    const updateData: Record<string, unknown> = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.slug !== undefined) updateData.slug = await ensureUniqueSlug(data.slug, data.id)
    if (data.summary !== undefined) updateData.summary = data.summary
    if (data.baseModel !== undefined) updateData.baseModel = data.baseModel
    if (data.method !== undefined) updateData.method = data.method
    if (data.datasetName !== undefined) updateData.datasetName = data.datasetName
    if (data.datasetSize !== undefined) updateData.datasetSize = data.datasetSize
    if (data.hyperparams !== undefined) updateData.hyperparams = data.hyperparams
    if (data.metrics !== undefined) updateData.metrics = data.metrics
    if (data.status !== undefined) updateData.status = data.status
    if (data.stage !== undefined) updateData.stage = data.stage
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.articleId !== undefined) updateData.articleId = data.articleId
    if (data.projectId !== undefined) updateData.projectId = data.projectId
    return prisma.experiment.update({
      where: { id: data.id },
      data: updateData,
      include: experimentInclude,
    })
  },

  async remove(id: string) {
    await prisma.experiment.delete({ where: { id } })
    return { id }
  },

  async draftArticle(id: string, authorId: string) {
    const experiment = await prisma.experiment.findUnique({ where: { id }, include: experimentInclude })
    if (!experiment) throw new Error(`Experiment ${id} not found`)
    if (experiment.articleId) return experiment
    const draft = buildArticleDraft({
      title: experiment.title,
      summary: experiment.summary,
      baseModel: experiment.baseModel,
      method: experiment.method as ExperimentMethod,
      datasetName: experiment.datasetName,
      datasetSize: experiment.datasetSize,
      hyperparams: asScalarRecord(experiment.hyperparams),
      metrics: asNumberRecord(experiment.metrics),
      status: experiment.status as ExperimentStatus,
      notes: experiment.notes,
    })
    const article = await articleService.create(
      {
        title: draft.title,
        excerpt: draft.excerpt,
        content: draft.content,
        status: ARTICLE_STATUS.DRAFT,
        tagIds: [],
      },
      authorId,
    )
    return prisma.experiment.update({
      where: { id },
      data: { articleId: article.id },
      include: experimentInclude,
    })
  },
}
