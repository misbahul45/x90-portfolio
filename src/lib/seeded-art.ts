export type ArtNode = {
  id: number
  x: number
  y: number
  size: number
  accent: boolean
}

export type ArtEdge = {
  from: number
  to: number
}

export type NodeArt = {
  width: number
  height: number
  nodes: ArtNode[]
  edges: ArtEdge[]
}

export function hashString(value: string): number {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const COLUMNS = 5
const ROWS = 3
const MIN_NODES = 7
const ACCENT_COUNT = 2

export function generateNodeArt(seed: string, width = 400, height = 225): NodeArt {
  const random = mulberry32(hashString(seed))
  const cellWidth = width / COLUMNS
  const cellHeight = height / ROWS

  const grid: Array<Array<ArtNode | null>> = []
  const nodes: ArtNode[] = []

  for (let column = 0; column < COLUMNS; column += 1) {
    const cells: Array<ArtNode | null> = []
    for (let row = 0; row < ROWS; row += 1) {
      const present = random() < 0.78
      if (!present) {
        cells.push(null)
        continue
      }
      const node: ArtNode = {
        id: nodes.length,
        x: Math.round(column * cellWidth + cellWidth * (0.2 + random() * 0.6)),
        y: Math.round(row * cellHeight + cellHeight * (0.2 + random() * 0.6)),
        size: 3 + Math.round(random() * 3),
        accent: false,
      }
      nodes.push(node)
      cells.push(node)
    }
    grid.push(cells)
  }

  for (let column = 0; column < COLUMNS && nodes.length < MIN_NODES; column += 1) {
    for (let row = 0; row < ROWS && nodes.length < MIN_NODES; row += 1) {
      if (grid[column][row]) continue
      const node: ArtNode = {
        id: nodes.length,
        x: Math.round(column * cellWidth + cellWidth / 2),
        y: Math.round(row * cellHeight + cellHeight / 2),
        size: 3,
        accent: false,
      }
      nodes.push(node)
      grid[column][row] = node
    }
  }

  const edges: ArtEdge[] = []
  for (let column = 0; column < COLUMNS; column += 1) {
    for (let row = 0; row < ROWS; row += 1) {
      const node = grid[column][row]
      if (!node) continue
      const forward = findNext(grid, column, row)
      if (forward) edges.push({ from: node.id, to: forward.id })
      const below = grid[column][row + 1]
      if (below && random() < 0.55) edges.push({ from: node.id, to: below.id })
    }
  }

  const degree = new Map<number, number>()
  edges.forEach((edge) => {
    degree.set(edge.from, (degree.get(edge.from) ?? 0) + 1)
    degree.set(edge.to, (degree.get(edge.to) ?? 0) + 1)
  })
  const ranked = [...nodes].sort(
    (a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0) || a.id - b.id,
  )
  ranked.slice(0, ACCENT_COUNT).forEach((node) => {
    node.accent = true
  })

  return { width, height, nodes, edges }
}

function findNext(
  grid: ReadonlyArray<ReadonlyArray<ArtNode | null>>,
  column: number,
  row: number,
): ArtNode | null {
  for (let next = column + 1; next < grid.length; next += 1) {
    const candidates = [row, row - 1, row + 1]
    for (const candidateRow of candidates) {
      const node = grid[next]?.[candidateRow]
      if (node) return node
    }
  }
  return null
}
