import { Link } from "@tanstack/react-router"
import { Github, Twitter } from "lucide-react"
import { XninetzyLogo } from "#/components/XninetzyLogo"
import { ROUTES } from "#/lib/domain/routes"

const NAV_COLUMNS: Array<{
  title: string
  links: Array<{ to: string; label: string }>
}> = [
  {
    title: "Research",
    links: [{ to: ROUTES.RESEARCH, label: "Articles" }],
  },
  {
    title: "Build",
    links: [{ to: ROUTES.PROJECTS, label: "Projects" }],
  },
  {
    title: "Lab",
    links: [{ to: ROUTES.ABOUT, label: "About" }],
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-[var(--lab-line)] bg-[var(--lab-bg)]">
      <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-4 py-14 sm:grid-cols-3">
        <div>
          <Link
            to={ROUTES.HOME}
            aria-label="XNINETZY Labs home"
            className="inline-flex items-center gap-3 no-underline"
          >
            <XninetzyLogo size={36} variant="mark" className="relative" />
            <span className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-[0.18em] text-[var(--lab-ink)] sm:text-[15px]">
                XNINETZY
              </span>
              <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.32em] text-[var(--lab-orange)] sm:text-[10px]">
                Labs
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--lab-ink-soft)]">
            A technical AI lab that turns experiments, research, and engineering
            into useful systems.
          </p>
        </div>

        {NAV_COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
              {column.title}
            </p>
            <ul className="mt-4 space-y-2">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-[var(--lab-ink)] no-underline transition-colors hover:text-[var(--lab-orange)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--lab-line)]">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-[var(--lab-ink-soft)] sm:flex-row">
          <p>© {year} XNINETZY Labs. Research · Experiment · Build.</p>
          <div className="flex items-center gap-5">
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Follow XNINETZY Labs on X"
              className="text-[var(--lab-ink-soft)] transition-colors hover:text-[var(--lab-orange)]"
            >
              <Twitter className="size-4" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="View XNINETZY Labs on GitHub"
              className="text-[var(--lab-ink-soft)] transition-colors hover:text-[var(--lab-orange)]"
            >
              <Github className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
