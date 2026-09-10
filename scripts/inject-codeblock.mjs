import { writeFile } from "node:fs/promises"
import pkg from "../node_modules/@prisma/client/index.js"
const { PrismaClient } = pkg
const prisma = new PrismaClient()
const pythonCode = ["def iterative_rag(question: str, max_steps: int = 3):","    context = []","","    for step in range(max_steps):","        passages = retrieve(question, context)","        context.extend(passages)","","        if can_answer(question, context):","            return synthesize(question, context)","","    return synthesize(question, context)"].join("\n")
const tsCode = ["interface RetrievalContext {","  passages: string[];","  lastRetrieved: number;","}","","async function fetchPassages(query: string): Promise<RetrievalContext> {","  const result = await client.query(query);","  return {","    passages: result.documents.map((d) => d.text),","    lastRetrieved: Date.now(),","  };","}"].join("\n")
const goCode = ["package main","",'import "fmt"',"","func main() {","    ctx := buildContext()","    for _, passage := range ctx.Passages {",'        fmt.Println(passage.Text)',"    }","}"].join("\n")
const doc = { type: "doc", content: [ { type: "paragraph", content: [ { type: "text", text: "Long-context retrieval is no longer a luxury. As context windows expand to 128k and beyond, the question shifts from how much we can fit to how reliably we can find what matters." } ] }, { type: "codeBlock", attrs: { language: "python" }, content: [ { type: "text", text: pythonCode } ] }, { type: "codeBlock", attrs: { language: "typescript" }, content: [ { type: "text", text: tsCode } ] }, { type: "codeBlock", attrs: { language: "go" }, content: [ { type: "text", text: goCode } ] }, { type: "paragraph", content: [ { type: "text", text: "The pipeline above is intentionally explicit. Each iteration gets the prior context and the original question so the model can refine its retrieval with growing evidence." } ] } ] }
const content = JSON.stringify(doc)
await writeFile("/tmp/built-doc.json", content)
console.log("written")
await prisma.article.update({ where: { slug: "building-long-context-rag" }, data: { content } })
console.log("updated")
await prisma.$disconnect()
