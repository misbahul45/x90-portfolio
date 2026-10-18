import { describe, expect, it } from "vitest"
import { generateNodeArt, hashString, mulberry32 } from "#/lib/seeded-art"

describe("hashString and mulberry32", () => {
  it("hash is stable and distinguishes inputs", () => {
    expect(hashString("agent-runtime")).toBe(hashString("agent-runtime"))
    expect(hashString("agent-runtime")).not.toBe(hashString("rag-pipeline"))
  })

  it("random stream is deterministic and within [0, 1)", () => {
    const first = mulberry32(42)
    const second = mulberry32(42)
    for (let index = 0; index < 50; index += 1) {
      const value = first()
      expect(value).toBe(second())
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe("generateNodeArt", () => {
  it("is deterministic for the same seed", () => {
    expect(generateNodeArt("alpha")).toEqual(generateNodeArt("alpha"))
  })

  it("differs between seeds", () => {
    expect(generateNodeArt("alpha")).not.toEqual(generateNodeArt("beta"))
  })

  it("keeps every node inside the canvas and edges pointing at real nodes", () => {
    for (const seed of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
      const art = generateNodeArt(seed)
      expect(art.nodes.length).toBeGreaterThanOrEqual(7)
      art.nodes.forEach((node) => {
        expect(node.x).toBeGreaterThanOrEqual(0)
        expect(node.x).toBeLessThanOrEqual(art.width)
        expect(node.y).toBeGreaterThanOrEqual(0)
        expect(node.y).toBeLessThanOrEqual(art.height)
      })
      const ids = new Set(art.nodes.map((node) => node.id))
      art.edges.forEach((edge) => {
        expect(ids.has(edge.from)).toBe(true)
        expect(ids.has(edge.to)).toBe(true)
        expect(edge.from).not.toBe(edge.to)
      })
      expect(art.nodes.filter((node) => node.accent)).toHaveLength(2)
    }
  })
})
