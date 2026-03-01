"use client"

import { useEffect, useState, useCallback } from "react"
import { ArrowDown } from "lucide-react"

const phrases = [
  "Predict stability.",
  "See projected impact.",
  "Refine what matters.",
]

function RotatingText() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const cycle = useCallback(() => {
    setVisible(false)
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % phrases.length)
      setVisible(true)
    }, 500)
    return id
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      cycle()
    }, 3000)
    return () => clearInterval(interval)
  }, [cycle])

  return (
    <span
      className={`inline-block transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {phrases[index]}
    </span>
  )
}

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 pt-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[150px]" />
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute -left-40 bottom-40 h-[400px] w-[400px] rounded-full bg-primary/[0.02] blur-[100px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--border)_1px,_transparent_1px)] [background-size:48px_48px] opacity-30" />

      <div
        className={`relative mx-auto max-w-3xl text-center transition-all duration-1000 ease-out ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <h1 className="font-serif text-[clamp(3rem,7vw,5.5rem)] font-light leading-[1.05] tracking-tight text-balance">
          <span className="text-gradient">This is metabolic</span>
          <br />
          <span className="italic text-foreground">intelligence.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-lg text-[clamp(1.1rem,2.2vw,1.35rem)] leading-relaxed text-muted-foreground">
          Already wearing a CGM? Verazoi turns your data into a Stability Score and projected next steps.
        </p>

        <div className="mt-4 h-8">
          <p className="font-serif text-[20px] italic text-primary/60">
            <RotatingText />
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="#early-access"
            className="group relative overflow-hidden rounded-full bg-primary px-8 py-3.5 text-[13px] font-medium tracking-[0.04em] text-primary-foreground transition-all duration-300 hover:shadow-xl hover:shadow-primary/25"
          >
            <span className="relative z-10">Get early access</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </a>
        </div>
      </div>

      <div
        className={`absolute inset-x-0 bottom-10 flex justify-center transition-all duration-1000 delay-700 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <a href="#overview" className="group">
          <ArrowDown className="h-4 w-4 animate-bounce text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
        </a>
      </div>
    </section>
  )
}
