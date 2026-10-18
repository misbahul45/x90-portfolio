import { hashString, mulberry32 } from "#/lib/seeded-art"

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

export function generateFieldPositions(count: number, seed: string, radius = 1): Float32Array {
  const random = mulberry32(hashString(seed))
  const positions = new Float32Array(Math.max(0, count) * 3)
  for (let index = 0; index < count; index += 1) {
    const y = count === 1 ? 0 : 1 - (index / (count - 1)) * 2
    const ring = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = GOLDEN_ANGLE * index
    const shell = radius * (0.72 + random() * 0.38)
    positions[index * 3] = Math.cos(theta) * ring * shell
    positions[index * 3 + 1] = y * shell
    positions[index * 3 + 2] = Math.sin(theta) * ring * shell
  }
  return positions
}

export function buildFieldEdges(positions: Float32Array, maxDistance: number, maxEdges: number): Uint32Array {
  const count = Math.floor(positions.length / 3)
  const limit = maxDistance * maxDistance
  const pairs: number[] = []
  for (let first = 0; first < count && pairs.length / 2 < maxEdges; first += 1) {
    for (let second = first + 1; second < count && pairs.length / 2 < maxEdges; second += 1) {
      const dx = positions[first * 3] - positions[second * 3]
      const dy = positions[first * 3 + 1] - positions[second * 3 + 1]
      const dz = positions[first * 3 + 2] - positions[second * 3 + 2]
      if (dx * dx + dy * dy + dz * dz <= limit) pairs.push(first, second)
    }
  }
  return Uint32Array.from(pairs)
}

export function pickAccentIndices(count: number, accentCount: number, seed: string): number[] {
  const random = mulberry32(hashString(`${seed}:accent`))
  const target = Math.min(Math.max(0, accentCount), Math.max(0, count))
  const chosen = new Set<number>()
  while (chosen.size < target) {
    chosen.add(Math.floor(random() * count))
  }
  return [...chosen].sort((a, b) => a - b)
}

export function scrollFade(progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress))
  return 1 - clamped
}
