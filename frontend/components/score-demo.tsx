"use client"

import { useEffect, useRef, useState } from "react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const levers = [
  { id: "walk", label: "Post-dinner walk", unit: "min", min: 0, max: 30, step: 5, impact: 0.2 },
  { id: "carbs", label: "Shift carbs earlier", unit: "hrs", min: 0, max: 3, step: 0.5, impact: 1.5 },
  { id: "sleep", label: "Extra sleep", unit: "min", min: 0, max: 90, step: 15, impact: 0.06 },
]

export function ScoreDemo() {
  const { ref, visible } = useScrollReveal(0.1)
  const animationFrame = useRef<number | null>(null)
  const displayScoreRef = useRef(68)
  const [values, setValues] = useState<Record<string, number>>({
    walk: 0,
    carbs: 0,
    sleep: 0,
  })
  const [displayScore, setDisplayScore] = useState(68)

  const baseScore = 68
  const bonus = levers.reduce((sum, l) => sum + values[l.id] * l.impact, 0)
  const score = Math.min(Math.round(baseScore + bonus), 99)

  useEffect(() => {
    const from = displayScoreRef.current
    const to = score
    const duration = 320
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - elapsed, 3)
      const next = from + (to - from) * eased
      displayScoreRef.current = next
      setDisplayScore(next)

      if (elapsed < 1) {
        animationFrame.current = window.requestAnimationFrame(tick)
      }
    }

    if (animationFrame.current !== null) {
      window.cancelAnimationFrame(animationFrame.current)
    }
    animationFrame.current = window.requestAnimationFrame(tick)

    return () => {
      if (animationFrame.current !== null) {
        window.cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [score])

  const radius = 46
  const circumference = 2 * Math.PI * radius
  const progress = displayScore / 100
  const offset = circumference * (1 - progress)

  return (
    <section className="relative px-6 py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.03] blur-[120px]" />
      </div>

      <div ref={ref} className="mx-auto max-w-screen-lg">
        <div
          className={`text-center transition-all duration-700 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/60">
            Try It Yourself
          </p>
          <h2 className="mx-auto mt-6 max-w-lg font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-foreground text-balance">
            Model the score live.
          </h2>
        </div>

        <div
          className={`mx-auto mt-16 max-w-2xl transition-all delay-200 duration-700 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="gradient-border rounded-3xl bg-card/50 p-8 md:p-10">
            <div className="flex flex-col items-center gap-10 md:flex-row md:gap-12">
              {/* Score ring */}
              <div className="flex shrink-0 flex-col items-center">
                <svg viewBox="0 0 120 120" className="h-[140px] w-[140px]">
                  <defs>
                    <linearGradient id="demoRing" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" className="[stop-color:var(--primary)]" />
                      <stop offset="100%" className="[stop-color:var(--primary)]" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-primary/8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="url(#demoRing)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 60 60)"
                    className="transition-all duration-500 ease-out"
                  />
                  <g>
                  <text
                    x="60"
                    y="58"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-current text-foreground"
                    style={{ fontSize: "28px", fontWeight: 300, fontVariantNumeric: "tabular-nums" }}
                  >
                    {Math.round(displayScore)}
                  </text>
                  <text
                    x="60"
                    y="75"
                    textAnchor="middle"
                    className="fill-current text-muted-foreground"
                    style={{ fontSize: "8px", letterSpacing: "0.12em" }}
                  >
                    STABILITY
                  </text>
                </g>
                </svg>
                {bonus > 0 && (
                  <span className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[12px] font-medium text-primary transition-all">
                    +{Math.round(bonus)} points
                  </span>
                )}
              </div>

              {/* Sliders */}
              <div className="flex w-full flex-col gap-6">
                {levers.map((lever) => (
                  <div key={lever.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[13px] text-foreground">{lever.label}</span>
                      <span className="text-[13px] tabular-nums text-primary font-medium">
                        {values[lever.id]} {lever.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={lever.min}
                      max={lever.max}
                      step={lever.step}
                      value={values[lever.id]}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          [lever.id]: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-border [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_8px_var(--primary)] [&::-webkit-slider-thumb]:transition-shadow hover:[&::-webkit-slider-thumb]:shadow-[0_0_16px_var(--primary)] [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-border [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-[0_0_8px_var(--primary)] hover:[&::-moz-range-thumb]:shadow-[0_0_16px_var(--primary)]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-center text-[12px] text-muted-foreground/40">
              Illustrative example. Actual scores are calculated from your personal data.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
