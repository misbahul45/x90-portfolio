import { motion } from "motion/react"

const BLOCK_LAYOUT: ReadonlyArray<{
  top: string
  left: string
  width: string
  height: string
  opacity: number
  accent?: boolean
}> = [
  { top: "8%", left: "6%", width: "180px", height: "120px", opacity: 0.06 },
  { top: "12%", left: "22%", width: "140px", height: "84px", opacity: 0.08, accent: true },
  { top: "20%", left: "74%", width: "200px", height: "110px", opacity: 0.05 },
  { top: "32%", left: "12%", width: "120px", height: "60px", opacity: 0.07 },
  { top: "38%", left: "84%", width: "150px", height: "90px", opacity: 0.06 },
  { top: "48%", left: "4%", width: "100px", height: "140px", opacity: 0.08 },
  { top: "54%", left: "60%", width: "160px", height: "70px", opacity: 0.07 },
  { top: "62%", left: "28%", width: "90px", height: "60px", opacity: 0.05 },
  { top: "70%", left: "78%", width: "120px", height: "80px", opacity: 0.08, accent: true },
  { top: "78%", left: "10%", width: "140px", height: "70px", opacity: 0.06 },
  { top: "82%", left: "44%", width: "110px", height: "60px", opacity: 0.05 },
  { top: "86%", left: "64%", width: "180px", height: "60px", opacity: 0.07 },
]

export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#F65A0B]" />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 18% 20%, rgba(255, 174, 92, 0.35), transparent 60%), radial-gradient(45% 40% at 85% 80%, rgba(233, 75, 0, 0.4), transparent 65%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 35%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 35%, transparent 85%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
      />
      {BLOCK_LAYOUT.map((block, idx) => (
        <motion.span
          key={`${block.top}-${block.left}-${idx}`}
          aria-hidden
          className="absolute rounded-md border border-white/20"
          style={{
            top: block.top,
            left: block.left,
            width: block.width,
            height: block.height,
            backgroundColor: block.accent
              ? "rgba(255, 220, 160, 0.35)"
              : `rgba(255, 255, 255, ${block.opacity})`,
            animation: `hero-block-drift ${18 + idx % 5}s ease-in-out ${idx * 0.4}s infinite alternate`,
          }}
        />
      ))}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1400 800"
        preserveAspectRatio="none"
      >
        <g stroke="rgba(255,255,255,0.18)" strokeWidth="1" fill="none">
          <path d="M120 120 L320 120 L320 220 L520 220" />
          <path d="M980 80 L1180 80 L1180 200 L1320 200" />
          <path d="M80 640 L260 640 L260 740 L420 740" />
          <path d="M900 600 L1080 600 L1080 700 L1240 700" />
        </g>
        <g fill="rgba(255,255,255,0.35)">
          <circle cx="320" cy="120" r="2.5" />
          <circle cx="520" cy="220" r="2.5" />
          <circle cx="1180" cy="80" r="2.5" />
          <circle cx="1320" cy="200" r="2.5" />
          <circle cx="260" cy="640" r="2.5" />
          <circle cx="420" cy="740" r="2.5" />
          <circle cx="1080" cy="600" r="2.5" />
          <circle cx="1240" cy="700" r="2.5" />
        </g>
      </svg>
      <div
        className="absolute left-1/2 top-1/2 h-[520px] w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 220, 180, 0.5), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            "linear-gradient(to top, rgba(7, 21, 38, 0.55), transparent)",
        }}
      />
    </div>
  )
}
