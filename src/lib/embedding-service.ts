import { HfInference } from "@huggingface/inference"
import { env } from "#/env"

export const EMBEDDING_DIM = 384 as const
export const EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

let client: HfInference | null = null

function getClient(): HfInference | null {
  if (client) return client
  if (!env.HF_API_KEY) return null
  client = new HfInference(env.HF_API_KEY)
  return client
}

export function isEmbeddingEnabled(): boolean {
  return Boolean(env.HF_API_KEY)
}

function fallbackEmbedding(text: string): number[] {
  const vector = new Array<number>(EMBEDDING_DIM).fill(0)
  const tokens = text.toLowerCase().split(/\W+/).filter(Boolean)
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]
    let hash = 0
    for (let j = 0; j < token.length; j += 1) {
      hash = (hash * 31 + token.charCodeAt(j)) >>> 0
    }
    const bucket = hash % EMBEDDING_DIM
    vector[bucket] += 1 / Math.log2(i + 2)
  }
  let length = 0
  for (const value of vector) length += value * value
  const norm = Math.sqrt(length) || 1
  return vector.map((value) => Number((value / norm).toFixed(6)))
}

function normalize(vector: number[]): number[] {
  let length = 0
  for (const value of vector) length += value * value
  const norm = Math.sqrt(length) || 1
  if (Math.abs(norm - 1) < 1e-3) return vector
  return vector.map((value) => Number((value / norm).toFixed(6)))
}

export async function embedText(text: string): Promise<number[]> {
  const cleaned = text.replace(/\s+/g, " ").trim().slice(0, 2000)
  if (!cleaned) return fallbackEmbedding("")

  const hf = getClient()
  if (hf) {
    try {
      const result = await hf.featureExtraction({
        model: EMBEDDING_MODEL,
        inputs: cleaned,
      })
      const vector = Array.isArray(result[0])
        ? (result[0] as number[])
        : (result as number[])
      if (vector.length !== EMBEDDING_DIM) {
        const padded: number[] = new Array(EMBEDDING_DIM).fill(0)
        for (let i = 0; i < Math.min(vector.length, EMBEDDING_DIM); i += 1) {
          padded[i] = vector[i]
        }
        return normalize(padded)
      }
      return normalize(vector)
    } catch (error) {
      console.warn("[embeddings] Hugging Face call failed; using fallback:", error)
      return fallbackEmbedding(cleaned)
    }
  }

  return fallbackEmbedding(cleaned)
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map((text) => embedText(text)))
}

export function toPgVector(vector: number[]): string {
  return `[${vector.join(",")}]`
}
