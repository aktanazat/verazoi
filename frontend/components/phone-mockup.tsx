"use client"

import { useMemo, useState } from "react"
import {
  GlucoseMiniChart,
  MiniMetric,
  RecommendationCard,
  StabilityRing,
  clamp,
  screenTabs,
  type Screen,
  type Timeframe,
} from "@/components/phone-mockup-screen-core"

function DashboardScreen({
  score,
  gain,
  avgGlucose,
  inRange,
  timeframe,
  onTimeframeChange,
  walkEnabled,
  carbEnabled,
  sleepEnabled,
  walkMinutes,
  carbShiftHours,
}: {
  score: number
  gain: number
  avgGlucose: number
  inRange: number
  timeframe: Timeframe
  onTimeframeChange: (value: Timeframe) => void
  walkEnabled: boolean
  carbEnabled: boolean
  sleepEnabled: boolean
  walkMinutes: number
  carbShiftHours: number
}) {
  return (
    <>
      <div className="mt-3 flex justify-center gap-1.5">
        {(["Today", "7D", "30D"] as Timeframe[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onTimeframeChange(value)}
            className={`rounded-full px-2.5 py-1 text-[7px] transition-colors ${
              value === timeframe ? "bg-primary/12 text-primary" : "bg-card text-muted-foreground"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center">
        <StabilityRing score={score} />
      </div>

      <p className="mt-1 text-center text-[8px] text-primary">+{gain} projected</p>

      <div className="mt-3 flex justify-center gap-6">
        <MiniMetric label="Avg glucose" value={String(avgGlucose)} />
        <MiniMetric label="In range" value={`${inRange}%`} />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-[8px] font-medium uppercase tracking-[0.15em] text-muted-foreground">Glucose Trend</p>
          <span className="text-[7px] tabular-nums text-muted-foreground/70">{timeframe}</span>
        </div>
        <div className="mt-1.5 rounded-lg border border-border/50 bg-card p-2">
          <GlucoseMiniChart
            timeframe={timeframe}
            gain={gain}
            walkEnabled={walkEnabled}
            carbEnabled={carbEnabled}
            sleepEnabled={sleepEnabled}
            walkMinutes={walkMinutes}
            carbShiftHours={carbShiftHours}
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[8px] font-medium uppercase tracking-[0.15em] text-muted-foreground">Recommendations</p>
        <div className="mt-2 flex flex-col gap-1.5">
          <RecommendationCard text="12-min walk after dinner" points="+4 pts" active={walkEnabled} />
          <RecommendationCard text="Shift carbs earlier" points="+6 pts" active={carbEnabled} />
          <RecommendationCard text="Sleep +45 min" points="+3 pts" active={sleepEnabled} />
        </div>
      </div>
    </>
  )
}

function TimelineScreen({
  carbShiftHours,
  walkMinutes,
  onCarbShiftChange,
  onWalkChange,
  breakfastPeak,
  dinnerPeak,
  overnightAvg,
}: {
  carbShiftHours: number
  walkMinutes: number
  onCarbShiftChange: (value: number) => void
  onWalkChange: (value: number) => void
  breakfastPeak: number
  dinnerPeak: number
  overnightAvg: number
}) {
  const carbPercent = (carbShiftHours / 3) * 100
  const walkPercent = (walkMinutes / 30) * 100

  return (
    <div className="mt-2 flex h-full flex-col items-center">
      <p className="text-center text-[8px] font-medium uppercase tracking-[0.15em] text-muted-foreground">What-if Controls</p>
      <div className="mt-3 w-full space-y-3">
        <label className="block rounded-lg border border-border/60 bg-card/60 px-3 py-2.5">
          <div className="mb-1 flex items-center justify-between text-[8px] text-foreground">
            <span>Shift carbs earlier</span>
            <span className="tabular-nums text-primary transition-all duration-200">{carbShiftHours.toFixed(1)}h</span>
          </div>
          <input
            type="range"
            min={0}
            max={3}
            step={0.5}
            value={carbShiftHours}
            onChange={(event) => onCarbShiftChange(parseFloat(event.target.value))}
            className="w-full cursor-pointer accent-primary"
            style={{
              background: `linear-gradient(to right, oklch(0.42 0.14 280) ${carbPercent}%, oklch(0.88 0.02 280) ${carbPercent}%)`,
              borderRadius: "9999px",
              height: "4px",
            }}
          />
        </label>
        <label className="block rounded-lg border border-border/60 bg-card/60 px-3 py-2.5">
          <div className="mb-1 flex items-center justify-between text-[8px] text-foreground">
            <span>Post-dinner walk</span>
            <span className="tabular-nums text-primary transition-all duration-200">{walkMinutes} min</span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            step={5}
            value={walkMinutes}
            onChange={(event) => onWalkChange(parseInt(event.target.value, 10))}
            className="w-full cursor-pointer accent-primary"
            style={{
              background: `linear-gradient(to right, oklch(0.42 0.14 280) ${walkPercent}%, oklch(0.88 0.02 280) ${walkPercent}%)`,
              borderRadius: "9999px",
              height: "4px",
            }}
          />
        </label>
      </div>

      <div className="mt-4 w-full space-y-2 rounded-xl border border-border/60 bg-card/70 p-3">
        <div className="flex items-center justify-between text-[8px]">
          <span className="text-muted-foreground">Breakfast peak</span>
          <span className="tabular-nums text-foreground">{breakfastPeak} mg/dL</span>
        </div>
        <div className="h-1 rounded-full bg-border">
          <div className="h-1 rounded-full bg-primary/70 transition-all duration-300" style={{ width: `${(breakfastPeak / 180) * 100}%` }} />
        </div>
        <div className="flex items-center justify-between text-[8px]">
          <span className="text-muted-foreground">Dinner peak</span>
          <span className="tabular-nums text-foreground">{dinnerPeak} mg/dL</span>
        </div>
        <div className="h-1 rounded-full bg-border">
          <div className="h-1 rounded-full bg-primary/70 transition-all duration-300" style={{ width: `${(dinnerPeak / 180) * 100}%` }} />
        </div>
        <div className="flex items-center justify-between text-[8px]">
          <span className="text-muted-foreground">Overnight avg</span>
          <span className="tabular-nums text-foreground">{overnightAvg} mg/dL</span>
        </div>
      </div>
    </div>
  )
}

function PlanToggle({
  label,
  points,
  active,
  onToggle,
}: {
  label: string
  points: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors ${
        active ? "border-primary/30 bg-primary/[0.07]" : "border-border/60 bg-card/50"
      }`}
    >
      <span className="text-[9px] text-foreground">{label}</span>
      <span className={`rounded-full px-2 py-0.5 text-[8px] ${active ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground"}`}>
        {points}
      </span>
    </button>
  )
}

function PlanScreen({
  walkEnabled,
  carbEnabled,
  sleepEnabled,
  onToggleWalk,
  onToggleCarb,
  onToggleSleep,
  projectedScore,
}: {
  walkEnabled: boolean
  carbEnabled: boolean
  sleepEnabled: boolean
  onToggleWalk: () => void
  onToggleCarb: () => void
  onToggleSleep: () => void
  projectedScore: number
}) {
  return (
    <div className="mt-4 flex h-full flex-col">
      <p className="text-[8px] font-medium uppercase tracking-[0.15em] text-muted-foreground">Intervention Plan</p>
      <div className="mt-2 space-y-1.5">
        <PlanToggle label="12-min walk after dinner" points="+4 pts" active={walkEnabled} onToggle={onToggleWalk} />
        <PlanToggle label="Shift carbs earlier by 1h" points="+6 pts" active={carbEnabled} onToggle={onToggleCarb} />
        <PlanToggle label="Add +45 min sleep target" points="+3 pts" active={sleepEnabled} onToggle={onToggleSleep} />
      </div>

      <div className="mt-4 rounded-xl border border-border/60 bg-card/70 p-3">
        <p className="text-[8px] uppercase tracking-[0.14em] text-muted-foreground">Projected stability</p>
        <p className="mt-1 font-serif text-[22px] leading-none text-foreground">{projectedScore}</p>
        <p className="mt-1 text-[8px] text-muted-foreground">Tap recommendations to model different plans.</p>
      </div>
    </div>
  )
}

function InteractiveAppScreen() {
  const [activeScreen, setActiveScreen] = useState<Screen>("dashboard")
  const [timeframe, setTimeframe] = useState<Timeframe>("Today")
  const [walkMinutes, setWalkMinutes] = useState(10)
  const [carbShiftHours, setCarbShiftHours] = useState(1)
  const [walkEnabled, setWalkEnabled] = useState(true)
  const [carbEnabled, setCarbEnabled] = useState(true)
  const [sleepEnabled, setSleepEnabled] = useState(false)

  const baseScore = timeframe === "Today" ? 74 : timeframe === "7D" ? 72 : 70
  const walkGain = walkEnabled ? (walkMinutes / 10) * 2 : 0
  const carbGain = carbEnabled ? carbShiftHours * 2.5 : 0
  const sleepGain = sleepEnabled ? 3 : 0
  const gain = Math.round(walkGain + carbGain + sleepGain)
  const score = clamp(baseScore + gain, 55, 99)

  const avgGlucose = clamp(96 - Math.round(gain * 0.8), 82, 110)
  const inRange = clamp(91 + Math.round(gain * 0.7), 88, 99)

  const timelineMetrics = useMemo(() => {
    const breakfastPeak = clamp(144 - (carbEnabled ? carbShiftHours * 7 : 0), 112, 150)
    const dinnerPeak = clamp(169 - (walkEnabled ? (walkMinutes / 5) * 3 : 0), 124, 172)
    const overnightAvg = clamp(112 - (sleepEnabled ? 4 : 0), 98, 120)
    return { breakfastPeak, dinnerPeak, overnightAvg }
  }, [carbEnabled, carbShiftHours, sleepEnabled, walkEnabled, walkMinutes])

  return (
    <div
      className="flex h-full flex-col overflow-y-auto bg-background px-4 pb-4 pt-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      style={{ touchAction: "pan-y" }}
    >
      <div className="mx-auto w-full max-w-[230px]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
            <p className="mt-0.5 text-[14px] font-light text-foreground" style={{ fontFamily: "var(--font-serif, Georgia)" }}>
              Dashboard
            </p>
          </div>
          <div className="flex h-6 items-center gap-1.5 rounded-full border border-primary/10 bg-primary/[0.04] px-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[7px] font-medium text-primary">Live</span>
          </div>
        </div>

        <div className="mt-4 rounded-full border border-border/60 bg-card/80 p-1">
          <div className="grid grid-cols-3 gap-1">
            {screenTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveScreen(tab.id)}
                className={`rounded-full px-2 py-1.5 text-center text-[8px] font-medium tracking-[0.02em] transition-colors ${
                  activeScreen === tab.id ? "bg-primary/12 text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex-1">
          {activeScreen === "dashboard" ? (
            <DashboardScreen
              score={score}
              gain={gain}
              avgGlucose={avgGlucose}
              inRange={inRange}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              walkEnabled={walkEnabled}
              carbEnabled={carbEnabled}
              sleepEnabled={sleepEnabled}
              walkMinutes={walkMinutes}
              carbShiftHours={carbShiftHours}
            />
          ) : activeScreen === "timeline" ? (
            <TimelineScreen
              carbShiftHours={carbShiftHours}
              walkMinutes={walkMinutes}
              onCarbShiftChange={setCarbShiftHours}
              onWalkChange={setWalkMinutes}
              breakfastPeak={timelineMetrics.breakfastPeak}
              dinnerPeak={timelineMetrics.dinnerPeak}
              overnightAvg={timelineMetrics.overnightAvg}
            />
          ) : (
            <PlanScreen
              walkEnabled={walkEnabled}
              carbEnabled={carbEnabled}
              sleepEnabled={sleepEnabled}
              onToggleWalk={() => setWalkEnabled((value) => !value)}
              onToggleCarb={() => setCarbEnabled((value) => !value)}
              onToggleSleep={() => setSleepEnabled((value) => !value)}
              projectedScore={score}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function PhoneMockup() {
  const [tilt, setTilt] = useState({ x: 2, y: -4 })
  const [hovered, setHovered] = useState(false)

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return
    const rect = event.currentTarget.getBoundingClientRect()
    const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const ny = ((event.clientY - rect.top) / rect.height - 0.5) * -2
    setTilt({
      x: clamp(2 + ny * 8, -8, 10),
      y: clamp(-4 + nx * 12, -14, 14),
    })
  }

  const handlePointerEnter = () => setHovered(true)
  const handlePointerLeave = () => {
    setHovered(false)
    setTilt({ x: 2, y: -4 })
  }

  return (
    <section id="overview" className="relative overflow-hidden px-6 py-12 lg:py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[160px]" />
      </div>
      <div className="relative mx-auto max-w-screen-lg">
        <div className="flex flex-col items-center">
          <div
            className="relative isolate"
            style={{ perspective: "1400px" }}
            onPointerMove={handlePointerMove}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
          >
            <div
              className={`relative z-10 [transform-style:preserve-3d] ${
                hovered ? "transition-transform duration-150 ease-out" : "transition-transform duration-700 ease-out"
              }`}
              style={{
                transform: `rotateY(${tilt.y}deg) rotateX(${tilt.x}deg) scale(${hovered ? 1.015 : 1})`,
              }}
            >
              <div
                className="relative w-[280px] rounded-[44px] bg-gradient-to-b from-foreground/95 to-foreground/85 p-[6px] shadow-[0_24px_90px_-26px_var(--primary),0_0_0_1px_rgba(0,0,0,0.1)]"
                style={{ transform: "translateZ(24px)" }}
              >
                <div
                  className="absolute left-1/2 top-3 z-10 h-[22px] w-[80px] -translate-x-1/2 rounded-full bg-black"
                  style={{ transform: "translateZ(34px)" }}
                />

                <div
                  className="relative h-[580px] overflow-hidden rounded-[38px] bg-background shadow-inner"
                  style={{ transform: "translateZ(16px)" }}
                >
                  <InteractiveAppScreen />
                </div>

                <div
                  className="absolute bottom-2 left-1/2 h-[4px] w-[100px] -translate-x-1/2 rounded-full bg-foreground/20"
                  style={{ transform: "translateZ(28px)" }}
                />
              </div>

              <div
                className="pointer-events-none absolute inset-[6px] rounded-[38px] bg-gradient-to-br from-white/12 via-transparent to-transparent"
                style={{ transform: "translateZ(42px)" }}
              />
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[13px] text-muted-foreground">
              Tap through the <span className="text-primary">Dashboard</span>, <span className="text-primary">Timeline</span>, and <span className="text-primary">Plan</span> tabs above
            </p>
            <p className="mt-2 text-[12px] italic text-primary/50">
              Every recommendation is generated from your personal glucose patterns
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
