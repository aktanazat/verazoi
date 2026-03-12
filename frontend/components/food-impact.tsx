"use client"

import { useState, useEffect, useCallback } from "react"
import { getFoodImpact, type FoodImpact as FoodImpactData } from "@/lib/api"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("verazoi_token")
}

export function FoodImpact() {
  const [data, setData] = useState<FoodImpactData[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const token = getToken()
    if (!token) { setLoading(false); return }
    try {
      const items = await getFoodImpact(token)
      setData(items)
    } catch {
      // no data
    }
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
