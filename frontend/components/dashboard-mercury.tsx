"use client"

import Link from "next/link"
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useAppData } from "@/components/stability-score"
import { getStabilityTrend, getGoalProgress, getWearableStatus, type StabilityTrendPoint, type GoalProgress as GoalProgressData, type WearableStatus } from "@/lib/api"

const DemoContext = createContext(false)
const useDemo = () => useContext(DemoContext)

type Range = "7D" | "30D" | "90D"
const rangeDays: Record<Range, number> = { "7D": 7, "30D": 30, "90D": 90 }

function demoTrend(days: number): StabilityTrendPoint[] {
  const out: StabilityTrendPoint[] = []
  let s = 1234567
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
  const start = new Date()
  start.setDate(start.getDate() - days + 1)
  const baseline = days === 7 ? 71 : days === 30 ? 68 : 64
  const end = 82
  for (let i = 0; i < days; i++) {
    const t = i / Math.max(days - 1, 1)
    const trend = baseline + (end - baseline) * Math.pow(t, 0.85)
    const wave = Math.sin(i * 0.6) * 1.6 + Math.cos(i * 0.27) * 1.2
    const noise = (rand() - 0.5) * 2.4
    const score = Math.max(40, Math.min(95, Math.round(trend + wave + noise)))
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    out.push({ date: d.toISOString().slice(0, 10), score })
  }
  return out
}

const demoStability = { score: 82, spike_risk: 0.32, spike_factors: [
  { label: "Late carbs at dinner", weight: 0.42 },
  { label: "Below sleep target", weight: 0.28 },
  { label: "Stationary morning", weight: 0.18 },
] }

const demoReadings = [
  { value: 102, recorded_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(), source: "demo" },
  { value: 96, recorded_at: new Date(Date.now() - 80 * 60 * 1000).toISOString(), source: "demo" },
  { value: 158, recorded_at: new Date(Date.now() - 145 * 60 * 1000).toISOString(), source: "demo" },
  { value: 124, recorded_at: new Date(Date.now() - 220 * 60 * 1000).toISOString(), source: "demo" },
  { value: 92, recorded_at: new Date(Date.now() - 320 * 60 * 1000).toISOString(), source: "demo" },
  { value: 108, recorded_at: new Date(Date.now() - 480 * 60 * 1000).toISOString(), source: "demo" },
  { value: 142, recorded_at: new Date(Date.now() - 600 * 60 * 1000).toISOString(), source: "demo" },
  { value: 88, recorded_at: new Date(Date.now() - 720 * 60 * 1000).toISOString(), source: "demo" },
]

const demoTimeline = [
  { type: "glucose", label: "CGM reading", value: "102 mg/dL", recorded_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(), impact: "low" },
  { type: "meal", label: "Breakfast", value: "Greek yogurt, berries, almonds", recorded_at: new Date(Date.now() - 145 * 60 * 1000).toISOString(), impact: "moderate" },
  { type: "activity", label: "Morning walk", value: "22 min, 1.4 mi", recorded_at: new Date(Date.now() - 200 * 60 * 1000).toISOString(), impact: "low" },
  { type: "sleep", label: "Sleep", value: "7h 12m, 84% efficiency", recorded_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), impact: "low" },
  { type: "medication", label: "Metformin", value: "500mg", recorded_at: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(), impact: "low" },
]

const demoGoals: GoalProgressData = {
  glucose_in_range_pct: 87,
  steps_today: 6840,
  steps_target: 10000,
  sleep_last: 7.2,
  sleep_target: 8,
}

const demoWearable: WearableStatus = {
  connected: true,
  last_sync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  heart_rate: 68,
  steps: 6840,
  active_minutes: 42,
  sleep_hours: 7.2,
}

function resample(values: number[], target: number): number[] {
  if (values.length === 0) return new Array(target).fill(0)
  if (values.length === 1) return new Array(target).fill(values[0])
  if (values.length === target) return values
  const out: number[] = []
  const last = values.length - 1
  for (let i = 0; i < target; i++) {
    const t = (i / (target - 1)) * last
    const lo = Math.floor(t)
    const hi = Math.min(last, lo + 1)
    const frac = t - lo
    out.push(values[lo] * (1 - frac) + values[hi] * frac)
  }
  return out
}

