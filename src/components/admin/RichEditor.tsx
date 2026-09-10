import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { useEffect } from "react"
import {
  Bold,
  Italic,
  Code,
  Code2,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Strikethrough,
  Minus,
  type LucideIcon,
} from "lucide-react"
import { cn } from "#/lib/utils"
import { CodeBlock } from "#/components/editor/CodeBlock"

type ToolbarAction = {
  id: string
  icon: LucideIcon
  label: string
  isActive?: (editor: Editor) => boolean
  run: (editor: Editor) => void
  dividerAfter?: boolean
}

function setLink(editor: Editor) {
  const previous = editor.getAttributes("link").href
  const url = typeof window !== "undefined" ? window.prompt("URL", previous ?? "https://") : null
  if (url === null) return
  if (url === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
    return
  }
  editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
}

function setImage(editor: Editor) {
  const url = typeof window !== "undefined" ? window.prompt("Image URL") : null
  if (!url) return
  editor.chain().focus().setImage({ src: url, alt: "" }).run()
}

const ACTIONS: ToolbarAction[] = [
  {
    id: "bold",
    icon: Bold,
    label: "Bold",
    isActive: (editor) => editor.isActive("bold"),
    run: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    id: "italic",
    icon: Italic,
    label: "Italic",
    isActive: (editor) => editor.isActive("italic"),
    run: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    id: "strike",
    icon: Strikethrough,
    label: "Strikethrough",
    isActive: (editor) => editor.isActive("strike"),
    run: (editor) => editor.chain().focus().toggleStrike().run(),
    dividerAfter: true,
  },
  {
    id: "h2",
    icon: Heading2,
    label: "Heading 2",
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: "h3",
    icon: Heading3,
    label: "Heading 3",
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    dividerAfter: true,
  },
  {
    id: "bullet",
    icon: List,
    label: "Bulleted list",
    isActive: (editor) => editor.isActive("bulletList"),
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: "ordered",
    icon: ListOrdered,
    label: "Numbered list",
    isActive: (editor) => editor.isActive("orderedList"),
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: "quote",
    icon: Quote,
    label: "Blockquote",
    isActive: (editor) => editor.isActive("blockquote"),
    run: (editor) => editor.chain().focus().toggleBlockquote().run(),
    dividerAfter: true,
  },
  {
    id: "code",
    icon: Code,
    label: "Inline code",
    isActive: (editor) => editor.isActive("code"),
    run: (editor) => editor.chain().focus().toggleCode().run(),
  },
  {
    id: "codeblock",
    icon: Code2,
    label: "Code block",
    isActive: (editor) => editor.isActive("codeBlock"),
    run: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: "link",
    icon: Link2,
    label: "Link",
    isActive: (editor) => editor.isActive("link"),
    run: setLink,
  },
  {
    id: "image",
    icon: ImageIcon,
    label: "Image",
    run: setImage,
  },
  {
    id: "divider",
    icon: Minus,
    label: "Divider",
    run: (editor) => editor.chain().focus().setHorizontalRule().run(),
    dividerAfter: true,
  },
  {
    id: "undo",
    icon: Undo2,
    label: "Undo",
    run: (editor) => editor.chain().focus().undo().run(),
  },
  {
    id: "redo",
    icon: Redo2,
    label: "Redo",
    run: (editor) => editor.chain().focus().redo().run(),
  },
]

type RichEditorProps = {
  value: string
  onChange: (json: string) => void
  className?: string
}

export function RichEditor({ value, onChange, className }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Link.configure({ openOnClick: false }),
      Image,
      CodeBlock,
    ],
    content: parseContent(value),
    editorProps: {
      attributes: {
        class: cn(
          "tiptap min-h-[280px] px-4 py-4 font-mono text-[13px] leading-6 text-[var(--lab-ink)] focus:outline-none",
          className,
        ),
      },
    },
    onUpdate({ editor }) {
      onChange(JSON.stringify(editor.getJSON()))
    },
  })

  useEffect(() => {
    if (!editor) return
    const next = parseContent(value)
    const current = JSON.stringify(editor.getJSON())
    if (JSON.stringify(next) === current) return
    editor.commands.setContent(next)
  }, [editor, value])

  if (!editor) {
    return (
      <div className="lab-skeleton h-72 w-full rounded-md" />
    )
  }

  return (
    <div className="overflow-hidden rounded-md border border-[var(--lab-line)] bg-[var(--lab-card)]">
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--lab-line)] bg-[var(--lab-card-elevated)] px-2 py-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon
          const active = action.isActive?.(editor) ?? false
          return (
            <div key={action.id} className="flex items-center">
              <button
                type="button"
                onClick={() => action.run(editor)}
                aria-label={action.label}
                aria-pressed={active}
                title={action.label}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded text-[var(--lab-ink-soft)] transition-colors hover:bg-[var(--lab-line)]/40 hover:text-[var(--lab-ink)]",
                  active && "bg-[var(--lab-orange-soft)] text-[var(--lab-orange)]",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
              </button>
              {action.dividerAfter && (
                <span aria-hidden className="mx-1 h-4 w-px bg-[var(--lab-line)]" />
              )}
            </div>
          )
        })}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

function parseContent(value: string): object {
  if (!value) return { type: "doc", content: [{ type: "paragraph" }] }
  try {
    return JSON.parse(value) as object
  } catch {
    return {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: value }] }],
    }
  }
}
