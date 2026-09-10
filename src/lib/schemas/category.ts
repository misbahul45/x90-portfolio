import { z } from "zod"
import { SLUG_REGEX } from "#/lib/slug"

export const categoryCreateSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(SLUG_REGEX, "Slug must be lowercase letters, numbers, and dashes")
    .optional(),
  name: z.string().min(2).max(120),
})

export const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  id: z.string().min(1),
})

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>
