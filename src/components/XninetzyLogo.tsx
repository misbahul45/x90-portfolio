import type { CSSProperties } from "react"
import { cn } from "#/lib/utils"

type Props = {
  size?: number
  variant?: "mark" | "wordmark" | "full"
  className?: string
  style?: CSSProperties
}

const ASSET = "/brand/xninetzy-logo.png"

export function XninetzyLogo({ size = 32, variant = "mark", className, style }: Props) {
  const dims =
    variant === "full"
      ? { width: size * 2.4, height: size }
      : variant === "wordmark"
        ? { width: size * 2.2, height: size * 0.45 }
        : { width: size, height: size }

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ ...dims, ...style }}
    >
      <img
        src={ASSET}
        alt="XNINETZY Labs"
        width={dims.width}
        height={dims.height}
        decoding="async"
        loading="eager"
        className="h-full w-full select-none object-contain"
        draggable={false}
      />
    </span>
  )
}
