import { createFileRoute } from "@tanstack/react-router"
import { HeroSection } from "#/components/hero/HeroSection"
import { ServicesGrid } from "#/components/home/ServicesGrid"
import { WorkflowSection } from "#/components/home/WorkflowCanvas"
import { ArchitectureShowcase } from "#/components/home/ArchitectureShowcase"
import { SelectedProjects } from "#/components/home/SelectedProjects"
import { ProcessTimeline } from "#/components/home/ProcessTimeline"
import { TechStackGrid } from "#/components/home/TechStackGrid"
import { ResearchPipeline } from "#/components/home/ResearchPipeline"
import { LatestResearch } from "#/components/home/LatestResearch"
import { TestimonialCarousel } from "#/components/home/TestimonialCarousel"
import { ClientLogos } from "#/components/home/ClientLogos"
import { ContactSection } from "#/components/home/ContactSection"
import { FinalCTA } from "#/components/home/FinalCTA"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "XNINETZY Labs — Software House · Automation, AI, Web, Mobile" },
      {
        name: "description",
        content:
          "Me + the team. Custom automation, AI assistants, agentic systems, full web, full mobile. Brief in, working product out — production-grade, not prototypes.",
      },
      { property: "og:title", content: "XNINETZY Labs — Software House" },
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
      <ServicesGrid />
      <WorkflowSection />
      <ArchitectureShowcase />
      <SelectedProjects />
      <ProcessTimeline />
      <TechStackGrid />
      <ResearchPipeline />
      <LatestResearch />
      <TestimonialCarousel />
      <ClientLogos />
      <ContactSection />
      <FinalCTA />
    </main>
  )
}
