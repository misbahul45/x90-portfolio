import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    SERVER_URL: z.string().url().optional(),
    CONTACT_EMAIL: z.string().email().optional(),
    CONTACT_WHATSAPP: z.string().min(6).optional(),
    BREVO_API_KEY: z.string().min(10).optional(),
    BREVO_FROM_EMAIL: z.string().email().optional(),
    BREVO_FROM_NAME: z.string().min(1).optional(),
    FLAZZ_API_KEY: z.string().optional(),
    FLAZZ_BASE_URL: z.string().url().optional(),
    FLAZZ_MODEL: z.string().min(1).optional(),
    HF_API_KEY: z.string().optional(),
  },

  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
    VITE_CONTACT_WHATSAPP: z.string().min(6).optional(),
    VITE_CONTACT_EMAIL: z.string().email().optional(),
  },

  runtimeEnv: {
    ...(typeof process !== "undefined" ? process.env : {}),
    ...import.meta.env,
  },

  emptyStringAsUndefined: true,
})
