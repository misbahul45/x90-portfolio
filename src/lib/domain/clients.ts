export type Testimonial = {
  id: string
  quote: string
  name: string
  role: string
  company: string
  service: string
}

export const TESTIMONIALS: ReadonlyArray<Testimonial> = [
  {
    id: "t1",
    quote:
      "The team shipped our AI assistant in 6 weeks. Retrieval hits 92% on the eval set — production users trust it enough to actually use it.",
    name: "Aditya Pradana",
    role: "Head of Product",
    company: "Legaltech Co.",
    service: "AI Assistant",
  },
  {
    id: "t2",
    quote:
      "Our custom automation pipeline replaced a $14k/yr SaaS bundle. The handover runbook was cleaner than what we got from agencies 3× the price.",
    name: "Rina Kusuma",
    role: "Ops Lead",
    company: "Distribution Network",
    service: "Automation",
  },
  {
    id: "t3",
    quote:
      "They didn't just build the dashboard. They picked our stack, set up CI, and stayed through two launch weekends. Real engineers.",
    name: "Bayu Hartono",
    role: "CTO",
    company: "Healthtech Startup",
    service: "Web End-to-End",
  },
  {
    id: "t4",
    quote:
      "The agent they built books our support queue autonomously. Tickets get triaged before any human reads them — we sleep better.",
    name: "Maya Larasati",
    role: "Customer Success",
    company: "SaaS Platform",
    service: "Agentic System",
  },
  {
    id: "t5",
    quote:
      "Mobile + dashboard shipped together. The shared API meant we never had to chase two codebases. Worth every rupiah.",
    name: "Reza Mahendra",
    role: "Founder",
    company: "Field Service Co.",
    service: "Mobile End-to-End",
  },
  {
    id: "t6",
    quote:
      "Research-to-product loop is rare. They read the latest RAG papers, picked what works, and shipped. Felt like having a senior on staff.",
    name: "Citra Wibawa",
    role: "Engineering Director",
    company: "Edtech Scaleup",
    service: "AI Assistant",
  },
]

export type ClientLogo = {
  id: string
  name: string
  initials: string
  sector: string
}

export const CLIENT_LOGOS: ReadonlyArray<ClientLogo> = [
  { id: "c1", name: "Legaltech Co.", initials: "LT", sector: "Legal" },
  { id: "c2", name: "Healthtech Startup", initials: "HT", sector: "Health" },
  { id: "c3", name: "Distribution Network", initials: "DN", sector: "Logistics" },
  { id: "c4", name: "SaaS Platform", initials: "SP", sector: "Support" },
  { id: "c5", name: "Field Service Co.", initials: "FS", sector: "Field Ops" },
  { id: "c6", name: "Edtech Scaleup", initials: "ET", sector: "Education" },
  { id: "c7", name: "Fintech Pilot", initials: "FP", sector: "Finance" },
  { id: "c8", name: "Logistics Labs", initials: "LL", sector: "Logistics" },
]
