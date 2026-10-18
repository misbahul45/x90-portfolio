import type { WorkSlide } from "#/lib/domain/work-slides"

export type GraphOrientation = "horizontal" | "vertical"

export type FocusNodeKind = "research" | "project" | "tech"

export type FocusNode = {
  id: string
  kind: FocusNodeKind
  label: string
  x: number
  y: number
  sharedWith: number
}

export type FocusEdge = {
  id: string
  source: string
  target: string
  kind: "research" | "stack"
}

export type FocusGraph = {
  nodes: FocusNode[]
  edges: FocusEdge[]
}

export const PROJECT_NODE_ID = "project"

export const HORIZONTAL_COLUMN_X = { research: 0, project: 380, tech: 790 } as const
export const HORIZONTAL_ROW_GAP = { research: 100, tech: 74 } as const

export const VERTICAL_ROW_Y = { research: 0, project: 190, tech: 380 } as const
export const VERTICAL_COLUMN_GAP = 176
export const VERTICAL_TECH_ROW_GAP = 66

export function techKey(label: string): string {
  return label.trim().toLowerCase()
}

export function researchNodeId(id: string): string {
  return `research:${id}`
}

export function techNodeId(label: string): string {
  return `tech:${techKey(label)}`
}

export function sharedTechCounts(slides: ReadonlyArray<WorkSlide>): Map<string, number> {
  const usage = new Map<string, number>()
  for (const slide of slides) {
    if (slide.kind === "more") continue
    for (const label of new Set(slide.technologies.map(techKey))) {
      usage.set(label, (usage.get(label) ?? 0) + 1)
    }
  }
  return usage
}

function centered(index: number, count: number): number {
  return index - (count - 1) / 2
}

export function buildFocusGraph(
  slide: WorkSlide,
  orientation: GraphOrientation,
  usage: ReadonlyMap<string, number> = new Map(),
): FocusGraph {
  const nodes: FocusNode[] = []
  const edges: FocusEdge[] = []

  nodes.push({
    id: PROJECT_NODE_ID,
    kind: "project",
    label: slide.title,
    x: orientation === "horizontal" ? HORIZONTAL_COLUMN_X.project : 0,
    y: orientation === "horizontal" ? 0 : VERTICAL_ROW_Y.project,
    sharedWith: 0,
  })

  slide.related.forEach((item, index) => {
    const id = researchNodeId(item.id)
    nodes.push({
      id,
      kind: "research",
      label: item.title,
      x:
        orientation === "horizontal"
          ? HORIZONTAL_COLUMN_X.research
          : centered(index, slide.related.length) * VERTICAL_COLUMN_GAP,
      y:
        orientation === "horizontal"
          ? centered(index, slide.related.length) * HORIZONTAL_ROW_GAP.research
          : VERTICAL_ROW_Y.research,
      sharedWith: 0,
    })
    edges.push({ id: `${id}->${PROJECT_NODE_ID}`, source: id, target: PROJECT_NODE_ID, kind: "research" })
  })

  slide.technologies.forEach((label, index) => {
    const id = techNodeId(label)
    const shared = Math.max(0, (usage.get(techKey(label)) ?? 1) - 1)
    const column = index % 2
    const row = Math.floor(index / 2)
    nodes.push({
      id,
      kind: "tech",
      label,
      x: orientation === "horizontal" ? HORIZONTAL_COLUMN_X.tech : (column - 0.5) * VERTICAL_COLUMN_GAP,
      y:
        orientation === "horizontal"
          ? centered(index, slide.technologies.length) * HORIZONTAL_ROW_GAP.tech
          : VERTICAL_ROW_Y.tech + row * VERTICAL_TECH_ROW_GAP,
      sharedWith: shared,
    })
    edges.push({ id: `${PROJECT_NODE_ID}->${id}`, source: PROJECT_NODE_ID, target: id, kind: "stack" })
  })

  return { nodes, edges }
}

export function pickFocusSlideIndex(slides: ReadonlyArray<WorkSlide>, activeIndex: number, fallback: number): number {
  const active = slides[activeIndex]
  if (active && active.kind !== "more") return activeIndex
  const previous = slides[fallback]
  if (previous && previous.kind !== "more") return fallback
  const first = slides.findIndex((slide) => slide.kind !== "more")
  return first === -1 ? 0 : first
}
