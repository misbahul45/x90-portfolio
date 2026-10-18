import { useState } from "react"
import { Reveal } from "#/components/deepmind/Reveal"
import { PipelineFlow } from "#/components/deepmind/PipelineFlow"
import { SectionHeader } from "#/components/deepmind/SectionHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs"
import { PIPELINES, type PipelineKey } from "#/lib/domain/pipelines"

const triggerClass =
  "h-auto flex-none justify-start rounded-none border-0 bg-transparent px-0 pb-5 pt-6 text-left text-2xl font-medium leading-tight tracking-tight text-[var(--lab-ink-soft)] shadow-none before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-[var(--lab-line)] after:hidden hover:text-[var(--lab-ink)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--lab-ink)] data-[state=active]:before:bg-[var(--lab-orange)] dark:data-[state=active]:bg-transparent"

export function LabSection() {
  const [value, setValue] = useState<PipelineKey>("delivery")

  return (
    <section id="lab" aria-labelledby="lab-heading" className="dm-section border-t border-[var(--lab-line)]">
      <div className="dm-shell">
        <Reveal>
          <SectionHeader
            headingId="lab-heading"
            title="From the lab"
            description="The pipelines behind our work, from client brief to published research."
          />
        </Reveal>

        <Tabs
          value={value}
          onValueChange={(next) => setValue(next as PipelineKey)}
          className="mt-12 gap-8"
        >
          <TabsList
            variant="line"
            aria-label="Pipelines"
            className="grid h-auto w-full grid-cols-1 justify-stretch gap-x-8 gap-y-0 p-0 group-data-[orientation=horizontal]/tabs:h-auto sm:grid-cols-3"
          >
            {PIPELINES.map((pipeline) => (
              <TabsTrigger key={pipeline.key} value={pipeline.key} className={triggerClass}>
                {pipeline.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {PIPELINES.map((pipeline) => (
            <TabsContent key={pipeline.key} value={pipeline.key} className="min-w-0">
              <p className="dm-lede max-w-3xl">{pipeline.summary}</p>
              <PipelineFlow pipeline={pipeline} className="mt-8" />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
