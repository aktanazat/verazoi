"use client"

import { useState, useEffect, useCallback } from "react"
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts"
import { getGlucoseTrend, getStabilityTrend, type GlucoseTrendPoint, type StabilityTrendPoint } from "@/lib/api"
import { FoodImpact } from "@/components/food-impact"

const periods = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("verazoi_token")
}

export default function TrendsPage() {
  const [period, setPeriod] = useState(7)
  const [glucoseData, setGlucoseData] = useState<GlucoseTrendPoint[]>([])
  const [stabilityData, setStabilityData] = useState<StabilityTrendPoint[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (days: number) => {
    const token = getToken()
    if (!token) { setLoading(false); return }
    setLoading(true)
    try {
      const [glucose, stability] = await Promise.all([
        getGlucoseTrend(token, days),
        getStabilityTrend(token, days),
      ])
      setGlucoseData(glucose)
      setStabilityData(stability)
    } catch {
      // no data
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData(period) }, [period, fetchData])

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div>
      <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Analytics
      </p>
      <h1 className="mt-3 font-serif text-[28px] font-light text-foreground">
        Trends
      </h1>

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
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={glucoseData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                    labelFormatter={formatDate}
                  />
                  <Area
                    type="monotone"
                    dataKey="min"
                    stackId="range"
                    stroke="none"
                    fill="transparent"
                  />
                  <Area
                    type="monotone"
                    dataKey="max"
                    stackId="range"
                    stroke="none"
                    fill="hsl(var(--primary) / 0.1)"
                  />
                  <Area
                    type="monotone"
                    dataKey="avg"
                    stroke="hsl(var(--primary))"
                    strokeWidth={1.5}
                    fill="none"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stabilityData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                    labelFormatter={formatDate}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <FoodImpact />
      </div>
    </div>
  )
}
