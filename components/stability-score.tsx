"use client"

import { useEffect, useState } from "react"
import { useAppData } from "@/contexts/app-data-context"

export function StabilityScore() {
  const { state } = useAppData()
  const score = state.stabilityScore
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    setDisplayed(0)
    const timer = setTimeout(() => {
      const step = () => {
        setDisplayed((prev) => {
          if (prev >= score) return score
          return prev + 1
        })
      }
      const interval = setInterval(step, 20)
      return () => clearInterval(interval)
    }, 300)
    return () => clearTimeout(timer)
  }, [score])

  const circumference = 2 * Math.PI * 76
  const offset = circumference - (displayed / 100) * circumference

  const getLabel = () => {
    if (displayed >= 80) return "Excellent"
    if (displayed >= 60) return "Good"
    if (displayed >= 40) return "Fair"
    return "Needs attention"
  }

  const readings = state.glucoseReadings
  const avgGlucose = readings.length > 0
    ? Math.round(readings.reduce((sum, r) => sum + r.value, 0) / readings.length)
    : 0
  const variability = readings.length > 1
    ? Math.round(Math.max(...readings.map((r) => r.value)) - Math.min(...readings.map((r) => r.value)))
    : 0
  const inRange = readings.length > 0
    ? Math.round((readings.filter((r) => r.value >= 70 && r.value <= 140).length / readings.length) * 100)
    : 0

  return (
    <div className="border border-border p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
            Stability Score
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground/80">
            Last 7 days
          </p>
        </div>
        <span className="border border-border px-2.5 py-1 text-[11px] tracking-[0.02em] text-muted-foreground">
          {getLabel()}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <div className="relative">
          <svg width="180" height="180" className="-rotate-90">
            <circle
              cx="90"
              cy="90"
              r="76"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border"
            />
            <circle
              cx="90"
              cy="90"
              r="76"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-foreground transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="-mt-1 font-serif text-[48px] font-light leading-none text-foreground">
              {displayed}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="font-serif text-[22px] font-light text-foreground">{avgGlucose}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Avg glucose</p>
        </div>
        <div className="text-center">
          <p className="font-serif text-[22px] font-light text-foreground">{variability}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Variability</p>
        </div>
        <div className="text-center">
          <p className="font-serif text-[22px] font-light text-foreground">{inRange}%</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">In range</p>
        </div>
      </div>
    </div>
  )
}
