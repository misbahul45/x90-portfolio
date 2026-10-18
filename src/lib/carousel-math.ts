export type SnapPlan = {
  offsets: number[]
  maxOffset: number
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function computeSnapPlan(
  slideLefts: ReadonlyArray<number>,
  trackWidth: number,
  viewportWidth: number,
): SnapPlan {
  const maxOffset = Math.max(0, trackWidth - viewportWidth)
  const offsets = slideLefts.map((left) => clamp(left, 0, maxOffset))
  return { offsets: offsets.length > 0 ? offsets : [0], maxOffset }
}

export function nearestIndex(offset: number, positions: ReadonlyArray<number>): number {
  let best = 0
  let bestDistance = Number.POSITIVE_INFINITY
  positions.forEach((position, index) => {
    const distance = Math.abs(position - offset)
    if (distance < bestDistance) {
      best = index
      bestDistance = distance
    }
  })
  return best
}

export function computeStops(offsets: ReadonlyArray<number>, minGap = 0.5): number[] {
  const stops: number[] = []
  let lastOffset = Number.NEGATIVE_INFINITY
  offsets.forEach((offset, index) => {
    if (offset - lastOffset > minGap) {
      stops.push(index)
      lastOffset = offset
    }
  })
  const finalOffset = Math.max(0, ...offsets)
  if (stops.length > 0 && lastOffset < finalOffset - 0.5) {
    const finalIndex = offsets.findIndex((offset) => offset >= finalOffset - 0.5)
    if (stops.length > 1) stops[stops.length - 1] = finalIndex
    else stops.push(finalIndex)
  }
  return stops.length > 0 ? stops : [0]
}

export function stopForItem(
  item: number,
  stops: ReadonlyArray<number>,
  offsets: ReadonlyArray<number>,
): number {
  const target = offsets[clamp(item, 0, Math.max(0, offsets.length - 1))] ?? 0
  return nearestIndex(
    target,
    stops.map((index) => offsets[index] ?? 0),
  )
}

export function stepIndex(current: number, delta: number, count: number): number {
  return clamp(current + delta, 0, Math.max(0, count - 1))
}

export function scrollProgress(offset: number, maxOffset: number): number {
  if (maxOffset <= 0) return 1
  return clamp(offset / maxOffset, 0, 1)
}

export function slideDepth(
  slideCenter: number,
  viewportCenter: number,
  viewportWidth: number,
): number {
  if (viewportWidth <= 0) return 0
  return clamp((slideCenter - viewportCenter) / viewportWidth, -1, 1)
}

export function formatSlideLabel(index: number, total: number): string {
  return `Slide ${index + 1} of ${total}`
}
