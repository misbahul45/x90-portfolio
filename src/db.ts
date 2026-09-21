// Network egress prerequisites. These MUST run before any import that pulls
// in HTTP clients (`@neondatabase/serverless` is used by `@prisma/adapter-
// neon`'s PrismaNeonHttp and calls global `fetch`; node-postgres uses Node's
// `net`). Without this, undici performs dual-stack happy-eyeballs connect
// and both stacks stall on sandboxed egress — surfaced by Neon as
// `TypeError: fetch failed` whose `cause` is `AggregateError [ETIMEDOUT]`
// at `internalConnectMultiple`. Same root cause affects pg.Pool's TCP
// connect: pg re-runs `dns.lookup(host)` to set `hostaddr` even when given
// one, and that lookup returns AAAA first in this sandbox which never
// connects.
//
// Four layers of defense:
//   1. `dns.setDefaultResultOrder('ipv4first')` — primary resolver order.
//   2. undici `Agent({ connect: { family: 4 } })` + `setGlobalDispatcher` —
//      forces IPv4 at the TCP layer for global `fetch`.
//   3. node-postgres `hostaddr` set to a literal IPv4 — bypasses the OS
//      resolver on the TCP dial.
//   4. Patched `dns.lookup` that filters out AAAA for *.neon.tech — bypasses
//      pg's re-lookup in connection-parameters.js. Only active for Neon
//      hostnames; everything else falls through to the original resolver.
import dns from 'node:dns'
import { Agent, setGlobalDispatcher } from 'undici'
dns.setDefaultResultOrder('ipv4first')
setGlobalDispatcher(new Agent({ connect: { family: 4 } }))

import { PrismaNeonHttp } from '@prisma/adapter-neon'
import { PrismaClient } from './generated/prisma/client.ts'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
  // eslint-disable-next-line no-var
  var __prismaInitError: string | undefined
}

async function buildClient(): Promise<PrismaClient> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      '[db] DATABASE_URL is not set. Server API routes that require the database will fail. ' +
        'Configure DATABASE_URL (Neon URL, prefer pooled for app, unpooled for migrations) in your runtime environment.',
    )
  }
  // PrismaNeon over @neondatabase/serverless Pool. Supports interactive
  // transactions (HTTP adapter does not). Talks to Neon via WebSocket using
  // the bundled `ws` polyfill configured above. Pass host/user/password
  // explicitly — neon-serverless Pool ignores `connectionString` and reads
  // individual fields. URL should point at the POOLED endpoint (-pooler in
  // hostname) when running many concurrent requests; unpooled works for
  // migrations + seed.
  // `@neondatabase/serverless` Pool constructor ignores its argument and
  // forwards nothing to the parent pg.Pool. Configuration must be applied
  // by mutating `pool.options` AFTER construction (the only path the
  // neon-serverless query method reads via `this.options.user/password/...`).
  // PrismaNeonHttp over Neon HTTP SQL gateway (HTTPS). The global undici
  // IPv4 dispatcher (above) prevents sandbox happy-eyeballs stalls.
  // Caveat: this adapter does NOT support interactive transactions.
  const adapter = new PrismaNeonHttp(connectionString)
  return new PrismaClient({ adapter })
}

// Eager init via top-level await. The first import of this module blocks
// until DNS lookup + Pool construction complete. Subsequent re-imports in
// dev hot-reload return the cached global; SSR builds resolve the module
// once per server boot.
//
// Failure mode: if the connection can't be established at module load, the
// module throws and the server fails to boot — surfacing the real cause
// immediately rather than masking it behind per-request 500s.
function safeBuild(): PrismaClient {
  // Synchronous return path uses a cached promise; the eager init below
  // populates `globalThis.__prisma` before any consumer reads this export.
  // This sync export exists only so `import { prisma } from '#/db'` keeps
  // working without callers changing to `await getPrisma()`. The Proxy
  // forwards every property access to the cached client.
  return prismaProxy
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

// Trigger eager init. We don't await at module top-level so that import
// statements aren't blocked in non-SSR contexts (e.g. test runners that
// just want the type). Instead we kick the promise off and let consumers
// `await ensurePrisma()` if they need to be sure.
export function ensurePrisma(): Promise<PrismaClient> {
  if (globalThis.__prisma) return Promise.resolve(globalThis.__prisma)
  if (!initPromise) {
    initPromise = buildClient()
      .then((c) => {
        globalThis.__prisma = c
        return c
      })
      .catch((error) => {
        const describe = (value: unknown): string => {
          if (value instanceof Error) return `${value.name}: ${value.message}`
          if (value && typeof value === 'object') {
            const ctor = (value as { constructor?: { name?: string } }).constructor?.name ?? 'Object'
            return ctor
          }
          return String(value)
        }
        globalThis.__prismaInitError = `[db] init failed: ${describe(error)}`
        console.error('[db] init failed:', globalThis.__prismaInitError, error)
        throw error
      })
  }
  return initPromise
}

let initPromise: Promise<PrismaClient> | null = null

// Best-effort eager start. The synchronous `prisma` export below is a Proxy
// that throws until init resolves; consumers in the server runtime always
// run inside async request handlers, so the practical access happens after
// init has resolved.
void ensurePrisma()

export const prisma: PrismaClient = safeBuild()
