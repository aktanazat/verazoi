"use client"

import { useCallback, useEffect, useState } from "react"
import { getGoalProgress, getWearableStatus, syncWearable, type GoalProgress as GoalProgressData, type WearableStatus } from "@/lib/api"

const deviceNames = ["Apple Watch", "Garmin", "Samsung Galaxy Watch"]

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
    try {
      const progress = await getGoalProgress()
      setData(progress)
    } catch {}
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

export function WearableDevice() {
  const [status, setStatus] = useState<WearableStatus | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getWearableStatus()
      setStatus(data)
    } catch {
      setStatus(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  const handleSync = async () => {
    setSyncing(true)
    try {
      await syncWearable({})
      await fetchStatus()
    } catch {}
    setSyncing(false)
  }

  if (loading) {
    return (
      <div className="rounded-none border border-border bg-card/50 p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
          Wearable Device
        </p>
        <p className="mt-3 text-[13px] text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const connected = status?.connected

  return (
    <div className="rounded-none border border-border bg-card/50 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            Wearable Device
          </p>
          <p className={`mt-1 text-[12px] ${connected ? "text-primary" : "text-muted-foreground/80"}`}>
            {connected ? "Connected" : "Not connected"}
          </p>
        </div>
        {connected && (
          <span className="rounded-full border border-primary/20 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-primary">
            Live
          </span>
        )}
      </div>

      {connected && status ? (
        <div className="mt-4">
          {status.last_sync && (
            <p className="text-[11px] text-muted-foreground/60">
              Last sync: {new Date(status.last_sync).toLocaleString("en-US", {
                month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
              })}
            </p>
          )}

          <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            Latest data
          </p>
          <div className="mt-3 divide-y divide-border">
            <MetricRow token="HR" label="Heart rate" value={status.heart_rate ? `${status.heart_rate} bpm` : "--"} />
            <MetricRow token="ST" label="Steps today" value={status.steps ? status.steps.toLocaleString() : "--"} />
            <MetricRow token="AM" label="Active minutes" value={status.active_minutes ? `${status.active_minutes} min` : "--"} />
            <MetricRow token="SL" label="Last sleep" value={status.sleep_hours ? `${status.sleep_hours} hrs` : "--"} />
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="mt-5 flex w-full items-center justify-center gap-2 bg-foreground py-2.5 text-[12px] font-medium tracking-wide text-background disabled:opacity-50"
          >
            <span className={syncing ? "animate-spin" : ""}>↻</span>
            {syncing ? "Syncing..." : "Sync now"}
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            No wearable data yet. Connect a device from the Verazoi iOS app to sync activity, sleep, and heart rate into your stability score.
          </p>
          <div className="mt-4 space-y-1.5">
            {deviceNames.map((name) => (
              <div key={name} className="flex items-center gap-3 border border-border px-4 py-3 text-muted-foreground/60">
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">Wear</span>
                <span className="text-[13px]">{name}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground/40">
            Pair via the iOS app to start syncing.
          </p>
        </div>
      )}
    </div>
  )
}

function MetricRow({ token, label, value }: { token: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="w-6 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{token}</span>
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="ml-auto font-mono text-[13px] font-medium text-foreground">{value}</span>
    </div>
  )
}
