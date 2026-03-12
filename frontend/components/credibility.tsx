"use client"

import { ShieldCheck, BrainCircuit, Lock, FlaskConical, HeartPulse, Database } from "lucide-react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const pillars = [
  {
    icon: FlaskConical,
    title: "Evidence-based",
    description:
      "Every prediction is grounded in peer-reviewed metabolic research and validated against clinical datasets.",
  },
  {
    icon: BrainCircuit,
    title: "Built with ML",
    description:
      "Our models learn your unique metabolic patterns to deliver increasingly personalized, accurate insights over time.",
  },
  {
    icon: Lock,
    title: "Privacy-first",
    description:
      "Your health data is encrypted end-to-end. We never sell your data. You own it completely.",
  },
  {
    icon: HeartPulse,
    title: "Clinically informed",
    description:
      "Developed in collaboration with endocrinologists and metabolic health researchers.",
  },
  {
    icon: Database,
    title: "Continuous learning",
    description:
      "Models improve with every data point. The more you log, the smarter your predictions become.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent reasoning",
    description:
      "Every spike risk comes with a clear explanation -- you always understand the 'why' behind each insight.",
  },
]

export function Credibility() {
  const { ref, visible } = useScrollReveal(0.1)

  return (
    <section id="credibility" className="relative px-6 py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div ref={ref} className="mx-auto max-w-screen-lg">
        <div
          className={`max-w-md transition-all duration-700 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Why Trust Verazoi
          </p>
          <h2 className="mt-6 font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-foreground text-balance">
            Built on science, designed for people
          </h2>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-border sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.title}
              className={`bg-background flex flex-col p-8 transition-all duration-700 ease-out ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${300 + i * 100}ms` }}
            >
              <pillar.icon
                className="h-5 w-5 text-muted-foreground/40"
                strokeWidth={1.5}
              />
              <h3 className="mt-6 text-[15px] font-medium text-foreground">
                {pillar.title}
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
