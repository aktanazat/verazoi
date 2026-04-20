"use client"

import { useEffect, useState } from "react"
import { useAppData } from "@/contexts/app-data-context"

export function StabilityScore() {
  const { state } = useAppData()
  const score = state.stability?.score ?? 0
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

  const circumference = 2 * Math.PI * 100
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
  const inRange = readings.length > 0
    ? Math.round((readings.filter((r) => r.value >= 70 && r.value <= 140).length / readings.length) * 100)
    : 0

  return (
    <div className="border border-border p-6">
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

      <div className="mt-6 flex items-center justify-center">
        <div className="relative">
          <svg width="240" height="240" className="-rotate-90">
            <circle
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border"
            />
            <circle
              cx="120"
              cy="120"
              r="100"
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
            <span className="-translate-y-1 font-serif text-[56px] font-light leading-none text-foreground">
              {displayed}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="font-serif text-[28px] font-light text-foreground">{avgGlucose}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">Avg glucose</p>
        </div>
        <div className="text-center">
          <p className="font-serif text-[28px] font-light text-foreground">{inRange}%</p>
          <p className="mt-1 text-[13px] text-muted-foreground">In range</p>
        </div>
      </div>
    </div>
  )
}
