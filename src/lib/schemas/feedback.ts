import { z } from "zod"
import { FEEDBACK_STATUS, FEEDBACK_TYPE } from "#/lib/domain/feedback"

export const feedbackSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(200),
  message: z.string().min(10).max(2000),
  type: z
    .enum([
      FEEDBACK_TYPE.GENERAL,
      FEEDBACK_TYPE.PROJECT,
      FEEDBACK_TYPE.RESEARCH,
      FEEDBACK_TYPE.COLLABORATION,
      FEEDBACK_TYPE.OTHER,
    ])
    .default(FEEDBACK_TYPE.GENERAL),
})

export const feedbackStatusUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum([
    FEEDBACK_STATUS.NEW,
    FEEDBACK_STATUS.READ,
    FEEDBACK_STATUS.ARCHIVED,
  ]),
})

export type FeedbackInput = z.infer<typeof feedbackSchema>
export type FeedbackStatusUpdateInput = z.infer<typeof feedbackStatusUpdateSchema>
