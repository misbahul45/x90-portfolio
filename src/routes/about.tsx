import { createFileRoute } from "@tanstack/react-router"
import { PageIntro } from "#/components/deepmind/PageIntro"
import { Reveal } from "#/components/deepmind/Reveal"
import { SectionHeader } from "#/components/deepmind/SectionHeader"
import { Skeleton } from "#/components/ui/skeleton"
import { useTeamMembers, type TeamMemberItem } from "#/hooks/useTeamMembers"

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — X90 Labs" },
      { name: "description", content: "Research. Experiment. Build. A technical AI lab turning experiments into systems." },
    ],
  }),
  component: AboutPage,
})

const PILLARS = [
  {
    title: "Research",
    description: "Experiments in ML, DL, LLM, RAG and agentic systems, published as engineering notes and benchmarks.",
  },
  {
    title: "Build",
    description: "AI automation, web applications, agentic systems, AI assistants and data intelligence, built to production grade.",
  },
  {
    title: "Community",
    description: "Team, projects, feedback and shared knowledge. Open by default and built around people.",
  },
] as const

function memberLinks(member: TeamMemberItem): Array<{ label: string; href: string }> {
  return [
    member.github ? { label: "GitHub", href: member.github } : null,
    member.linkedin ? { label: "LinkedIn", href: member.linkedin } : null,
    member.website ? { label: "Website", href: member.website } : null,
  ].filter((link): link is { label: string; href: string } => link !== null)
}

function MemberCard({ member }: { member: TeamMemberItem }) {
  const links = memberLinks(member)
  return (
    <article>
      <div className="dm-media aspect-[4/5]">
        {member.avatar ? (
          <img src={member.avatar} alt={member.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-7xl font-medium text-[var(--lab-ink-soft)]">
            {member.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <h3 className="dm-card-title mt-5">{member.name}</h3>
      <p className="mt-1 text-[15px] text-[var(--lab-orange)]">{member.role}</p>
      {member.bio ? <p className="dm-body mt-3">{member.bio}</p> : null}
      {links.length > 0 ? (
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} on ${link.label}`}
              className="text-[var(--lab-ink)] underline-offset-4 hover:text-[var(--lab-orange)] hover:underline"
            >
              {link.label}
            </a>
          ))}
        </p>
      ) : null}
    </article>
  )
}

function AboutPage() {
  const { data: members, isPending, isError } = useTeamMembers({})

  return (
    <main>
      <PageIntro
        label="About"
        title="Research. Experiment. Build."
        description="We are a technical AI lab that turns experiments, research and engineering into useful systems."
      />

      <section aria-label="What we do" className="dm-section">
        <div className="dm-shell">
          <ul className="grid gap-x-8 gap-y-10 md:grid-cols-3">
            {PILLARS.map((pillar, index) => (
              <li key={pillar.title} className="border-t border-[var(--lab-line-strong)] pt-6">
                <Reveal delay={index * 0.08}>
                  <h2 className="text-2xl font-medium tracking-tight text-[var(--lab-ink)]">{pillar.title}</h2>
                  <p className="dm-body mt-3">{pillar.description}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="team-heading" className="dm-section border-t border-[var(--lab-line)]">
        <div className="dm-shell">
          <Reveal>
            <SectionHeader
              headingId="team-heading"
              title="The lab"
              description="People who research, experiment and build."
            />
          </Reveal>

          <div className="mt-12">
            {isPending ? (
              <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-[4/5] w-full rounded-[1.5rem]" />
                ))}
              </div>
            ) : isError ? (
              <p className="dm-body">The team could not be loaded. Please try again shortly.</p>
            ) : (members ?? []).length === 0 ? (
              <p className="dm-body">Team page coming soon.</p>
            ) : (
              <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {(members ?? []).map((member) => (
                  <li key={member.id}>
                    <MemberCard member={member} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
