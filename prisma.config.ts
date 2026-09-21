import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  // CLI operations (migrate, db push, db pull, generate) use DATABASE_URL.
  // Prefer DATABASE_URL_UNPOOLED when present (Neon best practice: keep the
  // pooler free of long-lived sessions); fall back to DATABASE_URL otherwise.
  // Read directly from process.env so config load never throws on missing
  // optional vars — Prisma's `env()` helper requires the var to exist.
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
})
