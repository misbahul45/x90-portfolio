import { describe, expect, it } from "vitest"
import { buildFieldEdges, generateFieldPositions, pickAccentIndices, scrollFade } from "./field-geometry"

describe("generateFieldPositions", () => {
  it("is deterministic for a seed and differs across seeds", () => {
    const first = generateFieldPositions(120, "hero")
    const second = generateFieldPositions(120, "hero")
    const other = generateFieldPositions(120, "cta")
    expect(Array.from(first)).toEqual(Array.from(second))
    expect(Array.from(first)).not.toEqual(Array.from(other))
  })

  it("returns three components per point inside the shell bounds", () => {
    const positions = generateFieldPositions(200, "bounds", 2)
    expect(positions).toHaveLength(600)
    for (let index = 0; index < 200; index += 1) {
      const length = Math.hypot(positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2])
      expect(length).toBeGreaterThanOrEqual(2 * 0.72 - 1e-4)
      expect(length).toBeLessThanOrEqual(2 * 1.1 + 1e-4)
    }
  })

  it("handles empty and single point fields", () => {
    expect(generateFieldPositions(0, "x")).toHaveLength(0)
    expect(generateFieldPositions(1, "x")).toHaveLength(3)
  })
})

describe("buildFieldEdges", () => {
  it("connects only points within the distance and never repeats a pair", () => {
    const positions = generateFieldPositions(150, "edges")
    const edges = buildFieldEdges(positions, 0.45, 1000)
    const seen = new Set<string>()
    for (let index = 0; index < edges.length; index += 2) {
      const a = edges[index]
      const b = edges[index + 1]
      expect(a).toBeLessThan(b)
      const distance = Math.hypot(
        positions[a * 3] - positions[b * 3],
        positions[a * 3 + 1] - positions[b * 3 + 1],
        positions[a * 3 + 2] - positions[b * 3 + 2],
      )
      expect(distance).toBeLessThanOrEqual(0.45 + 1e-6)
      seen.add(`${a}-${b}`)
    }
    expect(seen.size).toBe(edges.length / 2)
    expect(edges.length).toBeGreaterThan(0)
  })

  it("respects the edge cap", () => {
    const positions = generateFieldPositions(150, "cap")
    expect(buildFieldEdges(positions, 5, 40).length / 2).toBe(40)
  })
})

describe("pickAccentIndices", () => {
  it("returns unique sorted indices in range", () => {
    const picked = pickAccentIndices(100, 8, "accent")
    expect(picked).toHaveLength(8)
    expect(new Set(picked).size).toBe(8)
    expect([...picked].sort((a, b) => a - b)).toEqual(picked)
    expect(Math.max(...picked)).toBeLessThan(100)
  })

  it("never asks for more accents than points", () => {
    expect(pickAccentIndices(3, 10, "few")).toHaveLength(3)
    expect(pickAccentIndices(0, 4, "none")).toEqual([])
  })
})

describe("scrollFade", () => {
  it("maps progress to a clamped fade", () => {
    expect(scrollFade(0)).toBe(1)
    expect(scrollFade(0.25)).toBe(0.75)
    expect(scrollFade(2)).toBe(0)
    expect(scrollFade(-1)).toBe(1)
  })
})
