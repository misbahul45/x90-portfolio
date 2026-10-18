import { Link } from "@tanstack/react-router"
import { Github } from "lucide-react"
import { XninetzyLogo } from "#/components/XninetzyLogo"
import { SERVICE_OFFERINGS } from "#/lib/domain/services"

const footerLinkClass =
  "text-[15px] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"

function ColumnHeading({ children }: { children: string }) {
  return <p className="text-sm font-medium text-[var(--lab-ink)]">{children}</p>
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-12 border-t border-[var(--lab-line)]">
      <div className="dm-shell py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link
              to="/"
              aria-label="X90 Labs home"
              className="inline-flex items-center gap-2.5 no-underline hover:text-[var(--lab-ink)]"
            >
              <XninetzyLogo size={28} variant="mark" />
              <span className="text-[17px] font-medium tracking-tight text-[var(--lab-ink)]">
                X90 Labs
              </span>
            </Link>
            <p className="dm-subtitle mt-8 max-w-sm">Build useful software. Publish what we learn.</p>
            <a
              href="https://github.com/X90-labs"
              target="_blank"
              rel="noreferrer"
              aria-label="X90 Labs on GitHub"
              className="mt-8 inline-flex items-center gap-2 text-[15px] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
            >
              <Github className="size-4" aria-hidden />
              Follow us on GitHub
            </a>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            <div>
              <ColumnHeading>Work</ColumnHeading>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/" hash="work" className={footerLinkClass}>
                    Selected work
                  </Link>
                </li>
                <li>
                  <Link to="/projects" className={footerLinkClass}>
                    All projects
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <ColumnHeading>Research</ColumnHeading>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/research" className={footerLinkClass}>
                    Latest research
                  </Link>
                </li>
                <li>
                  <Link to="/" hash="lab" className={footerLinkClass}>
                    From the lab
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <ColumnHeading>Services</ColumnHeading>
              <ul className="mt-4 space-y-3">
                {SERVICE_OFFERINGS.map((service) => (
                  <li key={service.key}>
                    <Link to="/" hash="services" className={footerLinkClass}>
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <ColumnHeading>Lab</ColumnHeading>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/about" className={footerLinkClass}>
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/" hash="contact" className={footerLinkClass}>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--lab-line)]">
        <div className="dm-shell flex flex-col gap-2 py-6 text-sm text-[var(--lab-ink-soft)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} X90 Labs</p>
          <p>Research · Experiment · Build</p>
        </div>
      </div>
    </footer>
  )
}
