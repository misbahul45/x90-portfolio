import { z } from "zod"
import { tiptapDocSchema } from "#/lib/schemas/article"
import { SLUG_REGEX } from "#/lib/slug"

export const projectCreateSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(SLUG_REGEX, "Slug must be lowercase letters, numbers, and dashes")
    .optional(),
  description: z.string().min(10).max(500),
  content: z.union([z.string(), tiptapDocSchema]),
  coverImage: z.string().url().nullable().optional(),
  technologies: z.array(z.string().min(1).max(50)).default([]),
  categoryId: z.string().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  demoUrl: z.string().url().nullable().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
})

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  id: z.string().min(1),
})

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>
