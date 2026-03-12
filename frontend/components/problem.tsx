"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"

export function Problem() {
  const { ref, visible } = useScrollReveal(0.1)

  return (
    <section id="problem" className="relative px-6 py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div ref={ref} className="mx-auto max-w-screen-lg">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div
            className={`transition-all duration-700 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/60">
              The Problem
            </p>
            <h2 className="mt-6 font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-balance">
              <span className="text-gradient">More data doesn't always</span>
              {" "}
              <span className="text-foreground">mean more clarity.</span>
            </h2>
          </div>

          <div
            className={`flex flex-col justify-end gap-8 transition-all delay-200 duration-700 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                You track your glucose. You test meals. You try walking after
                dinner. You experiment with sleep and stress.
              </p>
              <p className="text-foreground font-medium">
                But it's still hard to know:
              </p>
              <ul className="space-y-2.5 pl-1">
                {[
                  "Which habits actually improve long-term stability?",
                  "Which changes matter most?",
                  "What to prioritize next?",
                ].map((item, i) => (
                  <li
                    key={item}
                    className={`flex items-start gap-3 transition-all duration-700 ease-out ${
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
            <div className="gradient-border rounded-xl p-5 bg-card/50">
              <p className="text-[14px] italic text-muted-foreground">
                Most tools show charts. Few help you decide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
