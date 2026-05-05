"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { getFoodImpact, getGlucoseTrend, getStabilityTrend, type FoodImpact as FoodImpactData, type GlucoseTrendPoint, type StabilityTrendPoint } from "@/lib/api"

const periods = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const

const chartWidth = 320
const chartHeight = 180
const chartPadding = { top: 14, right: 14, bottom: 26, left: 32 }

type Point = { x: number; y: number }

function formatDate(date: string) {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function toPointPath(points: Point[]) {
  return points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ")
}

function scalePoints<T>(data: T[], getValue: (item: T) => number, min: number, max: number): Point[] {
  const innerWidth = chartWidth - chartPadding.left - chartPadding.right
  const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom
  const span = Math.max(max - min, 1)

  return data.map((item, index) => {
    const x = chartPadding.left + (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth)
    const y = chartPadding.top + (1 - (getValue(item) - min) / span) * innerHeight
    return { x, y }
  })
}

function ChartFrame({
  children,
  firstLabel,
  lastLabel,
  minLabel,
  maxLabel,
}: {
  children: ReactNode
  firstLabel: string
  lastLabel: string
  minLabel: string
  maxLabel: string
}) {
  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full overflow-visible">
      <line x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={chartPadding.top} y2={chartPadding.top} className="stroke-border/70" strokeWidth="1" />
      <line x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={chartHeight - chartPadding.bottom} y2={chartHeight - chartPadding.bottom} className="stroke-border/70" strokeWidth="1" />
      <text x="4" y={chartPadding.top + 4} className="fill-muted-foreground text-[10px]">{maxLabel}</text>
      <text x="4" y={chartHeight - chartPadding.bottom + 4} className="fill-muted-foreground text-[10px]">{minLabel}</text>
      {children}
      <text x={chartPadding.left} y={chartHeight - 4} className="fill-muted-foreground text-[10px]">{firstLabel}</text>
      <text x={chartWidth - chartPadding.right} y={chartHeight - 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{lastLabel}</text>
    </svg>
  )
}

function GlucoseChart({ data }: { data: GlucoseTrendPoint[] }) {
  const { avg, min, max, minY, maxY } = useMemo(() => {
    const minY = Math.max(40, Math.min(...data.map((point) => point.min)) - 10)
    const maxY = Math.min(260, Math.max(...data.map((point) => point.max)) + 10)
    return {
      avg: scalePoints(data, (point) => point.avg, minY, maxY),
      min: scalePoints(data, (point) => point.min, minY, maxY),
      max: scalePoints(data, (point) => point.max, minY, maxY),
      minY,
      maxY,
    }
  }, [data])

  const range = `${toPointPath(max)} ${toPointPath([...min].reverse())}`

  return (
    <ChartFrame
      firstLabel={formatDate(data[0].date)}
      lastLabel={formatDate(data[data.length - 1].date)}
      minLabel={String(Math.round(minY))}
      maxLabel={String(Math.round(maxY))}
    >
      <polygon points={range} className="fill-primary/10" />
      <polyline points={toPointPath(avg)} fill="none" className="stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </ChartFrame>
  )
}

function StabilityChart({ data }: { data: StabilityTrendPoint[] }) {
  const points = useMemo(() => scalePoints(data, (point) => point.score, 0, 100), [data])

  return (
    <ChartFrame
      firstLabel={formatDate(data[0].date)}
      lastLabel={formatDate(data[data.length - 1].date)}
      minLabel="0"
      maxLabel="100"
    >
      <polyline points={toPointPath(points)} fill="none" className="stroke-foreground" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </ChartFrame>
  )
}

function FoodImpact() {
  const [data, setData] = useState<FoodImpactData[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const items = await getFoodImpact()
      setData(items)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  if (loading) {
    return (
      <div className="rounded-none border border-border bg-card/50 p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">Food Impact</p>
        <p className="mt-3 text-[13px] text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const maxDelta = Math.max(...data.map((d) => Math.abs(d.avg_delta)), 1)

  return (
    <div className="rounded-none border border-border bg-card/50 p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
        Food Impact on Glucose
      </p>
      <p className="mt-1 text-[12px] text-muted-foreground/80">Last 30 days</p>

      {data.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <p className="text-[13px] text-muted-foreground/60">No correlation data yet</p>
          <p className="mt-1.5 text-[12px] text-muted-foreground/40">Log meals and glucose readings to see food impact.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {data.map((item) => {
            const pct = (Math.abs(item.avg_delta) / maxDelta) * 100
            return (
              <div key={item.food}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] text-foreground">{item.food}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[12px] text-foreground">
                      {item.avg_delta > 0 ? "+" : ""}{Math.round(item.avg_delta)} mg/dL
                    </span>
                    <span className="text-[11px] text-muted-foreground/60">
                      {item.occurrences}x
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 h-1 w-full bg-border">
                  <div
                    className={`h-full transition-all duration-500 ${item.avg_delta > 0 ? "bg-amber-700/70" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function TrendsContent() {
  const [period, setPeriod] = useState(7)
  const [glucoseData, setGlucoseData] = useState<GlucoseTrendPoint[]>([])
  const [stabilityData, setStabilityData] = useState<StabilityTrendPoint[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (days: number) => {
    setLoading(true)
    try {
      const [glucose, stability] = await Promise.all([
        getGlucoseTrend(days),
        getStabilityTrend(days),
      ])
      setGlucoseData(glucose)
      setStabilityData(stability)
    } catch {
      setGlucoseData([])
      setStabilityData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(period) }, [period, fetchData])

  return (
    <>
      <div className="mt-6 flex gap-2">
        {periods.map((p) => (
          <button
            key={p.days}
            onClick={() => setPeriod(p.days)}
            className={`border px-4 py-2 text-[12px] tracking-[0.04em] transition-colors ${
              period === p.days
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5">
        <div className="border border-border p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            Glucose Trend
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground/80">
            Average with min/max range
          </p>
          {loading ? (
            <p className="mt-8 text-center text-[13px] text-muted-foreground">Loading...</p>
          ) : glucoseData.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <p className="text-[13px] text-muted-foreground/60">No glucose data for this period</p>
            </div>
          ) : (
            <div className="mt-4 h-[280px]">
              <GlucoseChart data={glucoseData} />
            </div>
          )}
        </div>

        <div className="border border-border p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            Stability Score
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground/80">
            Daily score over time
          </p>
          {loading ? (
            <p className="mt-8 text-center text-[13px] text-muted-foreground">Loading...</p>
          ) : stabilityData.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <p className="text-[13px] text-muted-foreground/60">No stability data for this period</p>
            </div>
          ) : (
            <div className="mt-4 h-[220px]">
              <StabilityChart data={stabilityData} />
            </div>
          )}
        </div>

        <FoodImpact />
      </div>
    </>
  )
}
