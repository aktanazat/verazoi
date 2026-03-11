"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowDown } from "lucide-react"

export function Hero() {
  const [phase, setPhase] = useState<"intro" | "shrink" | "brand">("intro")

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("shrink"), 2200)
    const t2 = setTimeout(() => setPhase("brand"), 3200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 pt-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[150px]" />
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-primary/[0.05] blur-[120px]" />
        <div className="absolute -left-40 bottom-40 h-[400px] w-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--border)_1px,_transparent_1px)] [background-size:48px_48px] opacity-30" />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Phase 1 & 2: "This is metabolic intelligence" shrinks away */}
        <div
          className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            phase === "intro"
              ? "scale-100 opacity-100"
              : phase === "shrink"
                ? "scale-75 opacity-0 blur-sm"
                : "pointer-events-none absolute inset-0 scale-50 opacity-0 blur-md"
          }`}
        >
          <h1 className="font-serif text-[clamp(4rem,10vw,8rem)] font-light leading-[0.95] tracking-tight">
            <span className="text-gradient">This is metabolic</span>
            <br />
            <span className="italic text-foreground">intelligence.</span>
          </h1>
        </div>

        {/* Phase 3: Verazoi brand emerges */}
        <div
          className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            phase === "brand"
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-8 scale-110 opacity-0"
          }`}
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.4em] text-primary/70">
            Introducing
          </p>
          <h1 className="mt-4 font-serif text-[clamp(4rem,10vw,8rem)] font-light leading-[0.95] tracking-tight text-foreground">
            Verazoi
          </h1>
          <div className="mx-auto mt-2 h-[2px] w-16 rounded-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <p className="mx-auto mt-8 max-w-lg text-[clamp(1.1rem,2.2vw,1.35rem)] leading-relaxed text-muted-foreground">
            Predictive metabolic intelligence. Your CGM data becomes a Stability Score and projected next steps.
          </p>

          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-primary/50">
            From <span className="font-serif italic text-primary/70">Vera</span> (truth) and{" "}
            <span className="font-serif italic text-primary/70">Zoi</span> (life)
          </p>

          <div className="mt-10 flex justify-center">
            <Link
              href="/early-access"
              className="group relative overflow-hidden rounded-full bg-primary px-8 py-3.5 text-[13px] font-medium tracking-[0.04em] text-primary-foreground transition-all duration-300 hover:shadow-xl hover:shadow-primary/25"
            >
              <span className="relative z-10">Get early access</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`absolute inset-x-0 bottom-10 flex justify-center transition-all duration-1000 delay-700 ${
          phase === "brand" ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <a href="#overview" className="group">
          <ArrowDown className="h-4 w-4 animate-bounce text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
        </a>
      </div>
    </section>
  )
}
