import { z } from "zod"

export const BRIEF_SERVICE = {
  AUTOMATION: "AUTOMATION",
  AI_ASSISTANT: "AI_ASSISTANT",
  AGENTIC_SYSTEM: "AGENTIC_SYSTEM",
  WEB: "WEB",
  MOBILE: "MOBILE",
  OTHER: "OTHER",
} as const

export type BriefService = (typeof BRIEF_SERVICE)[keyof typeof BRIEF_SERVICE]

export const BRIEF_STATUS = {
  NEW: "NEW",
  REVIEWED: "REVIEWED",
  QUOTED: "QUOTED",
  ARCHIVED: "ARCHIVED",
} as const

export type BriefStatus = (typeof BRIEF_STATUS)[keyof typeof BRIEF_STATUS]

export const BRIEF_SERVICE_OPTIONS: Array<{ value: BriefService; label: string }> = [
  { value: "AUTOMATION", label: "Automation (custom pipelines)" },
  { value: "AI_ASSISTANT", label: "AI Assistant" },
  { value: "AGENTIC_SYSTEM", label: "Agentic System" },
  { value: "WEB", label: "Web End-to-End" },
  { value: "MOBILE", label: "Mobile End-to-End" },
  { value: "OTHER", label: "Other" },
]

export const briefCreateSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(200),
  company: z.string().max(120).optional(),
  whatsapp: z.string().max(40).optional(),
  service: z
    .enum([
      BRIEF_SERVICE.AUTOMATION,
      BRIEF_SERVICE.AI_ASSISTANT,
      BRIEF_SERVICE.AGENTIC_SYSTEM,
      BRIEF_SERVICE.WEB,
      BRIEF_SERVICE.MOBILE,
      BRIEF_SERVICE.OTHER,
    ])
    .default(BRIEF_SERVICE.OTHER),
  budget: z.string().max(80).optional(),
  timeline: z.string().max(80).optional(),
  message: z.string().min(20).max(4000),
  documentUrl: z.string().url().optional(),
  documentName: z.string().max(200).optional(),
  documentMimeType: z.string().max(120).optional(),
})

export const briefStatusUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum([
    BRIEF_STATUS.NEW,
    BRIEF_STATUS.REVIEWED,
    BRIEF_STATUS.QUOTED,
    BRIEF_STATUS.ARCHIVED,
  ]),
})

export type BriefCreateInput = z.infer<typeof briefCreateSchema>
export type BriefStatusUpdateInput = z.infer<typeof briefStatusUpdateSchema>
