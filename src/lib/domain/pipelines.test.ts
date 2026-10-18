import { describe, expect, it } from "vitest"
import {
  PIPELINES,
  PIPELINE_NODE_GAP_X,
  PIPELINE_NODE_GAP_Y,
  PIPELINE_NODE_HEIGHT,
  PIPELINE_NODE_WIDTH,
  findPipeline,
  layoutPipeline,
  nextStageIndex,
  stageStatus,
} from "./pipelines"

describe("pipelines", () => {
  it("defines three pipelines with five unique stages each", () => {
    expect(PIPELINES.map((pipeline) => pipeline.key)).toEqual(["delivery", "research", "finetune"])
    for (const pipeline of PIPELINES) {
      expect(pipeline.stages).toHaveLength(5)
      expect(new Set(pipeline.stages.map((stage) => stage.id)).size).toBe(5)
    }
  })

  it("lays stages out left to right on wide screens", () => {
    const positions = layoutPipeline(3, "horizontal")
    const step = PIPELINE_NODE_WIDTH + PIPELINE_NODE_GAP_X
    expect(positions).toEqual([
      { x: 0, y: 0 },
      { x: step, y: 0 },
      { x: step * 2, y: 0 },
    ])
  })

  it("lays stages out top to bottom on narrow screens", () => {
    const positions = layoutPipeline(2, "vertical")
    expect(positions[1]).toEqual({ x: 0, y: PIPELINE_NODE_HEIGHT + PIPELINE_NODE_GAP_Y })
  })

  it("returns no positions for an empty pipeline", () => {
    expect(layoutPipeline(0, "horizontal")).toEqual([])
    expect(layoutPipeline(-2, "vertical")).toEqual([])
  })

  it("wraps the active stage around", () => {
    expect(nextStageIndex(0, 5)).toBe(1)
    expect(nextStageIndex(4, 5)).toBe(0)
    expect(nextStageIndex(3, 0)).toBe(0)
  })

  it("classifies stage status relative to the active stage", () => {
    expect(stageStatus(0, 2)).toBe("done")
    expect(stageStatus(2, 2)).toBe("active")
    expect(stageStatus(4, 2)).toBe("upcoming")
  })

  it("finds a pipeline by key", () => {
    expect(findPipeline("finetune")?.label).toBe("Fine-tuning pipeline")
    expect(findPipeline("missing")).toBeUndefined()
  })
})
