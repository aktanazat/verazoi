"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const traits = [
  "Already wear a CGM",
  "Actively test lifestyle changes",
  "Want clearer cause-and-effect insight",
  "Care about long-term stability",
  "Prefer structured refinement over guesswork",
]

export function DesignedFor() {
  const { ref, visible } = useScrollReveal(0.1)

  return (
    <section id="designed-for" className="relative px-6 py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div ref={ref} className="mx-auto max-w-screen-lg">
        <div className="mx-auto max-w-2xl text-center">
          <p
            className={`text-[12px] font-medium uppercase tracking-[0.3em] text-primary/60 transition-all duration-700 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            Who This Is For
          </p>
          <h2
            className={`mt-6 font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-foreground text-balance transition-all duration-700 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            Built for CGM-using adults managing Type 2.
          </h2>
          <p
            className={`mt-6 text-[15px] leading-relaxed text-muted-foreground transition-all delay-100 duration-700 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            Verazoi is designed for people who:
          </p>

          <div className="mx-auto mt-10 flex max-w-md flex-col items-start gap-3">
            {traits.map((trait, i) => (
              <div
                key={trait}
                className={`card-premium flex w-full items-center gap-4 rounded-xl border border-border/50 bg-card/30 px-5 py-3.5 transition-all duration-700 ease-out ${
                  visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
                style={{ transitionDelay: `${300 + i * 80}ms` }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/8">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                <span className="text-[14px] text-foreground">{trait}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
