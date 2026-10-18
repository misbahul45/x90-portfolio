import { z } from "zod"
import { EXPERIMENT_METHODS, EXPERIMENT_STATUSES } from "#/lib/domain/experiments"
import { PIPELINES } from "#/lib/domain/pipelines"
import { SLUG_REGEX } from "#/lib/slug"

const FINETUNE_STAGE_COUNT = PIPELINES.find((pipeline) => pipeline.key === "finetune")?.stages.length ?? 5

const hyperparamsSchema = z.record(z.string().min(1).max(80), z.union([z.string().max(200), z.number(), z.boolean()]))
const metricsSchema = z.record(z.string().min(1).max(80), z.number().finite())

export const experimentCreateSchema = z.object({
  title: z.string().min(3).max(160),
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(SLUG_REGEX, "Slug must be lowercase letters, numbers, and dashes")
    .optional(),
  summary: z.string().min(10).max(1000),
  baseModel: z.string().min(1).max(160),
  method: z.enum(EXPERIMENT_METHODS).default("LORA"),
  datasetName: z.string().max(160).nullable().optional(),
  datasetSize: z.number().int().min(0).nullable().optional(),
  hyperparams: hyperparamsSchema.default({}),
  metrics: metricsSchema.default({}),
  status: z.enum(EXPERIMENT_STATUSES).default("PLANNED"),
  stage: z.number().int().min(0).max(FINETUNE_STAGE_COUNT - 1).default(0),
  notes: z.string().max(10000).default(""),
  articleId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
})

export const experimentUpdateSchema = experimentCreateSchema.partial().extend({
  id: z.string().min(1),
  method: z.enum(EXPERIMENT_METHODS).optional(),
  hyperparams: hyperparamsSchema.optional(),
  metrics: metricsSchema.optional(),
  status: z.enum(EXPERIMENT_STATUSES).optional(),
  stage: z.number().int().min(0).max(FINETUNE_STAGE_COUNT - 1).optional(),
  notes: z.string().max(10000).optional(),
})

export type ExperimentCreateInput = z.infer<typeof experimentCreateSchema>
export type ExperimentUpdateInput = z.infer<typeof experimentUpdateSchema>