function buildAreaPath(values: number[], width = 600, height = 160, padding = 6) {
  if (values.length === 0) return { line: "", area: "" }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const stepX = (width - padding * 2) / Math.max(values.length - 1, 1)
  const ys = values.map((v) => padding + (1 - (v - min) / span) * (height - padding * 2))
  let line = `M${padding},${ys[0].toFixed(2)}`
  for (let i = 1; i < ys.length; i++) {
    const x = padding + i * stepX
    const px = padding + (i - 1) * stepX
    const cx = px + stepX / 2
    line += ` C${cx.toFixed(2)},${ys[i - 1].toFixed(2)} ${cx.toFixed(2)},${ys[i].toFixed(2)} ${x.toFixed(2)},${ys[i].toFixed(2)}`
  }
  const area = `${line} L${(padding + (values.length - 1) * stepX).toFixed(2)},${height - padding} L${padding},${height - padding} Z`
  return { line, area }
}

function useAnimatedValues(target: number[], duration = 600): number[] {
  const [out, setOut] = useState<number[]>(target)
  const currentRef = useRef<number[]>(target)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (target.length === 0) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      currentRef.current = []
      setOut([])
      return
    }
    const from = resample(
      currentRef.current.length ? currentRef.current : target,
      target.length,
    )
    const to = target
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = to.map((v, i) => from[i] + (v - from[i]) * eased)
      currentRef.current = next
      setOut(next)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])
  return out
}

function shortDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function ChartCard() {
  const { state } = useAppData()
  const demo = useDemo()
  const [range, setRange] = useState<Range>("30D")
  const [trend, setTrend] = useState<StabilityTrendPoint[] | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let alive = true
    if (demo) {
      setTrend(demoTrend(rangeDays[range]))
      return () => { alive = false }
    }
    getStabilityTrend(rangeDays[range])
      .then((data) => { if (alive) setTrend(data ?? []) })
      .catch(() => { if (alive) setTrend([]) })
    return () => { alive = false }
  }, [range, demo])

  const score = state.stability?.score ?? (demo ? demoStability.score : 0)
  const values = useMemo(() => trend?.map((p) => p.score) ?? [], [trend])
  const dates = useMemo(() => trend?.map((p) => p.date) ?? [], [trend])
  const last = values.at(-1) ?? score
  const first = values[0] ?? score
  const delta = last - first
  const high = values.length ? Math.max(...values) : score
  const low = values.length ? Math.min(...values) : score

  const W = 600
  const H = 160
  const PAD = 6
  const SAMPLES = 64
  const targetSamples = useMemo(() => resample(values, SAMPLES), [values])
  const animatedSamples = useAnimatedValues(targetSamples, 600)

  const minV = animatedSamples.length ? Math.min(...animatedSamples) : 0
  const maxV = animatedSamples.length ? Math.max(...animatedSamples) : 1
  const span = (maxV - minV) || 1
  const stepX = (W - PAD * 2) / Math.max(animatedSamples.length - 1, 1)
  const ys = animatedSamples.map((v) => PAD + (1 - (v - minV) / span) * (H - PAD * 2))
  const xs = animatedSamples.map((_, i) => PAD + i * stepX)
  const { line, area } = useMemo(() => buildAreaPath(animatedSamples, W, H, PAD), [animatedSamples])

  const ticks = useMemo(() => {
    if (dates.length < 2) return []
    const count = 5
    const out: { x: number; label: string }[] = []
    for (let i = 0; i < count; i++) {
      const idx = Math.round((i / (count - 1)) * (dates.length - 1))
      const xPct = (idx / Math.max(dates.length - 1, 1)) * 100
      out.push({ x: xPct, label: shortDate(dates[idx]) })
    }
    return out
  }, [dates])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!wrapRef.current || values.length < 2) return
    const rect = wrapRef.current.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const idx = Math.round(((px - PAD) / Math.max(values.length - 1, 1)) * (values.length - 1) - PAD)
    const dataIdx = Math.round(((e.clientX - rect.left) / rect.width) * (values.length - 1))
    const clamped = Math.max(0, Math.min(values.length - 1, dataIdx))
    setHover(clamped)
  }
  const handlePointerLeave = () => setHover(null)

  const focused = hover ?? values.length - 1
  const focusedScore = values[focused] ?? score
  const focusedDate = dates[focused]
  const focusedFrac = values.length > 1 ? focused / (values.length - 1) : 0
  const focusedSampleIdx = Math.round(focusedFrac * (animatedSamples.length - 1))
  const tooltipX = (xs[focusedSampleIdx] ?? 0) / W * 100
  const tooltipY = (ys[focusedSampleIdx] ?? 0) / H * 100

  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-medium text-foreground">Stability score</p>
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/15 text-[8px] font-semibold text-primary">v</span>
          </div>
          <p className="mt-3 font-serif text-[42px] font-light leading-none text-foreground">
            {hover != null ? focusedScore : (score || last || 0)}
            <span className="ml-1.5 align-top text-[14px] text-muted-foreground/60">/100</span>
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground tabular-nums">
            {hover != null && focusedDate
              ? new Date(focusedDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
              : range === "7D" ? "Last 7 days" : range === "30D" ? "Last 30 days" : "Last 90 days"}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border/60 bg-background/60 p-0.5">
          {(["7D", "30D", "90D"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-[6px] px-2.5 py-1 text-[11px] font-medium transition-colors ${
                range === r ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-5 text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 7 L5 3 L8 7" stroke="currentColor" strokeWidth="1.2" fill="none" className="text-emerald-700/70" /></svg>
          <span className="tabular-nums text-foreground/80">+{Math.max(0, Math.round(delta))}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 3 L5 7 L8 3" stroke="currentColor" strokeWidth="1.2" fill="none" className="text-amber-700/70" /></svg>
          <span className="tabular-nums text-foreground/80">{Math.round(low)}-{Math.round(high)}</span>
        </span>
      </div>

      <div
        ref={wrapRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative mt-3 h-[180px] w-full select-none"
      >
        {values.length > 1 ? (
          <>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="dashTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" className="[stop-color:var(--primary)]" stopOpacity="0.18" />
                  <stop offset="100%" className="[stop-color:var(--primary)]" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={area} fill="url(#dashTrend)" />
              <path d={line} fill="none" stroke="currentColor" strokeWidth="1.6" className="text-primary" strokeLinecap="round" strokeLinejoin="round" />
              {hover != null && (
                <>
                  <line x1={xs[focusedSampleIdx]} x2={xs[focusedSampleIdx]} y1={PAD} y2={H - PAD} stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-foreground/25" />
                  <circle cx={xs[focusedSampleIdx]} cy={ys[focusedSampleIdx]} r="6" fill="currentColor" className="text-primary/15" />
                  <circle cx={xs[focusedSampleIdx]} cy={ys[focusedSampleIdx]} r="3" fill="var(--background)" stroke="currentColor" strokeWidth="1.4" className="text-primary" />
                </>
              )}
            </svg>
            {hover != null && (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-md border border-border/80 bg-background/95 px-2.5 py-1.5 text-[11px] shadow-sm backdrop-blur-md"
                style={{
                  left: `clamp(48px, ${tooltipX}%, calc(100% - 48px))`,
                  top: `calc(${tooltipY}% - 44px)`,
                }}
              >
                <p className="tabular-nums text-foreground">{focusedScore}</p>
                <p className="text-[10px] text-muted-foreground tabular-nums">
                  {focusedDate ? new Date(focusedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-muted-foreground/60">No trend data yet</div>
        )}
      </div>

      <div key={range} className="mt-2 flex animate-in fade-in justify-between px-1 duration-500">
        {ticks.map((t, i) => (
          <span key={i} className="text-[10px] text-muted-foreground/60 tabular-nums">{t.label}</span>
        ))}
      </div>
    </div>
  )
}

function MetricRow({ token, label, value, hint }: { token: string; label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
          {token}
        </span>
        <div>
          <p className="text-[13px] text-foreground">{label}</p>
          {hint ? <p className="text-[11px] text-muted-foreground/70">{hint}</p> : null}
        </div>
      </div>
      <span className="text-[15px] font-medium tabular-nums text-foreground">{value}</span>
    </div>
  )
}

function MetricsCard() {
  const { state } = useAppData()
  const demo = useDemo()
  const readings = state.glucoseReadings.length
    ? state.glucoseReadings
    : (demo ? demoReadings : [])
  const avgGlucose = readings.length
    ? Math.round(readings.reduce((sum, r) => sum + r.value, 0) / readings.length)
    : 0
  const inRange = readings.length
    ? Math.round((readings.filter((r) => r.value >= 70 && r.value <= 140).length / readings.length) * 100)
    : 0
  const variability = readings.length
    ? Math.round(Math.sqrt(readings.reduce((s, r) => s + Math.pow(r.value - avgGlucose, 2), 0) / readings.length))
    : 0
  const last = readings[0]?.value
  const previous = readings[1]?.value
  const lastDelta = last && previous ? last - previous : 0

  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-foreground">Today&apos;s metrics</p>
        <Link href="/app/log/glucose" className="text-[11px] text-muted-foreground hover:text-foreground">View log</Link>
      </div>

      <div className="mt-2 divide-y divide-border/60">
        <MetricRow token="GL" label="Latest glucose" value={last ? `${last}` : "--"} hint={lastDelta ? `${lastDelta > 0 ? "+" : ""}${lastDelta} vs prior` : "mg/dL"} />
        <MetricRow token="AV" label="Average" value={avgGlucose ? `${avgGlucose}` : "--"} hint="mg/dL" />
        <MetricRow token="IR" label="In range" value={inRange ? `${inRange}%` : "--"} hint="70-140 mg/dL" />
        <MetricRow token="SD" label="Variability" value={variability ? `${variability}` : "--"} hint="standard deviation" />
      </div>
    </div>
  )
}

function SpikeCard() {
  const { state } = useAppData()
  const demo = useDemo()
  const stab = state.stability ?? (demo ? demoStability : null)
  const riskPercent = Math.round(((stab?.spike_risk ?? 0)) * 100)
  const factors = stab?.spike_factors ?? []
  const label = riskPercent >= 60 ? "Elevated" : riskPercent >= 40 ? "Moderate" : "Low"

  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-foreground">Spike risk</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Next 4 hours</p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground/80">{label}</span>
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="font-serif text-[36px] font-light leading-none text-foreground">{riskPercent}</span>
        <span className="text-[14px] text-muted-foreground">%</span>
      </div>

      <div className="mt-3 h-1 w-full rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary/70 transition-all duration-500"
          style={{ width: `${Math.min(riskPercent, 100)}%` }}
        />
      </div>

      <div className="mt-5 space-y-2">
        {factors.length === 0 ? (
          <p className="text-[12px] text-muted-foreground/70">No active risk factors</p>
        ) : (
          factors.slice(0, 3).map((f) => (
            <div key={f.label} className="flex items-center justify-between text-[12px]">
              <span className="text-foreground/80">{f.label}</span>
              <span className="text-muted-foreground tabular-nums">{Math.round(f.weight * 100)}%</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function GoalsCard() {
  const demo = useDemo()
  const [data, setData] = useState<GoalProgressData | null>(null)
  useEffect(() => {
    if (demo) { setData(demoGoals); return }
    getGoalProgress().then((d) => setData(d ?? null)).catch(() => setData(null))
  }, [demo])

  const progress = data ?? { glucose_in_range_pct: 0, steps_today: 0, steps_target: 10000, sleep_last: 0, sleep_target: 8 }
  const pct = (v: number, m: number) => Math.min((v / Math.max(m, 1)) * 100, 100)

  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-foreground">Daily goals</p>
        <span className="text-[11px] text-muted-foreground tabular-nums">{Math.round(progress.glucose_in_range_pct)}% in range</span>
      </div>

      <div className="mt-5 space-y-4">
        <GoalRow label="Time in range" display={`${Math.round(progress.glucose_in_range_pct)}%`} pct={pct(progress.glucose_in_range_pct, 100)} />
        <GoalRow label="Steps" display={`${progress.steps_today.toLocaleString()} / ${progress.steps_target.toLocaleString()}`} pct={pct(progress.steps_today, progress.steps_target)} />
        <GoalRow label="Sleep" display={`${progress.sleep_last}h / ${progress.sleep_target}h`} pct={pct(progress.sleep_last, progress.sleep_target)} />
      </div>
    </div>
  )
}

function GoalRow({ label, display, pct }: { label: string; display: string; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-foreground/80">{label}</span>
        <span className="font-mono text-foreground tabular-nums">{display}</span>
      </div>
      <div className="mt-1.5 h-1 w-full rounded-full bg-border">
        <div className="h-full rounded-full bg-foreground/70 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function WearableCard() {
  const demo = useDemo()
  const [status, setStatus] = useState<WearableStatus | null>(null)
  useEffect(() => {
    if (demo) { setStatus(demoWearable); return }
    getWearableStatus().then((d) => setStatus(d ?? null)).catch(() => setStatus(null))
  }, [demo])

  const connected = !!status?.last_sync
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-foreground">Wearable</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{connected ? "Live data" : "Not connected"}</p>
        </div>
        {connected ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-primary">Live</span>
        ) : null}
      </div>

      {connected && status ? (
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
          <Stat label="Heart rate" value={status.heart_rate ? `${status.heart_rate} bpm` : "--"} />
          <Stat label="Steps" value={status.steps ? status.steps.toLocaleString() : "--"} />
          <Stat label="Active" value={status.active_minutes ? `${status.active_minutes}m` : "--"} />
          <Stat label="Sleep" value={status.sleep_hours ? `${status.sleep_hours}h` : "--"} />
        </div>
      ) : (
        <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
          Connect a device from the iOS app to sync activity, sleep, and heart rate.
        </p>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">{label}</p>
      <p className="mt-1 text-[16px] font-medium text-foreground tabular-nums">{value}</p>
    </div>
  )
}

const quickActions = [
  { label: "Log glucose", href: "/app/log/glucose", token: "+" },
  { label: "Log meal", href: "/app/log/meals", token: "M" },
  { label: "Log activity", href: "/app/log/activity", token: "A" },
  { label: "Insights", href: "/app/insights", token: "AI" },
  { label: "Trends", href: "/app/trends", token: "T" },
]

function QuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {quickActions.map((a) => (
        <Link
          key={`${a.href}-${a.label}`}
          href={a.href}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/70 px-3 py-1.5 text-[12px] text-foreground/80 backdrop-blur-md transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          <span className="text-[10px] font-medium text-muted-foreground/70">{a.token}</span>
          <span>{a.label}</span>
        </Link>
      ))}
    </div>
  )
}

function TimelineSnapshot() {
  const { state } = useAppData()
  const demo = useDemo()
  const source = state.timeline.length ? state.timeline : (demo ? demoTimeline : [])
  const events = source.slice(0, 5)
  const total = source.length

  const tokenFor: Record<string, string> = { glucose: "G", meal: "M", activity: "A", sleep: "S", medication: "Rx", experiment: "E" }

  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-foreground">Today&apos;s log</p>
        <span className="text-[11px] text-muted-foreground tabular-nums">{total} entries</span>
      </div>

      <div className="mt-3">
        {events.length === 0 ? (
          <p className="py-8 text-center text-[12px] text-muted-foreground/60">No entries yet</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {events.map((event, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium uppercase text-muted-foreground">
                  {tokenFor[event.type] ?? "•"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-foreground">{event.label}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{event.value}</p>
                </div>
                <span className="text-[11px] text-muted-foreground/70 tabular-nums">
                  {new Date(event.recorded_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function ModeToggle({ demo }: { demo: boolean }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card/40 p-1 backdrop-blur-md">
      <Link
        href="/app/dashboard"
        className={`rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.02em] transition-colors ${
          demo ? "text-muted-foreground hover:text-foreground" : "bg-foreground text-background"
        }`}
      >
        Live
      </Link>
      <Link
        href="/app/dashboard/demo"
        className={`rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.02em] transition-colors ${
          demo ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Demo
      </Link>
    </div>
  )
}

export function MercuryDashboard({ demo = false }: { demo?: boolean }) {
  return (
    <DemoContext.Provider value={demo}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {demo ? "Demo · Sample data" : "Overview"}
            </p>
            <h1 className="mt-1.5 font-serif text-[30px] font-light leading-tight text-foreground">
              {demo ? "Stability preview" : "Welcome back"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle demo={demo} />
          </div>
        </div>

        <QuickActions />

        <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <ChartCard />
          <MetricsCard />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SpikeCard />
          <GoalsCard />
          <WearableCard />
        </div>

        <TimelineSnapshot />
      </div>
    </DemoContext.Provider>
  )
}
