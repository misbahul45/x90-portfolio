import { describe, expect, it } from "vitest"
import {
  HORIZONTAL_COLUMN_X,
  PROJECT_NODE_ID,
  VERTICAL_ROW_Y,
  buildFocusGraph,
  pickFocusSlideIndex,
  researchNodeId,
  sharedTechCounts,
  techNodeId,
} from "#/lib/domain/work-graph"
import { buildWorkSlides, type WorkProjectInput } from "#/lib/domain/work-slides"

const project = (id: string, technologies: string[], research: string[] = []): WorkProjectInput => ({
  id,
  slug: `slug-${id}`,
  title: `Project ${id}`,
  description: `Description ${id}`,
  coverImage: null,
  technologies,
  research: research.map((title, index) => ({
    article: { id: `${id}-r${index}`, title },
  })),
})

describe("buildWorkSlides", () => {
  it("uses projects when present and appends the view-more slide", () => {
    const slides = buildWorkSlides([project("1", ["Postgres"]), project("2", ["Redis"])])
    expect(slides.map((slide) => slide.kind)).toEqual(["project", "project", "more"])
  })

  it("falls back to service offerings when there are no projects", () => {
    const slides = buildWorkSlides([])
    expect(slides.length).toBeGreaterThan(1)
    expect(slides.at(0)?.kind).toBe("service")
    expect(slides.at(-1)?.kind).toBe("more")
  })

  it("limits technologies and related items per slide", () => {
    const [slide] = buildWorkSlides([
      project("1", ["A", "B", "C", "D", "E", "F", "G", "H"], ["r1", "r2", "r3", "r4", "r5"]),
    ])
    expect(slide.technologies).toHaveLength(6)
    expect(slide.related).toHaveLength(3)
  })
})

describe("buildFocusGraph", () => {
  const [slide] = buildWorkSlides([project("1", ["Postgres", "Redis", "Docker"], ["Note A", "Note B"])])

  it("places research, project and stack in three columns on wide screens", () => {
    const graph = buildFocusGraph(slide, "horizontal")
    const byKind = (kind: string) => graph.nodes.filter((node) => node.kind === kind)
    expect(byKind("project")).toHaveLength(1)
    expect(byKind("research").every((node) => node.x === HORIZONTAL_COLUMN_X.research)).toBe(true)
    expect(byKind("tech").every((node) => node.x === HORIZONTAL_COLUMN_X.tech)).toBe(true)
    expect(graph.nodes.find((node) => node.id === PROJECT_NODE_ID)?.x).toBe(HORIZONTAL_COLUMN_X.project)
  })

  it("centres each column vertically around the project", () => {
    const graph = buildFocusGraph(slide, "horizontal")
    const ys = graph.nodes.filter((node) => node.kind === "tech").map((node) => node.y)
    expect(ys.reduce((sum, value) => sum + value, 0)).toBeCloseTo(0)
  })

  it("stacks rows top to bottom on narrow screens", () => {
    const graph = buildFocusGraph(slide, "vertical")
    expect(graph.nodes.filter((node) => node.kind === "research").every((node) => node.y === VERTICAL_ROW_Y.research)).toBe(true)
    expect(graph.nodes.find((node) => node.id === PROJECT_NODE_ID)?.y).toBe(VERTICAL_ROW_Y.project)
    expect(graph.nodes.filter((node) => node.kind === "tech").every((node) => node.y >= VERTICAL_ROW_Y.tech)).toBe(true)
  })

  it("connects every research note into the project and the project out to each technology", () => {
    const graph = buildFocusGraph(slide, "horizontal")
    expect(graph.edges.filter((edge) => edge.kind === "research").every((edge) => edge.target === PROJECT_NODE_ID)).toBe(true)
    expect(graph.edges.filter((edge) => edge.kind === "stack").map((edge) => edge.target)).toEqual([
      techNodeId("Postgres"),
      techNodeId("Redis"),
      techNodeId("Docker"),
    ])
    expect(graph.edges.map((edge) => edge.source)).toContain(researchNodeId("1-r0"))
  })

  it("has unique node and edge ids", () => {
    const graph = buildFocusGraph(slide, "vertical")
    expect(new Set(graph.nodes.map((node) => node.id)).size).toBe(graph.nodes.length)
    expect(new Set(graph.edges.map((edge) => edge.id)).size).toBe(graph.edges.length)
  })

  it("reports how many other systems share a technology", () => {
    const slides = buildWorkSlides([project("1", ["Postgres", "Redis"]), project("2", ["postgres"]), project("3", ["Postgres"])])
    const usage = sharedTechCounts(slides)
    const graph = buildFocusGraph(slides[0], "horizontal", usage)
    expect(graph.nodes.find((node) => node.id === techNodeId("Postgres"))?.sharedWith).toBe(2)
    expect(graph.nodes.find((node) => node.id === techNodeId("Redis"))?.sharedWith).toBe(0)
  })

  it("ignores the view-more slide when counting usage", () => {
    const usage = sharedTechCounts(buildWorkSlides([project("1", ["Postgres"])]))
    expect(usage.get("postgres")).toBe(1)
  })
})

describe("pickFocusSlideIndex", () => {
  const slides = buildWorkSlides([project("1", ["A"]), project("2", ["B"])])

  it("follows the active slide when it has content", () => {
    expect(pickFocusSlideIndex(slides, 1, 0)).toBe(1)
  })

  it("keeps the previous content slide when the view-more slide is active", () => {
    expect(pickFocusSlideIndex(slides, 2, 1)).toBe(1)
  })

  it("falls back to the first content slide", () => {
    expect(pickFocusSlideIndex(slides, 2, 2)).toBe(0)
  })
})
