import { z } from "zod"

export const teamMemberSchema = z.object({
  name: z.string().min(2).max(120),
  role: z.string().min(2).max(120),
  bio: z.string().max(500).nullable().optional(),
  avatar: z.string().url().nullable().optional(),
  github: z.string().url().nullable().optional(),
  linkedin: z.string().url().nullable().optional(),
  website: z.string().url().nullable().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
})

export const teamMemberUpdateSchema = teamMemberSchema.partial().extend({
  id: z.string().min(1),
})

export type TeamMemberInput = z.infer<typeof teamMemberSchema>
export type TeamMemberUpdateInput = z.infer<typeof teamMemberUpdateSchema>
