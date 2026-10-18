import { describe, expect, it } from "vitest"
import {
  clamp,
  computeSnapPlan,
  computeStops,
  formatSlideLabel,
  nearestIndex,
  scrollProgress,
  slideDepth,
  stepIndex,
  stopForItem,
} from "#/lib/carousel-math"

describe("computeSnapPlan", () => {
  it("clamps trailing slides to the maximum offset but keeps one offset per slide", () => {
    const plan = computeSnapPlan([0, 400, 800, 1200, 1600], 2000, 1000)
    expect(plan.maxOffset).toBe(1000)
    expect(plan.offsets).toEqual([0, 400, 800, 1000, 1000])
  })

  it("returns zero offsets when everything fits", () => {
    const plan = computeSnapPlan([0, 200, 400], 600, 1000)
    expect(plan.maxOffset).toBe(0)
    expect(plan.offsets).toEqual([0, 0, 0])
  })

  it("falls back to a single zero offset when there are no slides", () => {
    expect(computeSnapPlan([], 0, 500).offsets).toEqual([0])
  })
})

describe("nearestIndex", () => {
  it("picks the closest snap position", () => {
    expect(nearestIndex(430, [0, 400, 800])).toBe(1)
    expect(nearestIndex(610, [0, 400, 800])).toBe(2)
    expect(nearestIndex(-50, [0, 400, 800])).toBe(0)
  })
})

describe("stepIndex", () => {
  it("never leaves the valid range", () => {
    expect(stepIndex(0, -1, 4)).toBe(0)
    expect(stepIndex(3, 1, 4)).toBe(3)
    expect(stepIndex(1, 1, 4)).toBe(2)
  })
})

describe("scrollProgress", () => {
  it("is 1 when nothing scrolls and proportional otherwise", () => {
    expect(scrollProgress(0, 0)).toBe(1)
    expect(scrollProgress(250, 1000)).toBe(0.25)
    expect(scrollProgress(5000, 1000)).toBe(1)
  })
})

describe("slideDepth", () => {
  it("is zero at the centre and clamps to the unit range", () => {
    expect(slideDepth(500, 500, 1000)).toBe(0)
    expect(slideDepth(1000, 500, 1000)).toBe(0.5)
    expect(slideDepth(9000, 500, 1000)).toBe(1)
    expect(slideDepth(-9000, 500, 1000)).toBe(-1)
    expect(slideDepth(10, 500, 0)).toBe(0)
  })
})

describe("formatSlideLabel and clamp", () => {
  it("formats a one-based slide label", () => {
    expect(formatSlideLabel(0, 6)).toBe("Slide 1 of 6")
    expect(formatSlideLabel(5, 6)).toBe("Slide 6 of 6")
  })

  it("clamps values", () => {
    expect(clamp(5, 0, 3)).toBe(3)
    expect(clamp(-5, 0, 3)).toBe(0)
  })
})


describe("carousel stops", () => {
  const offsets = [0, 440, 880, 968, 968]

  it("keeps only positions the track can actually reach", () => {
    expect(computeStops(offsets)).toEqual([0, 1, 2, 3])
  })

  it("keeps every slide when none are clamped", () => {
    expect(computeStops([0, 100, 200])).toEqual([0, 1, 2])
  })

  it("handles an empty or single slide list", () => {
    expect(computeStops([])).toEqual([0])
    expect(computeStops([0])).toEqual([0])
  })

  it("maps a slide that shares the final offset to the first reachable stop", () => {
    const stops = computeStops(offsets)
    expect(stopForItem(4, stops, offsets)).toBe(3)
    expect(stopForItem(3, stops, offsets)).toBe(3)
    expect(stopForItem(1, stops, offsets)).toBe(1)
  })

  it("folds a tiny final step into the last stop so Next always travels", () => {
    const landing = [0, 440, 880, 1320, 1400]
    const stops = computeStops(landing, 176)
    expect(stops).toEqual([0, 1, 2, 4])
    expect(stopForItem(3, stops, landing)).toBe(3)
    expect(stopForItem(4, stops, landing)).toBe(3)
  })

  it("keeps the first stop when the whole track is only slightly wider than the viewport", () => {
    expect(computeStops([0, 40, 80], 176)).toEqual([0, 2])
  })

  it("clamps out-of-range slide indices", () => {
    const stops = computeStops(offsets)
    expect(stopForItem(99, stops, offsets)).toBe(3)
    expect(stopForItem(-4, stops, offsets)).toBe(0)
  })
})
