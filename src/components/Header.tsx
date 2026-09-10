import { Link, useRouterState } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"
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

const SECTION_LINKS: ReadonlyArray<{ section: string; label: string }> = [
  { section: "services", label: "Services" },
  { section: "how-we-build", label: "Process" },
  { section: "contact", label: "Contact" },
]

const PAGE_LINKS: ReadonlyArray<{ to: string; label: string }> = [
  { to: ROUTES.PROJECTS, label: "Projects" },
  { to: ROUTES.RESEARCH, label: "Research" },
]

type NavItem =
  | { kind: "section"; section: string; label: string }
  | { kind: "page"; to: string; label: string }

const NAV_LINKS: NavItem[] = [
  ...PAGE_LINKS.map((link) => ({ kind: "page" as const, to: link.to, label: link.label })),
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
  const top = element.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({ top, behavior: "smooth" })
}

function navigateToSection(
  section: string,
  isHome: boolean,
  callback?: () => void,
) {
  if (isHome) {
    smoothScrollTo(section)
    callback?.()
    return
  }
  callback?.()
  window.location.href = `${ROUTES.HOME}#${section}`
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isHome = pathname === ROUTES.HOME

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!isHome || typeof window === "undefined") return
    const hash = window.location.hash.replace(/^#/, "")
    if (!hash) return
    const id = window.setTimeout(() => smoothScrollTo(hash), 60)
    return () => window.clearTimeout(id)
  }, [isHome, pathname])

  const handleSectionClick = useCallback(
    (section: string, close?: () => void) =>
      (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        navigateToSection(section, isHome, close)
      },
    [isHome],
  )

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-[var(--lab-line)] bg-[var(--lab-bg-soft)] backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="relative">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 -bottom-px h-px transition-opacity duration-500",
            scrolled ? "opacity-100" : "opacity-0",
          )}
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(246,90,11,0.55) 50%, transparent 100%)",
          }}
        />

        <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center gap-3 px-4 sm:h-[68px]">
          <Link
            to={ROUTES.HOME}
            className="group flex items-center gap-2.5 no-underline"
            aria-label="XNINETZY Labs home"
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

          <span
            aria-hidden
            className="mx-2 hidden h-6 w-px bg-gradient-to-b from-transparent via-[var(--lab-line-strong)] to-transparent md:block"
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
                        className="group relative inline-flex h-9 items-center px-3 font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="group relative inline-flex h-9 items-center px-3 font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
                        activeProps={{
                          className: "text-[var(--lab-orange)]",
                        }}
                      >
                        {link.label}
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
              className="size-9 text-[var(--lab-ink-soft)] hover:text-[var(--lab-orange)]"
              aria-label="View on GitHub"
            >
              <a
                href="https://github.com/X90-labs"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="size-4" />
              </a>
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 border-l-[var(--lab-line)] bg-[var(--lab-bg)]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-[var(--lab-ink)]">
                    <XninetzyLogo size={28} variant="mark" />
                    <span className="flex flex-col leading-tight">
                      <span className="text-sm font-bold tracking-[0.18em]">XNINETZY</span>
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
                          onClick={handleSectionClick(link.section, () => setOpen(false))}
                          className="group flex items-center justify-between border-b border-transparent px-1 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] transition-colors hover:text-[var(--lab-orange)]"
                        >
                          <span>{link.label}</span>
                        </a>
                      )
                    }
                    return (
                      <Link
                        key={link.label}
                        to={link.to}
                        onClick={() => setOpen(false)}
                        className="group flex items-center justify-between border-b border-transparent px-1 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
                      >
                        <span>{link.label}</span>
                      </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

