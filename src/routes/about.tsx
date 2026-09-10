import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import { Github, Linkedin, Globe, Code2, Database, MessageSquare } from "lucide-react"
import { useTeamMembers } from "#/hooks/useTeamMembers"
import { Skeleton } from "#/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — XNINETZY Labs" },
      { name: "description", content: "Research. Experiment. Build. A technical AI lab turning experiments into systems." },
    ],
  }),
  component: AboutPage,
})

const PILLARS = [
  {
    title: "Research",
    description: "Experiments in ML, DL, LLM, RAG, and agentic systems — published as engineering notes and benchmarks.",
    icon: Database,
  },
  {
    title: "Build",
    description: "AI automation, web applications, agentic systems, AI assistants, data intelligence — production-grade.",
    icon: Code2,
  },
  {
    title: "Community",
    description: "Team members, projects, feedback, knowledge sharing — open by default and built around people.",
    icon: MessageSquare,
  },
] as const

function AboutPage() {
  const { data: members, isPending, isError } = useTeamMembers({})
  const lead = members?.find((member) => member.featured) ?? members?.[0]

  return (
    <main className="border-t border-border bg-background">
      <section className="mx-auto w-full max-w-[1080px] px-4 py-16 sm:py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={VIEWPORT_OPTIONS} variants={fadeInUp}>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            About XNINETZY Labs
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Research. Experiment. Build. We are a technical AI lab that turns
            experiments, research, and engineering into useful systems.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="mt-12 grid gap-4 sm:grid-cols-3"
        >
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div key={pillar.title} className="rounded-xl border border-border bg-card p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-4.5" />
                </div>
                <h2 className="mt-3 text-lg font-semibold text-foreground">{pillar.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{pillar.description}</p>
              </div>
            )
          })}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground">The lab</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            People who research, experiment, and build.
          </p>
        </motion.div>

        {isPending && (
          <div className="mt-8">
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        )}

        {isError && (
          <p className="mt-8 text-sm text-muted-foreground">Unable to load team.</p>
        )}

        {lead && (
          <motion.article
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_OPTIONS}
            variants={fadeInUp}
            className="mt-8 grid grid-cols-1 gap-6 rounded-xl border border-border bg-card p-6 sm:p-8 md:grid-cols-[200px_1fr] md:items-center md:gap-10"
          >
            <div className="flex justify-center md:justify-start">
              <Avatar className="h-32 w-32 md:h-40 md:w-40">
                {lead.avatar ? <AvatarImage src={lead.avatar} alt={lead.name} /> : null}
                <AvatarFallback className="bg-primary/10 font-mono text-3xl font-semibold text-primary">
                  {lead.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">{lead.name}</h3>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-primary">
                {lead.role}
              </p>
              {lead.bio && (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {lead.bio}
                </p>
              )}
              <div className="mt-5 flex items-center gap-2 text-muted-foreground">
                {lead.github && (
                  <a
                    href={lead.github}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${lead.name} on GitHub`}
                    className="rounded-md border border-border bg-background p-2 transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <Github className="size-4" />
                  </a>
                )}
                {lead.linkedin && (
                  <a
                    href={lead.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${lead.name} on LinkedIn`}
                    className="rounded-md border border-border bg-background p-2 transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <Linkedin className="size-4" />
                  </a>
                )}
                {lead.website && (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${lead.name} website`}
                    className="rounded-md border border-border bg-background p-2 transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <Globe className="size-4" />
                  </a>
                )}
              </div>
            </div>
          </motion.article>
        )}

        {!lead && !isPending && !isError && (
          <p className="mt-8 text-sm text-muted-foreground">Team page coming soon.</p>
        )}
      </section>
    </main>
  )
}
