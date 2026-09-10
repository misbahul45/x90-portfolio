export const FEEDBACK_TYPE = {
  GENERAL: "GENERAL",
  PROJECT: "PROJECT",
  RESEARCH: "RESEARCH",
  COLLABORATION: "COLLABORATION",
  OTHER: "OTHER",
} as const

export type FeedbackType = (typeof FEEDBACK_TYPE)[keyof typeof FEEDBACK_TYPE]

export const FEEDBACK_STATUS = {
  NEW: "NEW",
  READ: "READ",
  ARCHIVED: "ARCHIVED",
} as const

export type FeedbackStatus = (typeof FEEDBACK_STATUS)[keyof typeof FEEDBACK_STATUS]

export const FEEDBACK_TYPE_OPTIONS: Array<{ value: FeedbackType; label: string }> = [
  { value: "GENERAL", label: "General" },
  { value: "PROJECT", label: "Project" },
  { value: "RESEARCH", label: "Research" },
  { value: "COLLABORATION", label: "Collaboration" },
  { value: "OTHER", label: "Other" },
]

export const FEEDBACK_STATUS_OPTIONS: Array<{ value: FeedbackStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "READ", label: "Read" },
  { value: "ARCHIVED", label: "Archived" },
]
