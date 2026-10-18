import { describe, expect, it } from "vitest"
import {
  buildArticleDraft,
  buildTrainingConfig,
  defaultHyperparams,
  formatKeyValueLines,
  parseKeyValueLines,
  parseMetricLines,
  serializeTrainingConfig,
  toYaml,
  type TrainingConfigInput,
} from "./experiments"

const sample: TrainingConfigInput = {
  title: "Adapter for support triage",
  slug: "support-triage-lora",
  baseModel: "Qwen2.5-7B-Instruct",
  method: "LORA",
  datasetName: "tickets-v3",
  datasetSize: 12000,
  hyperparams: { learning_rate: 0.0002, epochs: 3, use_bf16: true, scheduler: "cosine" },
}

describe("key value parsing", () => {
  it("parses numbers, booleans and strings", () => {
    expect(parseKeyValueLines("learning_rate: 2e-4\nepochs: 3\nbf16: true\nscheduler: cosine")).toEqual({
      learning_rate: 0.0002,
      epochs: 3,
      bf16: true,
      scheduler: "cosine",
    })
  })

  it("ignores blank lines and lines without a key", () => {
    expect(parseKeyValueLines("\n: nothing\nnovalue\nkey: x")).toEqual({ key: "x" })
  })

  it("keeps colons inside values", () => {
    expect(parseKeyValueLines("url: http://host:8080")).toEqual({ url: "http://host:8080" })
  })

  it("round-trips through format", () => {
    const record = { a: 1, b: "two", c: false }
    expect(parseKeyValueLines(formatKeyValueLines(record))).toEqual(record)
  })

  it("keeps only finite numbers as metrics", () => {
    expect(parseMetricLines("accuracy: 0.91\nnote: good\nloss: 1e999\nf1: 0.88")).toEqual({
      accuracy: 0.91,
      f1: 0.88,
    })
  })
})

describe("training config export", () => {
  it("builds a structured config", () => {
    expect(buildTrainingConfig(sample)).toEqual({
      run: { name: "support-triage-lora", method: "lora" },
      model: { base: "Qwen2.5-7B-Instruct" },
      dataset: { name: "tickets-v3", size: 12000 },
      hyperparameters: { learning_rate: 0.0002, epochs: 3, use_bf16: true, scheduler: "cosine" },
    })
  })

  it("serializes to YAML", () => {
    expect(serializeTrainingConfig(sample, "yaml")).toBe(
      [
        "run:",
        "  name: support-triage-lora",
        "  method: lora",
        "model:",
        "  base: Qwen2.5-7B-Instruct",
        "dataset:",
        "  name: tickets-v3",
        "  size: 12000",
        "hyperparameters:",
        "  learning_rate: 0.0002",
        "  epochs: 3",
        "  use_bf16: true",
        "  scheduler: cosine",
        "",
      ].join("\n"),
    )
  })

  it("serializes to JSON", () => {
    const parsed = JSON.parse(serializeTrainingConfig(sample, "json")) as { model: { base: string } }
    expect(parsed.model.base).toBe("Qwen2.5-7B-Instruct")
  })

  it("quotes ambiguous YAML strings and renders nulls and empty maps", () => {
    expect(toYaml({ a: "true", b: "has space", c: null, d: {} })).toBe(
      ['a: "true"', 'b: "has space"', "c: null", "d: {}"].join("\n"),
    )
  })
})

describe("defaults and article drafts", () => {
  it("returns independent copies of default hyperparameters", () => {
    const first = defaultHyperparams("LORA")
    first.epochs = 99
    expect(defaultHyperparams("LORA").epochs).toBe(3)
    expect(defaultHyperparams("OTHER")).toEqual({})
  })

  it("drafts an article with setup and results sections", () => {
    const draft = buildArticleDraft({
      title: "Adapter for support triage",
      summary: "Does a small LoRA adapter beat prompting for ticket triage?",
      baseModel: "Qwen2.5-7B-Instruct",
      method: "LORA",
      datasetName: "tickets-v3",
      datasetSize: 12000,
      hyperparams: { epochs: 3 },
      metrics: { accuracy: 0.91 },
      status: "COMPLETED",
      notes: "",
    })
    expect(draft.title).toBe("Adapter for support triage")
    expect(draft.excerpt).toBe("Does a small LoRA adapter beat prompting for ticket triage?")
    const headings = draft.content.content
      .filter((node) => node.type === "heading")
      .map((node) => node.content?.[0]?.text)
    expect(headings).toEqual(["Question", "Setup", "Results", "Notes"])
    expect(JSON.stringify(draft.content)).toContain("accuracy: 0.91")
    expect(JSON.stringify(draft.content)).toContain("12,000 examples")
  })

  it("falls back when metrics and a usable summary are missing", () => {
    const draft = buildArticleDraft({
      title: "Run A",
      summary: "short",
      baseModel: "m",
      method: "DPO",
      datasetName: null,
      datasetSize: null,
      hyperparams: {},
      metrics: {},
      status: "PLANNED",
      notes: "  ",
    })
    expect(draft.excerpt).toBe("Run A — experiment write-up.")
    expect(JSON.stringify(draft.content)).toContain("No metrics were recorded")
  })
})
