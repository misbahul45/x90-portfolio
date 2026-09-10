import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { auth } from "#/lib/auth"
import { articleService } from "#/lib/services/article-service"
import { projectService } from "#/lib/services/project-service"
import { teamService } from "#/lib/services/team-service"
import { feedbackService } from "#/lib/services/feedback-service"
import { briefService } from "#/lib/services/brief-service"
import { categoryService } from "#/lib/services/category-service"
import { tagService } from "#/lib/services/tag-service"
import { dispatchBriefNotifications } from "#/lib/notify"
import { ARTICLE_STATUS } from "#/lib/domain/article-status"
import { FEEDBACK_STATUS, FEEDBACK_TYPE } from "#/lib/domain/feedback"
import {
  articleCreateSchema,
  articleUpdateSchema,
} from "#/lib/schemas/article"
import {
  projectCreateSchema,
  projectUpdateSchema,
} from "#/lib/schemas/project"
import {
  teamMemberSchema,
  teamMemberUpdateSchema,
} from "#/lib/schemas/team-member"
import { feedbackSchema, feedbackStatusUpdateSchema } from "#/lib/schemas/feedback"
import { briefCreateSchema, briefStatusUpdateSchema } from "#/lib/schemas/brief"
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "#/lib/schemas/category"
import { tagCreateSchema, tagUpdateSchema } from "#/lib/schemas/tag"

type SessionUser = { id: string; role?: string | null }
type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string } }

function ok<T>(data: T): ApiResponse<T> {
  return { ok: true, data }
}

function fail(message: string, status = 400): Response {
  return new Response(JSON.stringify({ ok: false, error: { message } }), {
    status,
    headers: { "content-type": "application/json" },
  })
}

function json<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ ok: true, data }), {
    status,
    headers: { "content-type": "application/json" },
  })
}

function parseBody<S extends z.ZodTypeAny>(schema: S, text: string): { data?: z.infer<S>; response?: Response } {
  let json: unknown
  try {
    json = text ? JSON.parse(text) : undefined
  } catch {
    return { response: fail("Invalid JSON body") }
  }
  const result = schema.safeParse(json)
  if (!result.success) {
    return { response: fail(result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")) }
  }
  return { data: result.data }
}

function isAdmin(user: SessionUser | null | undefined): boolean {
  return user?.role === "ADMIN"
}

async function requireAdmin(request: Request): Promise<SessionUser | Response> {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdmin(session?.user)) {
    return fail("Forbidden", 403)
  }
  return session!.user as SessionUser
}

export const Route = createFileRoute("/api/handlers/$")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url)
        const path = url.pathname.replace(/^\/api\/handlers\/?/, "")
        const segments = path.split("/").filter(Boolean)
        return routePost(segments, request)
      },
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const path = url.pathname.replace(/^\/api\/handlers\/?/, "")
        const segments = path.split("/").filter(Boolean)
        return routeGet(segments, request, url)
      },
      PATCH: async ({ request }) => {
        const url = new URL(request.url)
        const path = url.pathname.replace(/^\/api\/handlers\/?/, "")
        const segments = path.split("/").filter(Boolean)
        return routePatch(segments, request)
      },
      DELETE: async ({ request }) => {
        const url = new URL(request.url)
        const path = url.pathname.replace(/^\/api\/handlers\/?/, "")
        const segments = path.split("/").filter(Boolean)
        return routeDelete(segments, request)
      },
    },
  },
})

