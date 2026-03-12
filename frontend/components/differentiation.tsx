"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const mostTools = [
  "Show glucose graphs",
  "Highlight spikes after they happen",
  "Offer generic lifestyle tips",
]

const verazoi = [
  "Calculates a Stability Score using CGM + lifestyle data",
  "Estimates predictability over time",
  "Recommends personalized adjustments",
  "Shows projected impact before you choose",
]

export function Differentiation() {
  const { ref, visible } = useScrollReveal(0.1)

  return (
    <section id="differentiation" className="relative px-6 py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div ref={ref} className="mx-auto max-w-screen-lg">
        <div
          className={`text-center transition-all duration-700 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/60">
            What Makes Verazoi Different
          </p>
          <h2 className="mx-auto mt-6 max-w-lg font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-foreground text-balance">
            From monitoring to meaningful stability.
          </h2>
        </div>

        <div
          className={`mt-16 grid gap-6 md:grid-cols-2 transition-all duration-700 delay-300 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="rounded-2xl border border-border bg-card/30 p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
              Most Tools
            </p>
            <ul className="mt-8 space-y-5">
              {mostTools.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-muted-foreground">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/30" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="gradient-border rounded-2xl bg-card/50 p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              Verazoi
            </p>
            <ul className="mt-8 space-y-5">
              {verazoi.map((item, i) => (
                <li
                  key={item}
                  className={`flex items-start gap-3 text-[15px] text-foreground transition-all duration-700 ease-out ${
                    visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                  }`}
                  style={{ transitionDelay: `${500 + i * 100}ms` }}
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p
          className={`mt-10 text-center font-serif text-[18px] italic text-muted-foreground transition-all duration-700 delay-500 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          {"You're not just tracking -- you're refining."}
        </p>
      </div>
    </section>
  )
}
