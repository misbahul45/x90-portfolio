import { CLIENT_LOGOS, type ClientLogo } from "#/lib/domain/clients"
import { cn } from "#/lib/utils"

function LogoTile({ logo, className }: { logo: ClientLogo; className?: string }) {
  return (
    <div
      className={cn(
        "group flex h-20 shrink-0 items-center justify-center gap-3 border border-[var(--lab-line)] bg-[var(--lab-card)] px-6 transition-colors hover:border-[var(--lab-orange)]/60 hover:bg-[var(--lab-card-elevated)]",
        className,
      )}
    >
      <span className="font-mono text-sm font-bold text-[var(--lab-orange)]">
        {logo.initials}
      </span>
      <div className="text-left">
        <p className="text-sm font-semibold leading-none text-[var(--lab-ink)]">
          {logo.name}
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
          {logo.sector}
        </p>
      </div>
    </div>
  )
}

export function ClientLogos() {
  const doubled = [...CLIENT_LOGOS, ...CLIENT_LOGOS]

  return (
    <section className="lab-page-bg border-b border-[var(--lab-line)] py-16">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <div className="mb-8 flex items-center justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--lab-ink-soft)]">
            {CLIENT_LOGOS.length}+ projects shipped
          </p>
        </div>
      </div>

      <div
        className="relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="flex w-max gap-4 marquee-track">
          {doubled.map((logo, index) => (
            <LogoTile
              key={`${logo.id}-${index}`}
              logo={logo}
              className="min-w-[220px]"
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 30s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  )
}
