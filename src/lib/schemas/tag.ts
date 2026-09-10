import { z } from "zod"
import { SLUG_REGEX } from "#/lib/slug"

export const tagCreateSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(SLUG_REGEX, "Slug must be lowercase letters, numbers, and dashes")
    .optional(),
  name: z.string().min(2).max(80),
})

export const tagUpdateSchema = tagCreateSchema.partial().extend({
  id: z.string().min(1),
})

export type TagCreateInput = z.infer<typeof tagCreateSchema>
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>
