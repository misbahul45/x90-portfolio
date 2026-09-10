import { motion } from "motion/react"
import { ArrowRight, Github, Mail, MessageCircle } from "lucide-react"
import { Button } from "#/components/ui/button"
import { CONTACT_INFO } from "#/lib/domain/services"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"

export function FinalCTA() {
  return (
    <section className="lab-page-bg border-t border-[var(--lab-line)] py-24">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="research-card-surface p-8 sm:p-12"
        >
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--lab-ink)] sm:text-4xl">
                Have a problem worth engineering?
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--lab-ink-soft)]">
                Build something with XNINETZY Labs. Drop a brief, send a
                WhatsApp, or email us. We reply within {CONTACT_INFO.responseTime}{" "}
                — usually faster.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-[var(--lab-ink-soft)]">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5 text-[var(--lab-orange)]" aria-hidden />
                  {CONTACT_INFO.email}
                </span>
                <span aria-hidden className="text-[var(--lab-line-strong)]">·</span>
                <span>{CONTACT_INFO.whatsappDisplay}</span>
                <span aria-hidden className="text-[var(--lab-line-strong)]">·</span>
                <span>Reply within {CONTACT_INFO.responseTime}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:gap-3">
              <Button asChild size="lg" className="font-mono !text-white">
                <a href="#contact">
                  Start a brief
                  <ArrowRight className="size-4" aria-hidden />
                </a>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="font-mono !text-[var(--lab-ink)] border border-[var(--lab-line)] hover:!text-[var(--lab-orange)] hover:border-[var(--lab-orange)] hover:bg-[var(--lab-orange-soft)]"
              >
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  Chat on WhatsApp
                </a>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="font-mono !text-[var(--lab-ink-soft)] hover:!text-[var(--lab-ink)]"
              >
                <a
                  href="https://github.com/X90-labs"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="size-4" aria-hidden />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
