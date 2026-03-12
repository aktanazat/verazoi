"use client"

import { useState, useEffect, useCallback } from "react"
import { getGoalProgress, type GoalProgress as GoalProgressData } from "@/lib/api"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("verazoi_token")
}

function ProgressBar({ label, value, max, display }: { label: string; value: number; max: number; display: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] text-muted-foreground">{label}</span>
        <span className="font-mono text-[12px] text-foreground">{display}</span>
      </div>
      <div className="mt-2 h-1.5 w-full bg-border">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function GoalProgress() {
  const [data, setData] = useState<GoalProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const token = getToken()
    if (!token) { setLoading(false); return }
    try {
      const progress = await getGoalProgress(token)
      setData(progress)
    } catch {
      // no data
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  if (loading) {
    return (
      <div className="rounded-none border border-border bg-card/50 p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">Goals</p>
        <p className="mt-3 text-[13px] text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const progress = data ?? { glucose_in_range_pct: 0, steps_today: 0, steps_target: 10000, sleep_last: 0, sleep_target: 8 }

  return (
    <div className="rounded-none border border-border bg-card/50 p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
        Goal Progress
      </p>

      <div className="mt-5 space-y-5">
        <ProgressBar
          label="Time in range"
          value={progress.glucose_in_range_pct}
          max={100}
          display={`${Math.round(progress.glucose_in_range_pct)}%`}
        />
        <ProgressBar
          label="Steps"
          value={progress.steps_today}
          max={progress.steps_target}
          display={`${progress.steps_today.toLocaleString()} / ${progress.steps_target.toLocaleString()}`}
        />
        <ProgressBar
          label="Sleep"
          value={progress.sleep_last}
          max={progress.sleep_target}
          display={`${progress.sleep_last}h / ${progress.sleep_target}h`}
        />
      </div>
    </div>
  )
}
