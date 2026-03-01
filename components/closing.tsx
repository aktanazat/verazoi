"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"

export function Closing() {
  const { ref, visible } = useScrollReveal(0.2)

  return (
    <section className="relative px-6 py-32 lg:py-44">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[150px]" />
      </div>

      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--border)_1px,_transparent_1px)] [background-size:48px_48px] opacity-20" />

      <div ref={ref} className="relative mx-auto max-w-screen-lg text-center">
        <p
          className={`font-serif text-[clamp(2rem,5vw,4.5rem)] font-light leading-[1.1] tracking-tight transition-all duration-1000 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <span className="text-gradient">Your data already</span>
          <br />
          <span className="italic text-foreground">has the answers.</span>
        </p>
      </div>
    </section>
  )
}
