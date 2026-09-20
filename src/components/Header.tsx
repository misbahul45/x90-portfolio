import { Link, useRouterState } from "@tanstack/react-router"
import { useCallback, useEffect, useState, type MouseEvent } from "react"
import { Github, Menu } from "lucide-react"
import { Button } from "#/components/ui/button"
import { XninetzyLogo } from "#/components/XninetzyLogo"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "#/components/ui/navigation-menu"
import { ROUTES } from "#/lib/domain/routes"
import { cn } from "#/lib/utils"

const SECTION_LINKS: ReadonlyArray<{
  section: string
  label: string
}> = [
  { section: "services", label: "Services" },
  { section: "how-we-build", label: "Process" },
  { section: "contact", label: "Contact" },
]

const PAGE_LINKS: ReadonlyArray<{
  to: string
  label: string
}> = [
  { to: ROUTES.PROJECTS, label: "Projects" },
  { to: ROUTES.RESEARCH, label: "Research" },
]

type NavItem =
  | {
      kind: "section"
      section: string
      label: string
    }
  | {
      kind: "page"
      to: string
      label: string
    }

const NAV_LINKS: NavItem[] = [
  ...PAGE_LINKS.map((link) => ({
    kind: "page" as const,
    to: link.to,
    label: link.label,
  })),
  ...SECTION_LINKS.map((link) => ({
    kind: "section" as const,
    section: link.section,
    label: link.label,
  })),
]

function smoothScrollTo(targetId: string) {
  const element = document.getElementById(targetId)

  if (!element) return

  const headerOffset = 72
  const top =
    element.getBoundingClientRect().top +
    window.scrollY -
    headerOffset

  window.scrollTo({
    top,
    behavior: "smooth",
  })
}

