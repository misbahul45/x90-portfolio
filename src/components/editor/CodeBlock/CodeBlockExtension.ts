import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { createLowlight } from "lowlight"
import javascript from "highlight.js/lib/languages/javascript"
import typescript from "highlight.js/lib/languages/typescript"
import python from "highlight.js/lib/languages/python"
import bash from "highlight.js/lib/languages/bash"
import json from "highlight.js/lib/languages/json"
import css from "highlight.js/lib/languages/css"
import xml from "highlight.js/lib/languages/xml"
import markdown from "highlight.js/lib/languages/markdown"
import sql from "highlight.js/lib/languages/sql"
import yaml from "highlight.js/lib/languages/yaml"
import rust from "highlight.js/lib/languages/rust"
import go from "highlight.js/lib/languages/go"
import { CodeBlockNodeView } from "#/components/editor/CodeBlock/CodeBlockView"

// Curated language set replaces `lowlight/common` (≈1.3 MB highlight.js bundle).
// Covers everything authored in research articles, AskLabs code samples, and
// the admin editor. Adding a language here is a one-line import + register.
const lowlight = createLowlight()

lowlight.register("javascript", javascript)
lowlight.register("js", javascript)
lowlight.register("jsx", javascript)
lowlight.register("typescript", typescript)
lowlight.register("ts", typescript)
lowlight.register("tsx", typescript)
lowlight.register("python", python)
lowlight.register("py", python)
lowlight.register("bash", bash)
lowlight.register("sh", bash)
lowlight.register("shell", bash)
lowlight.register("json", json)
lowlight.register("jsonc", json)
lowlight.register("css", css)
lowlight.register("xml", xml)
lowlight.register("html", xml)
lowlight.register("htm", xml)
lowlight.register("markdown", markdown)
lowlight.register("md", markdown)
lowlight.register("sql", sql)
lowlight.register("yaml", yaml)
lowlight.register("yml", yaml)
lowlight.register("rust", rust)
lowlight.register("rs", rust)
lowlight.register("go", go)
lowlight.register("golang", go)

export const CodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView)
  },
}).configure({
  lowlight,
  defaultLanguage: "text",
  HTMLAttributes: {
    class: "code-block-source",
  },
})

export default CodeBlock
