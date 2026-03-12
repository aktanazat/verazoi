"use client"

import { FlaskConical, Eye, Lock, HeartPulse } from "lucide-react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const pillars = [
  {
    icon: FlaskConical,
    title: "Evidence-based",
    description: "Built using established metabolic research and validated clinical frameworks.",
  },
  {
    icon: Eye,
    title: "Transparent modeling",
    description: "Clear assumptions behind every prediction. You always see the reasoning.",
  },
  {
    icon: Lock,
    title: "Privacy-first",
    description: "Your health data is encrypted end-to-end. We never sell your data.",
  },
  {
    icon: HeartPulse,
    title: "Complements your care",
    description: "Designed to work alongside your healthcare plan, not replace it.",
  },
]

export function Scientific() {
  const { ref, visible } = useScrollReveal(0.1)

  return (
    <section id="scientific" className="relative px-6 py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div ref={ref} className="mx-auto max-w-screen-lg">
        <div
          className={`max-w-md transition-all duration-700 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/60">
            Our Approach
          </p>
          <h2 className="mt-6 font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-foreground text-balance">
            Grounded in evidence. Designed with care.
          </h2>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.title}
              className={`card-premium gradient-border rounded-2xl bg-card/40 p-7 transition-all duration-700 ease-out ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${300 + i * 100}ms` }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/8">
                <pillar.icon
                  className="h-4 w-4 text-primary/60"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="mt-5 text-[15px] font-medium text-foreground">
                {pillar.title}
              </h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
