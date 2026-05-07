"use client"

import { Component, createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getStabilityScore, listGlucose, listTimeline, type GlucoseReading, type StabilityScore as StabilityScoreData, type TimelineEvent } from "@/lib/api"
import { formatTime } from "@/lib/time"

type AppState = { glucoseReadings: GlucoseReading[]; timeline: TimelineEvent[]; stability: StabilityScoreData | null }
type ErrorBoundaryState = { hasError: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Something went wrong</p>
        <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted-foreground/80">The app encountered an unexpected error. Try refreshing the page.</p>
        <button onClick={() => { this.setState({ hasError: false }); window.location.reload() }} className="mt-6 border border-foreground bg-foreground px-6 py-2.5 text-[12px] font-medium tracking-wide text-background">Reload</button>
      </div>
    )
  }
}

const AppDataContext = createContext<{ state: AppState }>(null!)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({ glucoseReadings: [], timeline: [], stability: null })
  useEffect(() => {
    async function refresh() {
      try {
        const [glucoseReadings, timeline, stability] = await Promise.all([listGlucose(), listTimeline(), getStabilityScore()])
        setState({ glucoseReadings, timeline, stability })
      } catch {}
    }
    refresh()
  }, [])
  return <AppDataContext.Provider value={{ state }}>{children}</AppDataContext.Provider>
}

export function useAppData() { return useContext(AppDataContext) }

const impactColors: Record<string, string> = {
  high: "bg-amber-800/10 text-amber-800",
  moderate: "bg-foreground/5 text-foreground/70",
  low: "bg-foreground/5 text-foreground/50",
}

const eventTokens: Record<string, string> = {
  glucose: "G",
  meal: "M",
  activity: "A",
  sleep: "S",
  medication: "Rx",
  experiment: "E",
}

export function StabilityScore() {
  const { state } = useAppData()
  const score = state.stability?.score ?? 0
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    setDisplayed(0)

    let interval: ReturnType<typeof setInterval> | undefined
    const timer = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayed((prev) => {
          if (prev >= score) {
            if (interval) clearInterval(interval)
            return score
          }
          return prev + 1
        })
      }, 20)
    }, 300)

    return () => {
      clearTimeout(timer)
      if (interval) clearInterval(interval)
    }
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

export function SpikeRisk() {
  const { state } = useAppData()
  const riskPercent = Math.round((state.stability?.spike_risk ?? 0) * 100)
  const factors = state.stability?.spike_factors ?? []

  const riskLabel = riskPercent >= 60 ? "Elevated" : riskPercent >= 40 ? "Moderate" : "Low"

  return (
    <div className="border border-border p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
            Spike Risk
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground/80">
            Next 4 hours
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={riskPercent >= 40 ? "text-[13px] text-amber-700/70" : "text-[13px] text-muted-foreground/60"}>
            {riskPercent >= 40 ? "!" : "–"}
          </span>
          <span className="text-[13px] font-medium text-foreground">{riskLabel}</span>
        </div>
      </div>

      <div className="mt-5 border border-border bg-secondary/50 p-4">
        <p className="text-[13px] leading-relaxed text-foreground/80">
          {"Based on your patterns, there's a "}
          <span className="font-medium text-foreground">{riskPercent}% chance</span>
          {" of a glucose spike above 140 mg/dL in the next 4 hours."}
        </p>
      </div>

      {factors.length > 0 && (
        <div className="mt-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
            Contributing Factors
          </p>

          <div className="mt-4 flex flex-col">
            {factors.map((factor, i) => (
              <details
                key={i}
                className="group border-b border-border last:border-0"
              >
                <summary className="flex cursor-pointer items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${
                        impactColors[factor.impact] ?? impactColors.moderate
                      }`}
                    >
                      {factor.impact}
                    </span>
                    <span className="text-[13px] text-foreground">{factor.label}</span>
                  </div>
                  <span className="text-[14px] text-muted-foreground/60 transition-transform group-open:rotate-90">›</span>
                </summary>
              </details>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 border-t border-border pt-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
          Suggestion
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-foreground/80">
          A 15-minute walk now could reduce your spike risk by an estimated 30%.
        </p>
      </div>
    </div>
  )
}

export function DailyTimeline() {
  const { state } = useAppData()
  const events = state.timeline

  return (
    <div className="border border-border p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
            {"Today's Log"}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground/80">
            {events.length} entries
          </p>
        </div>
      </div>

      <div className="mt-6">
        {events.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-[13px] text-muted-foreground/60">No entries yet</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground/40">
              Log glucose, meals, medications, activity, or sleep to see your day here.
            </p>
          </div>
        ) : (
          events.map((event, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center border border-border text-[10px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                  {eventTokens[event.type] ?? "•"}
                </div>
                {index < events.length - 1 && (
                  <div className="w-px flex-1 bg-border" />
                )}
              </div>

              <div className={`flex-1 ${index < events.length - 1 ? "pb-3" : ""}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] text-foreground">{event.label}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{event.value}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground/70">{formatTime(event.recorded_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
