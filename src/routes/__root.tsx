import { useEffect, useState } from "react"
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import Footer from "#/components/Footer"
import Header from "#/components/Header"

import TanStackQueryProvider from "#/integrations/tanstack-query/root-provider"

import TanStackQueryDevtools from "#/integrations/tanstack-query/devtools"

import appCss from "#/styles.css?url"

import type { QueryClient } from "@tanstack/react-query"
import { AskLabsDialog } from "#/components/asklabs/AskLabsDialog"
import { AskLabsFab } from "#/components/asklabs/AskLabsFab"

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title:
          "XNINETZY Labs — Software House · AI, Automation, Web, Mobile",
      },
      {
        name: "description",
        content:
          "XNINETZY Labs is an AI engineering studio that designs, builds, and ships production software — websites, mobile apps, internal tools, AI agents, and workflow automation.",
      },
      { name: "theme-color", content: "#071426" },
      { name: "color-scheme", content: "dark" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "XNINETZY Labs" },
      {
        property: "og:title",
        content: "XNINETZY Labs — Software House · AI, Automation, Web, Mobile",
      },
      {
        property: "og:description",
        content:
          "An AI engineering studio shipping websites, mobile apps, internal tools, agents, and automation for teams that need to move from idea to product.",
      },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "XNINETZY Labs — Software House · AI, Automation, Web, Mobile",
      },
      {
        name: "twitter:description",
        content:
          "AI engineering studio. We design, build, and ship production software end to end.",
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/brand/xninetzy-logo.png", sizes: "any" },
      { rel: "shortcut icon", type: "image/png", href: "/brand/xninetzy-logo.png" },
      { rel: "apple-touch-icon", href: "/brand/xninetzy-logo.png" },
      { rel: "mask-icon", href: "/brand/xninetzy-logo.png", color: "#F65A0B" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname,
  )
  useEffect(() => {
    if (typeof window === "undefined") return
    const handler = () => setCurrentPath(window.location.pathname)
    window.addEventListener("popstate", handler)
    const orig = window.history.pushState
    window.history.pushState = function (...args: Parameters<typeof orig>) {
      const result = orig.apply(this, args)
      window.dispatchEvent(new Event("locationchange"))
      return result
    }
    window.addEventListener("locationchange", handler)
    return () => {
      window.removeEventListener("popstate", handler)
      window.removeEventListener("locationchange", handler)
      window.history.pushState = orig
    }
  }, [])
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(216,91,24,0.24)]">
        <TanStackQueryProvider>
          <Header />
          {children}
          <Footer />
          <AskLabsFab />
          <AskLabsDialog currentPath={currentPath} />
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        </TanStackQueryProvider>
        <Scripts />
      </body>
    </html>
  )
}
