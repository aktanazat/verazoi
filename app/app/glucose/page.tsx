"use client"

import { useState } from "react"
import { Clock, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useAppData } from "@/contexts/app-data-context"

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

function getTrend(value: number, prev: number): "up" | "down" | "stable" {
  const diff = value - prev
  if (diff > 10) return "up"
  if (diff < -10) return "down"
  return "stable"
}

export default function GlucosePage() {
  const { state, dispatch } = useAppData()
  const [value, setValue] = useState("")
  const [timing, setTiming] = useState<"fasting" | "before" | "after">("fasting")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (value) {
      dispatch({
        type: "addGlucoseReading",
        payload: {
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          value: Number(value),
          timing,
        },
      })
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setValue("")
      }, 2000)
    }
  }

  const recentReadings = state.glucoseReadings.map((r, i, arr) => ({
    time: r.time,
    value: r.value,
    trend: i === 0 ? "stable" as const : getTrend(r.value, arr[i - 1].value),
  }))

  return (
    <div>
      <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Log Reading
      </p>
      <h1 className="mt-3 font-serif text-[28px] font-light text-foreground">
        Glucose
      </h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="border border-border p-5">
          <label className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
            Reading (mg/dL)
          </label>
          <div className="mt-3 flex items-baseline gap-2">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent font-serif text-[36px] font-light text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
            <span className="text-[14px] text-muted-foreground">mg/dL</span>
          </div>

          <div className="mt-6">
            <label className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
              Timing
            </label>
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

          <button
            onClick={handleSave}
            disabled={!value}
            className="mt-6 w-full bg-foreground py-3.5 text-[13px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85 disabled:opacity-30"
          >
            {saved ? "Saved" : "Save reading"}
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/70" strokeWidth={1.5} />
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
              Today
            </p>
          </div>

          <div className="mt-4 flex flex-col">
            {recentReadings.map((r, i) => {
              const Icon = trendIcon[r.trend]
              return (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-border py-4 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[13px] text-muted-foreground">{r.time}</span>
                    <span className="font-serif text-[20px] font-light text-foreground">
                      {r.value}
                    </span>
                  </div>
                  <Icon
                    className={`h-4 w-4 ${
                      r.trend === "up"
                        ? "text-amber-600/70"
                        : r.trend === "down"
                          ? "text-emerald-700/60"
                          : "text-muted-foreground/60"
                    }`}
                    strokeWidth={1.5}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
