import dns from 'node:dns'
import { Agent, setGlobalDispatcher } from 'undici'
dns.setDefaultResultOrder('ipv4first')
setGlobalDispatcher(new Agent({ connect: { family: 4 } }))

import { PrismaNeonHttp } from '@prisma/adapter-neon'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.ts'

declare global {
  var __prisma: PrismaClient | undefined
  var __prismaInitError: string | undefined
}

export function isNeonConnection(connectionString: string): boolean {
  try {
    return new URL(connectionString).hostname.endsWith('.neon.tech')
  } catch {
    return false
  }
}

export function isLocalConnection(connectionString: string): boolean {
  try {
    const { hostname } = new URL(connectionString)
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  } catch {
    return false
  }
}

async function buildClient(): Promise<PrismaClient> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      '[db] DATABASE_URL is not set. Server API routes that require the database will fail.',
    )
  }
  const adapter = isNeonConnection(connectionString)
    ? new PrismaNeonHttp(connectionString, {})
    : new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

const prismaProxy = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const target = globalThis.__prisma
    if (!target) {
      throw new Error(
        `[db] prisma accessed before init. Init status: ${globalThis.__prismaInitError ?? 'pending'}`,
      )
    }
    const value = Reflect.get(target, prop)
    return typeof value === 'function' ? value.bind(target) : value
  },
})

let initPromise: Promise<PrismaClient> | null = null

function describeError(value: unknown): string {
  if (value instanceof Error) return `${value.name}: ${value.message}`
  if (value && typeof value === 'object') {
    return (value as { constructor?: { name?: string } }).constructor?.name ?? 'Object'
  }
  return String(value)
}

export function ensurePrisma(): Promise<PrismaClient> {
  if (globalThis.__prisma) return Promise.resolve(globalThis.__prisma)
  if (!initPromise) {
    initPromise = buildClient()
      .then((client) => {
        globalThis.__prisma = client
        return client
      })
      .catch((error: unknown) => {
        globalThis.__prismaInitError = `[db] init failed: ${describeError(error)}`
        console.error(globalThis.__prismaInitError, error)
        throw error
      })
  }
  return initPromise
}

void ensurePrisma()

export const prisma: PrismaClient = prismaProxy
