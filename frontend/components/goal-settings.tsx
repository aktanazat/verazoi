"use client"

import { useState, useEffect, useCallback } from "react"
import { getGoals, updateGoals, type Goals } from "@/lib/api"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("verazoi_token")
}

export function GoalSettings() {
  const [goals, setGoals] = useState<Goals>({ glucose_low: 70, glucose_high: 140, daily_steps: 10000, sleep_hours: 8 })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchGoals = useCallback(async () => {
    const token = getToken()
    if (!token) return
    try {
      const data = await getGoals(token)
      setGoals(data)
    } catch {
      // defaults
    }
  }, [])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const handleSave = async () => {
    const token = getToken()
    if (!token) return
    setSaving(true)
    try {
      await updateGoals(token, goals)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // save failed
    }
    setSaving(false)
  }

  return (
    <div className="rounded-none border border-border bg-card/50 p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
        Goal Settings
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-muted-foreground">Glucose low (mg/dL)</label>
          <input
            type="number"
            value={goals.glucose_low}
            onChange={(e) => setGoals({ ...goals, glucose_low: Number(e.target.value) })}
            className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground">Glucose high (mg/dL)</label>
          <input
            type="number"
            value={goals.glucose_high}
            onChange={(e) => setGoals({ ...goals, glucose_high: Number(e.target.value) })}
            className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground">Daily steps</label>
          <input
            type="number"
            value={goals.daily_steps}
            onChange={(e) => setGoals({ ...goals, daily_steps: Number(e.target.value) })}
            className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground">Sleep (hours)</label>
          <input
            type="number"
            step="0.5"
            value={goals.sleep_hours}
            onChange={(e) => setGoals({ ...goals, sleep_hours: Number(e.target.value) })}
            className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 w-full bg-foreground py-2 text-[12px] font-medium tracking-wide text-background disabled:opacity-50"
      >
        {saved ? "Saved" : saving ? "..." : "Save goals"}
      </button>
    </div>
  )
}