async function routeGet(segments: string[], request: Request, url: URL): Promise<Response> {
  const [resource, id] = segments
  const params = Object.fromEntries(url.searchParams.entries())

  if (resource === "articles") {
    if (id) {
      const article = await articleService.bySlug(id)
      return article ? json(article) : fail("Not found", 404)
    }
    const page = await articleService.listPublished({
      categorySlug: params.categorySlug,
      page: params.page ? Number(params.page) : undefined,
      pageSize: params.pageSize ? Number(params.pageSize) : undefined,
    })
    return json(page)
  }

  if (resource === "projects") {
    if (id) {
      const project = await projectService.bySlug(id)
      return project ? json(project) : fail("Not found", 404)
    }
    const projects = await projectService.list({
      featuredOnly: params.featuredOnly === "true",
      categorySlug: params.categorySlug,
      page: params.page ? Number(params.page) : undefined,
      pageSize: params.pageSize ? Number(params.pageSize) : undefined,
    })
    return json(projects)
  }

  if (resource === "team") {
    const members = await teamService.list({
      featuredOnly: params.featuredOnly === "true",
    })
    return json(members)
  }

  if (resource === "feedback" && id === "recent") {
    const recent = await feedbackService.recentPublic()
    return json(recent)
  }

  if (resource === "admin") {
    const admin = await requireAdmin(request)
    if (admin instanceof Response) return admin
    const [, sub, subId] = segments
    if (sub === "articles") {
      if (subId) {
        const article = await articleService.byId(subId)
        return article ? json(article) : fail("Not found", 404)
      }
      const articles = await articleService.listAll({
        status: params.status as typeof ARTICLE_STATUS.DRAFT | undefined,
        categorySlug: params.categorySlug,
      })
      const articleList = Array.isArray(articles) ? articles : articles.items
      return json(articleList)
    }
    if (sub === "projects") {
      if (subId) {
        const project = await projectService.byId(subId)
        return project ? json(project) : fail("Not found", 404)
      }
      const projects = await projectService.listAll({})
      return json(projects.items)
    }
    if (sub === "team") {
      return json(await teamService.list({}))
    }
    if (sub === "feedback") {
      const items = await feedbackService.adminList({
        status: params.status as typeof FEEDBACK_STATUS.NEW | undefined,
        type: params.type as typeof FEEDBACK_TYPE.GENERAL | undefined,
      })
      return json(items)
    }
    if (sub === "briefs") {
      const items = await briefService.adminList({
        status: params.status as "NEW" | "REVIEWED" | "QUOTED" | "ARCHIVED" | undefined,
        service: params.service as
          | "AUTOMATION"
          | "AI_ASSISTANT"
          | "AGENTIC_SYSTEM"
          | "WEB"
          | "MOBILE"
          | "OTHER"
          | undefined,
      })
      return json(items)
    }
    if (sub === "categories") {
      if (subId) {
        const category = await categoryService.byId(subId)
        return category ? json(category) : fail("Not found", 404)
      }
      return json(await categoryService.list())
    }
    if (sub === "tags") {
      if (subId) {
        const tag = await tagService.byId(subId)
        return tag ? json(tag) : fail("Not found", 404)
      }
      return json(await tagService.list())
    }
    return fail("Unknown admin resource", 404)
  }

  return fail("Not found", 404)
}

async function routePost(segments: string[], request: Request): Promise<Response> {
  const text = await request.text()
  const [resource, sub] = segments

  if (resource === "feedback") {
    const parsed = parseBody(feedbackSchema, text)
    if (parsed.response) return parsed.response
    const created = await feedbackService.submit(parsed.data!)
    return json(created, 201)
  }

  if (resource === "brief") {
    const parsed = parseBody(briefCreateSchema, text)
    if (parsed.response) return parsed.response
    const created = await briefService.submit(parsed.data!)
    await dispatchBriefNotifications({
      id: created.id,
      name: created.name,
      email: created.email,
      company: created.company,
      whatsapp: created.whatsapp,
      service: created.service,
      budget: created.budget,
      timeline: created.timeline,
      message: created.message,
      documentUrl: created.documentUrl,
      documentName: created.documentName,
      documentMimeType: created.documentMimeType,
    })
    return json(created, 201)
  }

  if (resource === "admin") {
    const admin = await requireAdmin(request)
    if (admin instanceof Response) return admin
    if (sub === "articles") {
      const parsed = parseBody(articleCreateSchema, text)
      if (parsed.response) return parsed.response
      const created = await articleService.create(parsed.data!, admin.id)
      return json(created, 201)
    }
    if (sub === "projects") {
      const parsed = parseBody(projectCreateSchema, text)
      if (parsed.response) return parsed.response
      const created = await projectService.create(parsed.data!)
      return json(created, 201)
    }
    if (sub === "team") {
      const parsed = parseBody(teamMemberSchema, text)
      if (parsed.response) return parsed.response
      const created = await teamService.create(parsed.data!)
      return json(created, 201)
    }
    if (sub === "categories") {
      const parsed = parseBody(categoryCreateSchema, text)
      if (parsed.response) return parsed.response
      const created = await categoryService.create(parsed.data!)
      return json(created, 201)
    }
    if (sub === "tags") {
      const parsed = parseBody(tagCreateSchema, text)
      if (parsed.response) return parsed.response
      const created = await tagService.create(parsed.data!)
      return json(created, 201)
    }
    return fail("Unknown admin resource", 404)
  }

  return fail("Not found", 404)
}

