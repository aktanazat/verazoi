"use client"

import { useState, useEffect, useCallback } from "react"
import { Watch, Heart, Footprints, Moon, Flame, RefreshCw } from "lucide-react"
import { getWearableStatus, syncWearable, type WearableStatus } from "@/lib/api"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("verazoi_token")
}

export function WearableDevice() {
  const [status, setStatus] = useState<WearableStatus | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchStatus = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const data = await getWearableStatus(token)
      setStatus(data)
    } catch {
      setStatus(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  const handleSync = async () => {
    const token = getToken()
    if (!token) return
    setSyncing(true)
    try {
      await syncWearable(token, {})
      await fetchStatus()
    } catch {
      // sync failed silently
    }
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
          <Watch className="h-5 w-5 text-primary" strokeWidth={1.5} />
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
            <MetricRow icon={Heart} label="Heart rate" value={status.heart_rate ? `${status.heart_rate} bpm` : "--"} />
            <MetricRow icon={Footprints} label="Steps today" value={status.steps ? status.steps.toLocaleString() : "--"} />
            <MetricRow icon={Flame} label="Active minutes" value={status.active_minutes ? `${status.active_minutes} min` : "--"} />
            <MetricRow icon={Moon} label="Last sleep" value={status.sleep_hours ? `${status.sleep_hours} hrs` : "--"} />
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="mt-5 flex w-full items-center justify-center gap-2 bg-foreground py-2.5 text-[12px] font-medium tracking-wide text-background disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync now"}
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            No wearable data yet. Connect a device from the Verazoi iOS app to sync activity, sleep, and heart rate into your stability score.
          </p>
          <div className="mt-4 space-y-1.5">
            {["Apple Watch", "Garmin", "Samsung Galaxy Watch"].map((name) => (
              <div key={name} className="flex items-center gap-3 border border-border px-4 py-3 text-muted-foreground/60">
                <Watch className="h-4 w-4 shrink-0" strokeWidth={1.5} />
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

function MetricRow({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="ml-auto font-mono text-[13px] font-medium text-foreground">{value}</span>
    </div>
  )
}
