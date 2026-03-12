"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"

export function ComplementingCare() {
  const { ref, visible } = useScrollReveal(0.15)

  return (
    <section className="relative px-6 py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div ref={ref} className="mx-auto max-w-screen-lg">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/60">
            Your Healthcare Journey
          </p>
          <h2 className="mt-6 font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] font-light leading-[1.1] text-foreground text-balance">
            Built to complement your care.
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
            Generate structured summaries to share with your physician, helping
            you walk into appointments informed and prepared.
          </p>
        </div>
      </div>
    </section>
  )
}
