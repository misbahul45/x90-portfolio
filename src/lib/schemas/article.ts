import { z } from "zod"
import { ARTICLE_STATUS } from "#/lib/domain/article-status"
import { SLUG_REGEX } from "#/lib/slug"

const tiptapNodeSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(tiptapNodeSchema).optional(),
    text: z.string().optional(),
    marks: z
      .array(
        z.object({
          type: z.string(),
          attrs: z.record(z.string(), z.unknown()).optional(),
        }),
      )
      .optional(),
  }),
)

export const tiptapDocSchema = z.object({
  type: z.literal("doc"),
  content: z.array(tiptapNodeSchema).optional(),
})

export const articleCreateSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(SLUG_REGEX, "Slug must be lowercase letters, numbers, and dashes")
    .optional(),
  excerpt: z.string().min(10).max(500),
  content: z.union([z.string(), tiptapDocSchema]),
  coverImage: z.string().url().nullable().optional(),
  status: z
    .enum([
      ARTICLE_STATUS.DRAFT,
      ARTICLE_STATUS.PUBLISHED,
      ARTICLE_STATUS.ARCHIVED,
    ])
    .default(ARTICLE_STATUS.DRAFT),
  publishedAt: z.coerce.date().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).default([]),
})

export const articleUpdateSchema = articleCreateSchema.partial().extend({
  id: z.string().min(1),
})

export type ArticleCreateInput = z.infer<typeof articleCreateSchema>
export type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>
