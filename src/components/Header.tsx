import { Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Github, Menu } from "lucide-react"
import { Button } from "#/components/ui/button"
import { XninetzyLogo } from "#/components/XninetzyLogo"
import { outlinePillClass } from "#/components/deepmind/styles"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet"
import { cn } from "#/lib/utils"

type NavItem =
  | { kind: "page"; to: "/projects" | "/research" | "/about"; label: string }
  | { kind: "section"; hash: string; label: string }

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { kind: "page", to: "/projects", label: "Work" },
  { kind: "page", to: "/research", label: "Research" },
  { kind: "section", hash: "services", label: "Services" },
  { kind: "page", to: "/about", label: "About" },
  { kind: "section", hash: "contact", label: "Contact" },
]

const linkClass =
  "inline-flex h-10 items-center rounded-full px-3.5 text-[15px] font-medium text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-ink)]"

const activeLinkClass = "text-[var(--lab-ink)]"

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  if (item.kind === "section") {
    return (
      <Link to="/" hash={item.hash} onClick={onNavigate} className={linkClass}>
        {item.label}
      </Link>
    )
  }
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className={linkClass}
      activeProps={{ className: cn(linkClass, activeLinkClass) }}
    >
      {item.label}
    </Link>
  )
}

function Wordmark({ size }: { size: number }) {
  return (
    <>
      <XninetzyLogo size={size} variant="mark" />
      <span className="text-[17px] font-medium tracking-tight text-[var(--lab-ink)]">
        X90 Labs
      </span>
    </>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        scrolled
          ? "border-[var(--lab-line)] bg-[var(--lab-bg)]/90 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="dm-shell flex h-16 items-center gap-6">
        <Link
          to="/"
          aria-label="X90 Labs home"
          className="flex items-center gap-2.5 no-underline hover:text-[var(--lab-ink)]"
        >
          <Wordmark size={28} />
        </Link>

        <nav aria-label="Main" className="hidden items-center md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden size-10 rounded-full text-[var(--lab-ink-soft)] hover:bg-transparent hover:text-[var(--lab-orange)] sm:inline-flex"
          >
            <a
              href="https://github.com/X90-labs"
              target="_blank"
              rel="noreferrer"
              aria-label="X90 Labs on GitHub"
            >
              <Github aria-hidden />
            </a>
          </Button>

          <Button asChild variant="outline" className={cn(outlinePillClass, "hidden sm:inline-flex")}>
            <Link to="/" hash="contact">
              Start a brief
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="size-10 rounded-full text-[var(--lab-ink)] hover:bg-transparent hover:text-[var(--lab-orange)] md:hidden"
              >
                <Menu aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(88vw,22rem)] border-l border-[var(--lab-line)] bg-[var(--lab-bg)]"
            >
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2.5">
                  <Wordmark size={26} />
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="mt-6 flex flex-col px-4">
                {NAV_ITEMS.map((item) => (
                  <div key={item.label} className="border-t border-[var(--lab-line)] py-1 text-2xl">
                    <NavLink item={item} onNavigate={() => setOpen(false)} />
                  </div>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-3 p-4">
                <Button asChild variant="outline" className={outlinePillClass}>
                  <Link to="/" hash="contact" onClick={() => setOpen(false)}>
                    Start a brief
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
