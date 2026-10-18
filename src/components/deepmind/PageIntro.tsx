import type { ReactNode } from "react"

type PageIntroProps = {
  label: string
  title: string
  description?: string
  children?: ReactNode
}

export function PageIntro({ label, title, description, children }: PageIntroProps) {
  return (
    <section className="pt-36 sm:pt-44">
      <div className="dm-shell">
        <div className="mx-auto max-w-4xl text-center">
          <p className="dm-eyebrow">{label}</p>
          <h1 className="dm-display mt-6">{title}</h1>
          {description ? <p className="dm-lede mx-auto mt-8 max-w-2xl">{description}</p> : null}
          {children ? <div className="mt-10">{children}</div> : null}
        </div>
      </div>
    </section>
  )
}
