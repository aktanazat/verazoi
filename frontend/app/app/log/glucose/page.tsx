"use client"

import { useState } from "react"
import { Clock, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useAppData } from "@/contexts/app-data-context"

const trendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus }

function getTrend(value: number, prev: number): "up" | "down" | "stable" {
  const diff = value - prev
  if (diff > 10) return "up"
  if (diff < -10) return "down"
  return "stable"
}

export default function GlucoseLogPage() {
  const { state, addGlucoseReading } = useAppData()
  const [glucoseValue, setGlucoseValue] = useState("")
  const [timing, setTiming] = useState<"fasting" | "before" | "after">("fasting")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!glucoseValue || saving) return
    setSaving(true)
    await addGlucoseReading(Number(glucoseValue), timing)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setGlucoseValue("") }, 2000)
  }

  const recentReadings = state.glucoseReadings.map((r, i, arr) => ({
    time: r.time,
    value: r.value,
    trend: i === 0 ? "stable" as const : getTrend(r.value, arr[i - 1].value),
  }))

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={!glucoseValue || saving}
          className="border border-foreground bg-foreground px-6 py-2 text-[12px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85 disabled:opacity-30"
        >
          {saved ? "Saved" : saving ? "..." : "Save reading"}
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="border border-border p-6">
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Reading</p>
          <div className="mt-4 flex items-center gap-3">
            <input
              type="number"
              value={glucoseValue}
              onChange={(e) => setGlucoseValue(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent font-serif text-[36px] font-light leading-none text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
            <span className="shrink-0 text-[14px] text-muted-foreground">mg/dL</span>
          </div>
          <div className="mt-5">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Timing</p>
            <div className="mt-3 flex gap-2">
              {(["fasting", "before", "after"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTiming(t)}
                  className={`flex-1 border py-2.5 text-[12px] capitalize tracking-[0.04em] transition-colors ${
                    timing === t
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {t === "before" ? "Pre-meal" : t === "after" ? "Post-meal" : t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/70" strokeWidth={1.5} />
              <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Today</p>
            </div>
            <p className="text-[12px] text-muted-foreground/80">{recentReadings.length} readings</p>
          </div>
          <div className="mt-4">
            {recentReadings.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <p className="text-[13px] text-muted-foreground/60">No readings yet</p>
                <p className="mt-1.5 text-[12px] text-muted-foreground/40">Add your first glucose reading above.</p>
              </div>
            ) : (
              recentReadings.map((r, i) => {
                const Icon = trendIcon[r.trend]
                return (
                  <div key={i} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] text-muted-foreground">{r.time}</span>
                      <span className="font-serif text-[20px] font-light text-foreground">{r.value}</span>
                    </div>
                    <Icon
                      className={`h-4 w-4 ${r.trend === "up" ? "text-amber-600/70" : r.trend === "down" ? "text-emerald-700/60" : "text-muted-foreground/60"}`}
                      strokeWidth={1.5}
                    />
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </>
  )
}
