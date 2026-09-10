import { useState } from "react"
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
import { FloatingAIButton } from "#/components/ai/FloatingAIButton"
import { AIAssistantDialog } from "#/components/ai/AIAssistantDialog"

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
  const [currentPath] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname,
  )
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
          <FloatingAIButton onOpen={() => document.dispatchEvent(new CustomEvent("xninetzy:ai-open"))} />
          <AIAssistantDialog currentPath={currentPath} />
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
