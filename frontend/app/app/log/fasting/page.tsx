"use client"

import { useState, useEffect, useCallback } from "react"
import * as api from "@/lib/api"

const targets = [12, 16, 18, 24]

export default function FastingPage() {
  const [active, setActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [targetHours, setTargetHours] = useState(16)
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [history, setHistory] = useState<api.FastingSession[]>([])

  const load = useCallback(async () => {
    try {
      const data = await api.getActiveFast()
      if ("active" in data && data.active === false) {
        setActive(false)
      } else if (data.started_at) {
        setActive(true)
        setElapsed(data.elapsed_hours)
        setTargetHours(data.target_hours ?? 16)
        setStartedAt(new Date(data.started_at))
      }
    } catch {
      setActive(false)
    }

    const hist = await api.fastingHistory().catch(() => [])
    setHistory(hist)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!active || !startedAt) return
    const interval = setInterval(() => {
      setElapsed((Date.now() - startedAt.getTime()) / 3600000)
    }, 60000)
    return () => clearInterval(interval)
  }, [active, startedAt])

  const handleStart = async () => {
    await api.startFast(targetHours)
    setActive(true)
    setStartedAt(new Date())
    setElapsed(0)
  }

  const handleEnd = async () => {
    await api.endFast()
    setActive(false)
    setStartedAt(null)
    await load()
  }

  const formatElapsed = (h: number) => {
    const hours = Math.floor(h)
    const mins = Math.floor((h - hours) * 60)
    return `${hours}:${mins.toString().padStart(2, "0")}`
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="border border-border p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
          Fasting Timer
        </p>

        {active ? (
          <div className="mt-5">
            <p className="font-serif text-[48px] font-light text-foreground">
              {formatElapsed(elapsed)}
            </p>

            <div className="mt-4 h-1 w-full bg-border">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min((elapsed / targetHours) * 100, 100)}%` }}
              />
            </div>

            <p className="mt-2 text-[12px] text-muted-foreground">
              {targetHours}h target
            </p>

            <button
              onClick={handleEnd}
              className="mt-6 w-full bg-foreground py-2.5 text-[12px] font-medium tracking-wide text-background"
            >
              End fast
            </button>
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-[13px] text-muted-foreground">
              Track how fasting affects your glucose levels.
            </p>

            <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
              Target duration
            </p>
            <div className="mt-3 flex gap-2">
              {targets.map((t) => (
                <button
                  key={t}
                  onClick={() => setTargetHours(t)}
                  className={`flex-1 border py-2 text-[12px] tracking-[0.04em] transition-colors ${
                    targetHours === t
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {t}h
                </button>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="mt-6 w-full bg-foreground py-2.5 text-[12px] font-medium tracking-wide text-background"
            >
              Start fast
            </button>
          </div>
        )}
      </div>

      <div className="border border-border p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
          History
        </p>
        {history.length === 0 ? (
          <p className="mt-6 text-center text-[13px] text-muted-foreground/60">No completed fasts yet</p>
        ) : (
          <div className="mt-4">
            {history.map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                <div>
                  <p className="font-mono text-[14px] font-medium text-foreground">
                    {formatElapsed(s.elapsed_hours)}
                  </p>
                  {s.target_hours && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      / {s.target_hours}h target
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground/70">
                  {new Date(s.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
