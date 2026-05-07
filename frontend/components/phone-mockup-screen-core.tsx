export type Screen = "dashboard" | "timeline" | "plan"
export type Timeframe = "Today" | "7D" | "30D"

export const screenTabs: { id: Screen; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "timeline", label: "Timeline" },
  { id: "plan", label: "Plan" },
]

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function StabilityRing({ score }: { score: number }) {
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const progress = score / 100
  const offset = circumference * (1 - progress)

  return (
    <svg viewBox="0 0 100 100" className="h-[100px] w-[100px]">
      <defs>
        <linearGradient id="ringGradPhone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" className="[stop-color:var(--primary)]" />
          <stop offset="100%" className="[stop-color:var(--primary)]" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-primary/8"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="url(#ringGradPhone)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
      />
      <g>
      <text
        x="50"
        y="48"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-current text-foreground"
        style={{ fontSize: "18px", fontWeight: 300, fontVariantNumeric: "tabular-nums" }}
      >
        {score}
      </text>
      <text
        x="50"
        y="60"
        textAnchor="middle"
        className="fill-current text-muted-foreground"
        style={{ fontSize: "6px", letterSpacing: "0.08em" }}
      >
        STABILITY
      </text>
    </g>
    </svg>
  )
}

export function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[11px] font-medium text-foreground">{value}</span>
      <span className="text-[8px] text-muted-foreground">{label}</span>
    </div>
  )
}

export function RecommendationCard({
  text,
  points,
  active,
}: {
  text: string
  points: string
  active: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
        active ? "border-primary/[0.1] bg-primary/[0.05]" : "border-border/60 bg-card/50"
      }`}
    >
      <span className="text-[9px] leading-tight text-foreground">{text}</span>
      <span
        className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[8px] font-medium ${
          active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {points}
      </span>
    </div>
  )
}

export type GlucoseChartInput = {
  timeframe: Timeframe
  gain: number
  walkEnabled: boolean
  carbEnabled: boolean
  sleepEnabled: boolean
  walkMinutes: number
  carbShiftHours: number
}

function seededRand(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

function buildGlucosePath({
  timeframe,
  gain,
  walkEnabled,
  carbEnabled,
  sleepEnabled,
  walkMinutes,
  carbShiftHours,
}: GlucoseChartInput) {
  const samples = timeframe === "Today" ? 28 : timeframe === "7D" ? 22 : 16
  const seed =
    1 +
    (timeframe === "Today" ? 11 : timeframe === "7D" ? 23 : 41) +
    (walkEnabled ? 7 : 0) +
    (carbEnabled ? 13 : 0) +
    (sleepEnabled ? 19 : 0) +
    Math.round(walkMinutes) * 3 +
    Math.round(carbShiftHours * 2) * 5
  const rand = seededRand(seed)

  const baseline = clamp(30 - gain * 0.6, 14, 34)
  const volatility =
    timeframe === "Today" ? 14 : timeframe === "7D" ? 9 : 5
  const dampen = (walkEnabled ? 0.15 : 0) + (carbEnabled ? 0.18 : 0) + (sleepEnabled ? 0.1 : 0)
  const swing = volatility * (1 - dampen)

  const ys: number[] = []
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1)
    const morning = Math.sin(t * Math.PI * 2 - 0.6) * (carbEnabled ? 0.5 : 1)
    const dinner = Math.sin(t * Math.PI * 2 + 1.6) * (walkEnabled ? 0.45 : 1)
    const overnight = Math.cos(t * Math.PI * 4) * 0.25 * (sleepEnabled ? 0.4 : 1)
    const noise = (rand() - 0.5) * 0.6
    const value = baseline - swing * 0.55 * morning - swing * 0.6 * dinner + swing * overnight + noise * swing
    ys.push(clamp(value, 4, 44))
  }

  const stepX = 200 / (samples - 1)
  let d = `M0,${ys[0].toFixed(2)}`
  for (let i = 1; i < samples; i++) {
    const px = (i - 1) * stepX
    const cx = px + stepX / 2
    const x = i * stepX
    const py = ys[i - 1]
    const y = ys[i]
    d += ` C${cx.toFixed(2)},${py.toFixed(2)} ${cx.toFixed(2)},${y.toFixed(2)} ${x.toFixed(2)},${y.toFixed(2)}`
  }
  return d
}

export function GlucoseMiniChart(props: GlucoseChartInput) {
  const path = buildGlucosePath(props)
  return (
    <svg viewBox="0 0 200 50" className="h-[40px] w-full">
      <defs>
        <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="[stop-color:var(--primary)]" stopOpacity="0.18" />
          <stop offset="100%" className="[stop-color:var(--primary)]" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary/60 transition-[d] duration-500 ease-out"
        style={{ transition: "d 0.5s ease-out" }}
      />
      <path d={`${path} L200,50 L0,50 Z`} fill="url(#glucoseGrad)" />
    </svg>
  )
}
