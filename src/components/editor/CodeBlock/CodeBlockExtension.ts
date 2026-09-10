import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { common, createLowlight } from "lowlight"
import { CodeBlockNodeView } from "#/components/editor/CodeBlock/CodeBlockView"

const lowlight = createLowlight(common)

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
