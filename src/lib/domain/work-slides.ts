import { SERVICE_OFFERINGS, type ServiceOffering } from "#/lib/domain/services"

export type WorkTarget =
  | { kind: "project"; slug: string }
  | { kind: "section"; hash: string }
  | { kind: "page"; to: "/projects" | "/research" }

export type WorkSlideKind = "project" | "service" | "more"

export type WorkSlide = {
  id: string
  kind: WorkSlideKind
  title: string
  description: string
  coverImage: string | null
  target: WorkTarget
  technologies: string[]
  related: Array<{ id: string; title: string }>
}

export type WorkProjectInput = {
  id: string
  slug: string
  title: string
  description: string
  coverImage: string | null
  technologies: string[]
  research: Array<{ article: { id: string; title: string } }>
}

const MAX_TECHNOLOGIES = 6
const MAX_RELATED = 3

export function projectToSlide(project: WorkProjectInput): WorkSlide {
  return {
    id: `project:${project.id}`,
    kind: "project",
    title: project.title,
    description: project.description,
    coverImage: project.coverImage,
    target: { kind: "project", slug: project.slug },
    technologies: project.technologies.slice(0, MAX_TECHNOLOGIES),
    related: project.research.slice(0, MAX_RELATED).map(({ article }) => ({
      id: article.id,
      title: article.title,
    })),
  }
}

export function serviceToSlide(service: ServiceOffering): WorkSlide {
  return {
    id: `service:${service.key}`,
    kind: "service",
    title: service.title,
    description: service.tagline,
    coverImage: null,
    target: { kind: "section", hash: "services" },
    technologies: service.stack.slice(0, MAX_TECHNOLOGIES),
    related: service.deliverables.slice(0, MAX_RELATED).map((title) => ({
      id: `${service.key}:${title}`,
      title,
    })),
  }
}

export function moreSlide(): WorkSlide {
  return {
    id: "more:projects",
    kind: "more",
    title: "View more work",
    description: "Browse every system we have shipped.",
    coverImage: null,
    target: { kind: "page", to: "/projects" },
    technologies: [],
    related: [],
  }
}

export function buildWorkSlides(
  projects: ReadonlyArray<WorkProjectInput>,
  services: ReadonlyArray<ServiceOffering> = SERVICE_OFFERINGS,
): WorkSlide[] {
  const base =
    projects.length > 0
      ? projects.map(projectToSlide)
      : services.map(serviceToSlide)
  return [...base, moreSlide()]
}
