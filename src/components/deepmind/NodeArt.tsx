import { useMemo } from "react"
import { generateNodeArt } from "#/lib/seeded-art"

type NodeArtProps = {
  seed: string
  className?: string
}

export function NodeArt({ seed, className }: NodeArtProps) {
  const art = useMemo(() => generateNodeArt(seed), [seed])
  const byId = useMemo(() => new Map(art.nodes.map((node) => [node.id, node])), [art])

  return (
    <svg
      viewBox={`0 0 ${art.width} ${art.height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
      className={className ?? "h-full w-full"}
    >
      {art.edges.map((edge) => {
        const from = byId.get(edge.from)
        const to = byId.get(edge.to)
        if (!from || !to) return null
        return (
          <line
            key={`${edge.from}-${edge.to}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            strokeWidth={1}
            className="stroke-[var(--lab-line-strong)]"
          />
        )
      })}
      {art.nodes.map((node) => (
        <g key={node.id}>
          {node.accent ? (
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size + 6}
              fill="none"
              strokeWidth={1}
              className="stroke-[var(--lab-orange)] opacity-60"
            />
          ) : null}
          <circle
            cx={node.x}
            cy={node.y}
            r={node.size}
            className={node.accent ? "fill-[var(--lab-orange)]" : "fill-[var(--lab-ink-soft)]"}
          />
        </g>
      ))}
    </svg>
  )
}
