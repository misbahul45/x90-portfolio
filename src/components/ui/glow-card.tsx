import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { cn } from "#/lib/utils"

type GlowCardProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode
  static?: boolean
}

export function GlowCard({ children, className, static: isStatic = false, ...rest }: GlowCardProps) {
  return (
    <div
      className={cn(isStatic ? "glow-card-static" : "glow-card", className)}
      {...rest}
    >
      {children}
    </div>
  )
}
