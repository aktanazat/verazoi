"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const inputs = [
  "CGM glucose variability",
  "Glucose trend consistency",
  "Behavioral inputs (meals, sleep, activity, stress)",
  "Historical pattern analysis",
]

export function StabilityExplainer() {
  const { ref, visible } = useScrollReveal(0.1)

  return (
    <section id="stability-score" className="relative px-6 py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[120px]" />
      </div>

      <div ref={ref} className="mx-auto max-w-screen-lg">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div
            className={`transition-all duration-700 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/60">
              Core Metric
            </p>
            <h2 className="mt-6 font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-balance">
              <span className="text-gradient">What is the</span>{" "}
              <span className="text-foreground">Stability Score?</span>
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
              Your Stability Score is a structured measure of how stable and
              predictable your glucose patterns are over time.
            </p>
          </div>

          <div
            className={`flex flex-col justify-center gap-8 transition-all delay-200 duration-700 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="gradient-border rounded-2xl bg-card/40 p-6">
              <p className="text-[13px] font-medium text-foreground">
                Calculated using:
              </p>
              <ul className="mt-4 space-y-3">
                {inputs.map((item, i) => (
                  <li
                    key={item}
                    className={`flex items-start gap-3 text-[14px] text-muted-foreground transition-all duration-700 ease-out ${
                      visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${400 + i * 100}ms` }}
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-[13px] leading-relaxed text-muted-foreground/70">
                It is not a diagnosis. It is not a replacement for medical care.
                It is a structured way to understand how your daily habits
                influence long-term stability.
              </p>
            </div>

            <p className="text-[11px] leading-relaxed text-muted-foreground/40">
              Verazoi provides guidance, not medical advice. Always consult your
              physician for clinical decisions.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
