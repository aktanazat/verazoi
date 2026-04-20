"use client"

import { useState } from "react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

type AppPage = "dashboard" | "meals" | "glucose"

const pages: { id: AppPage; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "meals", label: "Meal Logging" },
  { id: "glucose", label: "Glucose Tracking" },
]

function StabilityRing({ score }: { score: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)

  return (
    <svg viewBox="0 0 140 140" className="h-[130px] w-[130px]">
      <defs>
        <linearGradient id="showcaseRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" className="[stop-color:var(--primary)]" />
          <stop offset="100%" className="[stop-color:var(--primary)]" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-primary/8" />
      <circle
        cx="70" cy="70" r={radius}
        fill="none" stroke="url(#showcaseRing)" strokeWidth="5" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="66" textAnchor="middle" dominantBaseline="middle" className="fill-current text-foreground" style={{ fontSize: "32px", fontWeight: 300, fontVariantNumeric: "tabular-nums" }}>
        {score}
      </text>
      <text x="70" y="84" textAnchor="middle" className="fill-current text-muted-foreground" style={{ fontSize: "8px", letterSpacing: "0.12em" }}>
        STABILITY
      </text>
    </svg>
  )
}

function DashboardShowcase() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
          <p className="mt-1 font-serif text-[20px] font-light text-foreground">Dashboard</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-medium text-primary">Live</span>
        </div>
      </div>

      <div className="flex items-center justify-center py-2">
        <StabilityRing score={78} />
      </div>
      <p className="text-center text-[11px] text-primary/70">+7 projected from your plan</p>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Avg glucose", value: "94" },
          { label: "In range", value: "93%" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-primary/10 bg-primary/[0.03] p-3 text-center">
            <p className="font-serif text-[18px] font-light text-foreground">{m.value}</p>
            <p className="mt-0.5 text-[9px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Recommendations</p>
        {[
          { text: "12-min walk after dinner", pts: "+4 pts", active: true },
          { text: "Shift carbs earlier by 1h", pts: "+6 pts", active: true },
          { text: "Add +45 min sleep target", pts: "+3 pts", active: false },
        ].map((r) => (
          <div key={r.text} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${r.active ? "border-primary/20 bg-primary/[0.05]" : "border-border/60 bg-card/50"}`}>
            <span className="text-[12px] text-foreground">{r.text}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${r.active ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground"}`}>{r.pts}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MealsShowcase() {
  const selectedFoods = ["Oatmeal", "Eggs", "Fruit"]

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Log</p>
        <p className="mt-1 font-serif text-[20px] font-light text-foreground">Meal Logging</p>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Meal type</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {["Breakfast", "Lunch", "Dinner", "Snack"].map((type) => (
            <div key={type} className={`border py-2 text-center text-[11px] tracking-[0.02em] transition-colors ${type === "Breakfast" ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"}`}>
              {type}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Quick add</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Oatmeal", "Eggs", "Toast", "Rice", "Chicken", "Salad", "Fruit", "Yogurt"].map((food) => (
            <span key={food} className={`border px-3 py-1.5 text-[11px] ${selectedFoods.includes(food) ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"}`}>
              {food}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4">
        <p className="text-[10px] uppercase tracking-[0.15em] text-primary/60">Personalized insight</p>
        <p className="mt-2 text-[13px] leading-relaxed text-foreground">
          Pairing oatmeal with eggs reduces your typical breakfast spike by ~18 mg/dL based on your last 14 days.
        </p>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Selected (3)</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedFoods.map((food) => (
            <span key={food} className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-[11px] text-primary">
              {food}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function GlucoseShowcase() {
  const readings = [
    { time: "7:30 AM", value: 92, trend: "stable" as const },
    { time: "9:15 AM", value: 134, trend: "up" as const },
    { time: "11:00 AM", value: 108, trend: "down" as const },
    { time: "1:30 PM", value: 96, trend: "stable" as const },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Log</p>
          <p className="mt-1 font-serif text-[20px] font-light text-foreground">Glucose</p>
        </div>
        <span className="text-[11px] text-muted-foreground/70">4 readings today</span>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
        <div className="flex items-end gap-3">
          <span className="font-serif text-[42px] font-light leading-none text-foreground">96</span>
          <span className="mb-1 text-[13px] text-muted-foreground">mg/dL</span>
        </div>
        <div className="mt-2 flex gap-2">
          {(["Fasting", "Pre-meal", "Post-meal"] as const).map((t) => (
            <span key={t} className={`border px-2.5 py-1 text-[10px] ${t === "Post-meal" ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"}`}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Today&apos;s readings</p>
        <div className="mt-2 divide-y divide-border/50">
          {readings.map((r) => (
            <div key={r.time} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-muted-foreground">{r.time}</span>
                <span className="font-serif text-[18px] font-light text-foreground">{r.value}</span>
              </div>
              <span className={`text-[10px] ${r.trend === "up" ? "text-amber-600/70" : r.trend === "down" ? "text-emerald-700/60" : "text-muted-foreground/60"}`}>
                {r.trend === "up" ? "Rising" : r.trend === "down" ? "Falling" : "Stable"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4">
        <p className="text-[10px] uppercase tracking-[0.15em] text-primary/60">Pattern detected</p>
        <p className="mt-2 text-[13px] leading-relaxed text-foreground">
          Your post-breakfast spike has decreased 12% this week. The earlier carb timing is working.
        </p>
      </div>
    </div>
  )
}

const showcaseComponents: Record<AppPage, () => JSX.Element> = {
  dashboard: DashboardShowcase,
  meals: MealsShowcase,
  glucose: GlucoseShowcase,
}

const descriptions: Record<AppPage, { title: string; body: string }> = {
  dashboard: {
    title: "Your metabolic command center",
    body: "See your Stability Score, glucose trends, and personalized recommendations at a glance. Every metric adapts to your unique patterns over time.",
  },
  meals: {
    title: "Logging that learns from you",
    body: "Quick-add foods you eat regularly and get personalized insights about how specific combinations affect your glucose. The more you log, the smarter it gets.",
  },
  glucose: {
    title: "Patterns, not just numbers",
    body: "Track readings with context -- timing, meals, activity. Verazoi detects patterns across days and weeks to surface trends you would not see from a single reading.",
  },
}

export function StartupFeatures() {
  const { ref, visible } = useScrollReveal(0.08)
  const [activePage, setActivePage] = useState<AppPage>("dashboard")

  const Showcase = showcaseComponents[activePage]
  const desc = descriptions[activePage]

  return (
    <section className="relative px-6 py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[140px]" />
      </div>

      <div ref={ref} className="mx-auto max-w-screen-lg">
        <div
          className={`text-center transition-all duration-700 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/70">
            Inside the App
          </p>
          <h2 className="mx-auto mt-6 max-w-xl font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-balance">
            <span className="text-gradient">Personalized</span>{" "}
            <span className="italic text-foreground">at every layer.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Every screen adapts to your data, your habits, and your goals.
          </p>
        </div>

        {/* Page tabs */}
        <div
          className={`mt-12 flex justify-center transition-all duration-700 delay-150 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <div className="flex items-center gap-1 rounded-full border border-primary/15 bg-card/70 p-1">
            {pages.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => setActivePage(page.id)}
                className={`rounded-full px-5 py-2 text-[12px] tracking-[0.02em] transition-colors ${
                  activePage === page.id ? "bg-primary/12 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {page.label}
              </button>
            ))}
          </div>
        </div>

        {/* Showcase */}
        <div
          className={`mt-10 transition-all duration-700 delay-250 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
            {/* Description panel */}
            <div className="flex flex-col justify-center">
              <h3 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-light leading-[1.15] text-foreground">
                {desc.title}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                {desc.body}
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary/40" />
                <p className="text-[13px] italic text-primary/60">
                  {activePage === "dashboard"
                    ? "Recommendations are generated from your personal patterns"
                    : activePage === "meals"
                      ? "Food insights are based on your glucose response history"
                      : "Trend detection uses 7-30 day rolling analysis"
                  }
                </p>
              </div>
            </div>

            {/* App screen mockup */}
            <div className="gradient-border card-premium rounded-3xl bg-card/40 p-6 md:p-8">
              <Showcase />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
