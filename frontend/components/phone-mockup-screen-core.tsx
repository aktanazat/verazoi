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

export function GlucoseMiniChart({ level }: { level: number }) {
  const path =
    level >= 9
      ? "M0,29 C15,28 25,24 40,22 C55,20 65,24 80,25 C95,26 105,18 120,16 C135,14 145,20 160,22 C175,24 185,20 200,19"
      : level >= 5
        ? "M0,30 C15,28 25,20 40,18 C55,16 65,25 80,27 C95,29 105,15 120,12 C135,9 145,22 160,25 C175,28 185,20 200,18"
        : "M0,32 C15,30 25,18 40,15 C55,12 65,28 80,31 C95,34 105,14 120,10 C135,6 145,24 160,29 C175,33 185,18 200,14"

  return (
    <svg viewBox="0 0 200 50" className="h-[40px] w-full">
      <defs>
        <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="[stop-color:var(--primary)]" stopOpacity="0.12" />
          <stop offset="100%" className="[stop-color:var(--primary)]" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-primary/50"
      />
      <path
        d={`${path} L200,50 L0,50 Z`}
        fill="url(#glucoseGrad)"
      />
    </svg>
  )
}
