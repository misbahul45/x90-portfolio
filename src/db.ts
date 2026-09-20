import { PrismaClient } from './generated/prisma/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const hasDatabaseUrl = typeof connectionString === 'string' && connectionString.length > 0

declare global {
  var __prisma: PrismaClient | undefined
  var __prismaInitError: Error | undefined
}

function buildClient(): PrismaClient | null {
  if (!hasDatabaseUrl) {
    if (!globalThis.__prismaInitError) {
      const message =
        '[db] DATABASE_URL is not set. Server API routes that require the database will fail. ' +
        'Configure DATABASE_URL in your runtime environment (Vercel project settings / .env.local for dev).'
      globalThis.__prismaInitError = new Error(message)
      console.error(message)
    }
    return null
  }
  const adapter = new PrismaPg({ connectionString: connectionString! })
  return new PrismaClient({ adapter })
}

let _client: PrismaClient | null = null

function ensureClient(): PrismaClient {
  if (_client) return _client
  const created = buildClient()
  if (created) _client = created
  return _client as PrismaClient
}

if (process.env.NODE_ENV !== 'production') {
  if (!globalThis.__prisma) {
    const initial = buildClient()
    if (initial) globalThis.__prisma = initial
  }
  _client = globalThis.__prisma ?? null
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = ensureClient()
    if (!client) {
      throw (
        globalThis.__prismaInitError ??
        new Error('[db] Prisma client is unavailable: DATABASE_URL is not configured.')
      )
    }
    const value = Reflect.get(client, prop, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
