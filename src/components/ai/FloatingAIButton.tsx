import { useState } from "react"
import { motion } from "motion/react"
import { Sparkles } from "lucide-react"
import { Button } from "#/components/ui/button"

export function FloatingAIButton({ onOpen }: { onOpen: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full opacity-70 blur-xl"
        style={{
          background:
            "radial-gradient(circle, rgba(246,90,11,0.55), transparent 65%)",
        }}
      />
      <Button
        type="button"
        onClick={onOpen}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        size="lg"
        className="h-12 gap-2 rounded-full px-5 shadow-[0_8px_32px_-8px_rgba(246,90,11,0.55)] ring-1 ring-[var(--lab-orange)]/40"
        aria-label="Open Ask XNINETZY Labs"
      >
        <Sparkles className="size-4" />
        <span className="font-mono text-sm font-semibold tracking-wider">
          {hover ? "Ask XNINETZY Labs" : "Ask Labs"}
        </span>
      </Button>
    </motion.div>
  )
}
