const DB_NAME = "xninetzy-ai"
const DB_VERSION = 1
const STORE_NAME = "attachments"
const ACTIVE_KEY = "active"

export type PersistedAttachment = {
  id: string
  name: string
  size: number
  mimeType: string
  pageCount?: number
  chars: number
  context: string
  storedAt: number
}

let dbPromise: Promise<IDBDatabase> | null = null

function getDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this environment."))
  }
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."))
  })
  return dbPromise
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."))
  })
}

export async function saveAttachment(attachment: PersistedAttachment): Promise<void> {
  const db = await getDatabase()
  const tx = db.transaction(STORE_NAME, "readwrite")
  await Promise.all([
    promisifyRequest(tx.objectStore(STORE_NAME).put(attachment)),
    promisifyRequest(tx.objectStore(STORE_NAME).put({ id: ACTIVE_KEY, attachmentId: attachment.id })),
  ])
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed."))
  })
}

type ActivePointer = { id: string; attachmentId: string }

export async function loadActiveAttachment(): Promise<PersistedAttachment | null> {
  const db = await getDatabase()
  const tx = db.transaction(STORE_NAME, "readonly")
  const pointer = await promisifyRequest<ActivePointer | undefined>(
    tx.objectStore(STORE_NAME).get(ACTIVE_KEY) as IDBRequest<ActivePointer | undefined>,
  )
  if (!pointer) return null
  const attachment = await promisifyRequest<PersistedAttachment | undefined>(
    tx.objectStore(STORE_NAME).get(pointer.attachmentId) as IDBRequest<
      PersistedAttachment | undefined
    >,
  )
  return attachment ?? null
}

export async function clearAttachment(id?: string): Promise<void> {
  const db = await getDatabase()
  const tx = db.transaction(STORE_NAME, "readwrite")
  if (id) {
    await promisifyRequest(tx.objectStore(STORE_NAME).delete(id))
  } else {
    const pointer = await promisifyRequest<ActivePointer | undefined>(
      tx.objectStore(STORE_NAME).get(ACTIVE_KEY) as IDBRequest<ActivePointer | undefined>,
    )
    if (pointer) {
      await promisifyRequest(tx.objectStore(STORE_NAME).delete(pointer.attachmentId))
    }
    await promisifyRequest(tx.objectStore(STORE_NAME).delete(ACTIVE_KEY))
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed."))
  })
}