async function routePatch(segments: string[], request: Request): Promise<Response> {
  const text = await request.text()
  const [resource, sub, subId] = segments

  if (resource === "admin" && sub && subId) {
    const admin = await requireAdmin(request)
    if (admin instanceof Response) return admin
    if (sub === "articles") {
      const parsed = parseBody(articleUpdateSchema, text)
      if (parsed.response) return parsed.response
      const updated = await articleService.update({ ...parsed.data!, id: subId })
      return json(updated)
    }
    if (sub === "projects") {
      const parsed = parseBody(projectUpdateSchema, text)
      if (parsed.response) return parsed.response
      const updated = await projectService.update({ ...parsed.data!, id: subId })
      return json(updated)
    }
    if (sub === "team") {
      const parsed = parseBody(teamMemberUpdateSchema, text)
      if (parsed.response) return parsed.response
      const updated = await teamService.update({ ...parsed.data!, id: subId })
      return json(updated)
    }
    if (sub === "feedback") {
      const parsed = parseBody(feedbackStatusUpdateSchema, text)
      if (parsed.response) return parsed.response
      const updated = await feedbackService.updateStatus(parsed.data!)
      return json(updated)
    }
    if (sub === "briefs") {
      const parsed = parseBody(briefStatusUpdateSchema, text)
      if (parsed.response) return parsed.response
      const updated = await briefService.updateStatus(parsed.data!)
      return json(updated)
    }
    if (sub === "categories") {
      const parsed = parseBody(categoryUpdateSchema, text)
      if (parsed.response) return parsed.response
      const updated = await categoryService.update(parsed.data!)
      return json(updated)
    }
    if (sub === "tags") {
      const parsed = parseBody(tagUpdateSchema, text)
      if (parsed.response) return parsed.response
      const updated = await tagService.update(parsed.data!)
      return json(updated)
    }
    return fail("Unknown admin resource", 404)
  }

  return fail("Not found", 404)
}

async function routeDelete(segments: string[], request: Request): Promise<Response> {
  const [resource, sub, subId] = segments
  if (resource === "admin" && sub && subId) {
    const admin = await requireAdmin(request)
    if (admin instanceof Response) return admin
    if (sub === "articles") {
      await articleService.delete(subId)
      return new Response(null, { status: 204 })
    }
    if (sub === "projects") {
      await projectService.delete(subId)
      return new Response(null, { status: 204 })
    }
    if (sub === "team") {
      await teamService.delete(subId)
      return new Response(null, { status: 204 })
    }
    if (sub === "feedback") {
      await feedbackService.delete(subId)
      return new Response(null, { status: 204 })
    }
    if (sub === "briefs") {
      await briefService.delete(subId)
      return new Response(null, { status: 204 })
    }
    if (sub === "categories") {
      await categoryService.delete(subId)
      return new Response(null, { status: 204 })
    }
    if (sub === "tags") {
      await tagService.delete(subId)
      return new Response(null, { status: 204 })
    }
    return fail("Unknown admin resource", 404)
  }
  return fail("Not found", 404)
}

void ok