function navigateToSection(
  section: string,
  isHome: boolean,
  callback?: () => void,
) {
  if (isHome) {
    smoothScrollTo(section)
    window.history.replaceState(null, "", `#${section}`)
    callback?.()
    return
  }

  callback?.()
  window.location.href = `${ROUTES.HOME}#${section}`
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const isHome = pathname === ROUTES.HOME

  useEffect(() => {
    const updateScroll = () => {
      const scrollTop =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0

      setScrolled(scrollTop > 20)
    }

    updateScroll()

    window.addEventListener("scroll", updateScroll, {
      passive: true,
    })

    return () => {
      window.removeEventListener("scroll", updateScroll)
    }
  }, [])

  useEffect(() => {
    if (!isHome || typeof window === "undefined") return

    const hash = window.location.hash.replace(/^#/, "")

    if (!hash) return

    const timeout = window.setTimeout(() => {
      smoothScrollTo(hash)
    }, 100)

    return () => window.clearTimeout(timeout)
  }, [isHome, pathname])

  const handleSectionClick = useCallback(
    (section: string, close?: () => void) =>
      (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        navigateToSection(section, isHome, close)
      },
    [isHome],
  )

  const desktopLinkClass = cn(
    "group relative inline-flex h-10 items-center rounded-md px-3 font-mono text-[11px] uppercase tracking-[0.16em] no-underline",
    "transition-all duration-500 ease-out",
    scrolled
      ? "!text-[var(--lab-orange)]"
      : "!text-white",
    "hover:!text-[var(--lab-orange)]",
    "focus-visible:!text-[var(--lab-orange)]",
    "data-[active]:!text-[var(--lab-orange)]",
    "data-[active=true]:!text-[var(--lab-orange)]",
    "data-[state=active]:!text-[var(--lab-orange)]",
    "data-[active]:!bg-[var(--lab-orange)]/10",
    "data-[active=true]:!bg-[var(--lab-orange)]/10",
    "data-[state=active]:!bg-[var(--lab-orange)]/10",
  )

  const mobileLinkClass =
    "group flex items-center justify-between border-b border-white/5 px-1 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-all duration-300 hover:border-[var(--lab-orange)]/30 hover:text-[var(--lab-orange)]"

  return (
    <>
      <style>{`
        @property --xn-nav-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes xn-nav-angle {
          from {
            --xn-nav-angle: 0deg;
          }

          to {
            --xn-nav-angle: 360deg;
          }
        }

        @keyframes xn-nav-shimmer {
          0% {
            transform: translateX(-120%);
          }

          100% {
            transform: translateX(120%);
          }
        }

        @keyframes xn-nav-glow {
          0%,
          100% {
            opacity: 0.35;
            transform: scaleX(0.8);
          }

          50% {
            opacity: 0.9;
            transform: scaleX(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .xn-nav-animated {
            animation: none !important;
          }
        }
      `}</style>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 w-full transition-all duration-700",
          scrolled
            ? "bg-[rgba(7,20,38,0.72)] backdrop-blur-2xl"
            : "bg-transparent",
        )}
      >
        <div className="relative">
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden transition-opacity duration-700",
              scrolled ? "opacity-100" : "opacity-0",
            )}
          >
            <div
              className="xn-nav-animated absolute inset-[-1px]"
              style={{
                background:
                  "linear-gradient(90deg,transparent 0%,rgba(246,90,11,0.08) 10%,rgba(246,90,11,0.5) 25%,rgba(255,194,120,1) 50%,rgba(246,90,11,0.5) 75%,rgba(246,90,11,0.08) 90%,transparent 100%)",
                backgroundSize: "200% 100%",
                animation:
                  "xn-nav-shimmer 3.8s linear infinite",
              }}
            />

            <div
              className="xn-nav-animated absolute inset-x-[8%] bottom-0 h-2 blur-[6px]"
              style={{
                background:
                  "linear-gradient(90deg,transparent,rgba(246,90,11,0.8),rgba(255,194,120,0.95),rgba(246,90,11,0.8),transparent)",
                animation:
                  "xn-nav-glow 3s ease-in-out infinite",
              }}
            />

            <div
              className="xn-nav-animated absolute inset-x-[15%] bottom-0 h-px"
              style={{
                background:
                  "conic-gradient(from var(--xn-nav-angle),transparent 0deg,rgba(246,90,11,0.05) 45deg,rgba(246,90,11,0.9) 110deg,rgba(255,194,120,1) 150deg,rgba(246,90,11,0.1) 220deg,transparent 280deg,rgba(246,90,11,0.7) 330deg,transparent 360deg)",
                animation:
                  "xn-nav-angle 8s linear infinite",
              }}
            />
          </div>

          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 transition-opacity duration-700",
              scrolled ? "opacity-100" : "opacity-0",
            )}
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(246,90,11,0.11), transparent 65%)",
            }}
          />

          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-1/2 top-0 h-20 w-[38%] -translate-x-1/2 rounded-full blur-3xl transition-all duration-1000",
              scrolled
                ? "scale-100 opacity-20"
                : "scale-75 opacity-0",
            )}
            style={{
              background:
                "radial-gradient(circle, rgba(246,90,11,0.75), transparent 70%)",
            }}
          />

          <div className="relative mx-auto flex h-16 w-full max-w-[1240px] items-center gap-3 px-4 sm:h-[68px]">
            <Link
              to={ROUTES.HOME}
              aria-label="XNINETZY Labs home"
              className="group flex items-center gap-2.5 no-underline"
            >
              <div className="relative">
                <div
                  aria-hidden
                  className={cn(
                    "absolute inset-0 rounded-full bg-[var(--lab-orange)] blur-2xl transition-all duration-700",
                    scrolled
                      ? "scale-110 opacity-40"
                      : "scale-75 opacity-0",
                  )}
                />

                <XninetzyLogo
                  size={36}
                  variant="mark"
                  className="relative transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <span className="flex flex-col leading-none">
                <span
                  className={cn(
                    "text-sm font-bold tracking-[0.18em] transition-colors duration-500 sm:text-[15px]",
                    scrolled
                      ? "!text-[var(--lab-orange)]"
                      : "!text-white",
                  )}
                >
                  XNINETZY
                </span>

                <span
                  className={cn(
                    "mt-0.5 font-mono text-[9px] uppercase tracking-[0.32em] transition-colors duration-500 sm:text-[10px]",
                    scrolled
                      ? "!text-[var(--lab-orange)]"
                      : "!text-white",
                  )}
                >
                  Labs
                </span>
              </span>
            </Link>

            <span
              aria-hidden
              className={cn(
                "mx-2 hidden h-6 w-px transition-all duration-500 md:block",
                scrolled
                  ? "bg-[var(--lab-orange)]/30"
                  : "bg-white/20",
              )}
            />

            <NavigationMenu className="ml-auto hidden md:flex">
              <NavigationMenuList className="gap-1">
                {NAV_LINKS.map((link) => (
                  <NavigationMenuItem key={link.label}>
                    <NavigationMenuLink asChild>
                      {link.kind === "section" ? (
                        <a
                          href={`${ROUTES.HOME}#${link.section}`}
                          onClick={handleSectionClick(link.section)}
                          className={desktopLinkClass}
                        >
                          <span className="relative z-10">
                            {link.label}
                          </span>

                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-x-2 bottom-1 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-[var(--lab-orange)] to-transparent opacity-0 transition-all duration-500 group-hover:scale-x-100 group-hover:opacity-100"
                          />

                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-[var(--lab-orange)]/[0.03] opacity-0 transition-all duration-500 group-hover:opacity-100"
                          />
                        </a>
                      ) : (
                        <Link
                          to={link.to}
                          className={desktopLinkClass}
                          activeProps={{
                            className: cn(
                              desktopLinkClass,
                              "!text-[var(--lab-orange)]",
                              "!bg-[var(--lab-orange)]/10",
                              "data-[active]:!text-[var(--lab-orange)]",
                            ),
                          }}
                        >
                          <span className="relative z-10">
                            {link.label}
                          </span>

                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-x-2 bottom-1 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-[var(--lab-orange)] to-transparent opacity-0 transition-all duration-500 group-hover:scale-x-100 group-hover:opacity-100"
                          />

                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-[var(--lab-orange)]/[0.03] opacity-0 transition-all duration-500 group-hover:opacity-100"
                          />
                        </Link>
                      )}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            <div className="ml-auto flex items-center gap-2 md:ml-3">
              <Button
                asChild
                size="icon"
                variant="ghost"
                aria-label="Open XNINETZY Labs GitHub"
                className={cn(
                  "size-9 rounded-full transition-all duration-500",
                  scrolled
                    ? "!text-[var(--lab-orange)] hover:!bg-[var(--lab-orange)]/10 hover:!text-[var(--lab-orange)]"
                    : "!text-white hover:!bg-white/10 hover:!text-white",
                )}
              >
                <a
                  href="https://github.com/X90-labs"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="size-4 transition-transform duration-300 hover:rotate-[-8deg]" />
                </a>
              </Button>

              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Open menu"
                    className={cn(
                      "size-9 rounded-full transition-all duration-500 md:hidden",
                      scrolled
                        ? "!text-[var(--lab-orange)] hover:!bg-[var(--lab-orange)]/10"
                        : "!text-white hover:!bg-white/10",
                    )}
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  className="w-80 border-l border-[var(--lab-line)] bg-[var(--lab-bg)]"
                >
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-[var(--lab-ink)]">
                      <XninetzyLogo
                        size={28}
                        variant="mark"
                      />

                      <span className="flex flex-col leading-tight">
                        <span className="text-sm font-bold tracking-[0.18em]">
                          XNINETZY
                        </span>

                        <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-[var(--lab-orange)]">
                          Labs
                        </span>
                      </span>
                    </SheetTitle>
                  </SheetHeader>

                  <nav className="mt-8 flex flex-col gap-1">
                    {NAV_LINKS.map((link) => {
                      if (link.kind === "section") {
                        return (
                          <a
                            key={link.label}
                            href={`${ROUTES.HOME}#${link.section}`}
                            onClick={handleSectionClick(
                              link.section,
                              () => setOpen(false),
                            )}
                            className={mobileLinkClass}
                          >
                            <span>{link.label}</span>

                            <span className="h-px w-0 bg-[var(--lab-orange)] transition-all duration-300 group-hover:w-8" />
                          </a>
                        )
                      }

                      return (
                        <Link
                          key={link.label}
                          to={link.to}
                          onClick={() => setOpen(false)}
                          className={mobileLinkClass}
                          activeProps={{
                            className: cn(
                              mobileLinkClass,
                              "!border-[var(--lab-orange)]/30",
                              "!text-[var(--lab-orange)]",
                              "!bg-[var(--lab-orange)]/5",
                            ),
                          }}
                        >
                          <span>{link.label}</span>

                          <span className="h-px w-0 bg-[var(--lab-orange)] transition-all duration-300 group-hover:w-8" />
                        </Link>
                      )
                    })}
                  </nav>

                  <div className="mt-8 border-t border-[var(--lab-line)] pt-6">
                    <a
                      href="https://github.com/X90-labs"
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-3 rounded-lg border border-[var(--lab-line)] bg-white/[0.03] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--lab-ink-soft)] no-underline transition-all duration-300 hover:border-[var(--lab-orange)]/30 hover:bg-[var(--lab-orange)]/5 hover:text-[var(--lab-orange)]"
                    >
                      <Github className="size-4" />
                      <span>X90 Labs GitHub</span>
                    </a>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}