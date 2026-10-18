import { createFileRoute } from "@tanstack/react-router"
import { HeroSection } from "#/components/hero/HeroSection"
import { WorkCarouselSection } from "#/components/deepmind/WorkCarouselSection"
import { LatestResearch } from "#/components/home/LatestResearch"
import { ServicesList } from "#/components/home/ServicesList"
import { LabSection } from "#/components/home/LabSection"
import { ProcessTimeline } from "#/components/home/ProcessTimeline"
import { TechStackGrid } from "#/components/home/TechStackGrid"
import { TestimonialCarousel } from "#/components/home/TestimonialCarousel"
import { ContactSection } from "#/components/home/ContactSection"
import { FinalCTA } from "#/components/home/FinalCTA"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "X90 Labs — Software House · Automation, AI, Web, Mobile" },
      {
        name: "description",
        content:
          "Me + the team. Custom automation, AI assistants, agentic systems, full web, full mobile. Brief in, working product out — production-grade, not prototypes.",
      },
      { property: "og:title", content: "X90 Labs — Software House" },
      {
        property: "og:description",
        content:
          "Automation, AI assistants, agentic systems, full web, full mobile. Production-grade, not prototypes.",
      },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <main>
      <HeroSection />
      <WorkCarouselSection />
      <LatestResearch />
      <ServicesList />
      <LabSection />
      <ProcessTimeline />
      <TechStackGrid />
      <TestimonialCarousel />
      <ContactSection />
      <FinalCTA />
    </main>
  )
}
