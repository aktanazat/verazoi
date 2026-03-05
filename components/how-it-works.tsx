"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"

function SyncGraphic() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" fill="none">
      <rect x="20" y="15" width="50" height="90" rx="10" stroke="currentColor" strokeWidth="1.5" className="text-primary/25" />
      <rect x="28" y="40" width="34" height="3" rx="1.5" className="fill-primary/15" />
      <rect x="28" y="48" width="24" height="3" rx="1.5" className="fill-primary/10" />
      <rect x="28" y="56" width="30" height="3" rx="1.5" className="fill-primary/12" />
      <circle cx="45" cy="28" r="4" className="fill-primary/20" />
      <rect x="130" y="15" width="50" height="90" rx="10" stroke="currentColor" strokeWidth="1.5" className="text-primary/25" />
      <circle cx="155" cy="50" r="16" stroke="currentColor" strokeWidth="1.5" className="text-primary/20" />
      <path d="M149 50 L153 54 L162 45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/40" />
      <path d="M80 55 L90 55 M90 55 L86 51 M90 55 L86 59" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/30" />
      <path d="M120 65 L110 65 M110 65 L114 61 M110 65 L114 69" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/30" />
      <circle cx="100" cy="60" r="3" className="fill-primary/15 animate-pulse" />
    </svg>
  )
}

function ScoreGraphic() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" fill="none">
      <circle cx="100" cy="58" r="38" stroke="currentColor" strokeWidth="1.5" className="text-primary/10" />
      <path
        d="M100 20 A38 38 0 1 1 66.1 78"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-primary/35"
      />
      <text x="100" y="55" textAnchor="middle" className="fill-primary/50" style={{ fontSize: "18px", fontWeight: 300 }}>78</text>
      <text x="100" y="68" textAnchor="middle" className="fill-primary/25" style={{ fontSize: "7px", letterSpacing: "0.1em" }}>STABILITY</text>
      <rect x="15" y="100" width="30" height="4" rx="2" className="fill-primary/10" />
      <rect x="50" y="100" width="20" height="4" rx="2" className="fill-primary/15" />
      <rect x="130" y="100" width="25" height="4" rx="2" className="fill-primary/10" />
      <rect x="160" y="100" width="20" height="4" rx="2" className="fill-primary/15" />
    </svg>
  )
}

function OptionsGraphic() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" fill="none">
      <rect x="25" y="12" width="150" height="26" rx="8" stroke="currentColor" strokeWidth="1" className="text-primary/20" />
      <circle cx="42" cy="25" r="6" className="fill-primary/15" />
      <rect x="55" y="21" width="60" height="3" rx="1.5" className="fill-primary/12" />
      <rect x="55" y="27" width="40" height="2.5" rx="1.25" className="fill-primary/8" />
      <rect x="134" y="20" width="28" height="10" rx="5" className="fill-primary/10" />
      <text x="148" y="27.5" textAnchor="middle" className="fill-primary/30" style={{ fontSize: "6px" }}>+4 pts</text>
      <rect x="25" y="46" width="150" height="26" rx="8" stroke="currentColor" strokeWidth="1.2" className="text-primary/30" fill="currentColor" fillOpacity="0.02" />
      <circle cx="42" cy="59" r="6" className="fill-primary/20" />
      <rect x="55" y="55" width="55" height="3" rx="1.5" className="fill-primary/15" />
      <rect x="55" y="61" width="35" height="2.5" rx="1.25" className="fill-primary/10" />
      <rect x="134" y="54" width="28" height="10" rx="5" className="fill-primary/15" />
      <text x="148" y="61.5" textAnchor="middle" className="fill-primary/40" style={{ fontSize: "6px" }}>+6 pts</text>
      <rect x="25" y="80" width="150" height="26" rx="8" stroke="currentColor" strokeWidth="1" className="text-primary/20" />
      <circle cx="42" cy="93" r="6" className="fill-primary/15" />
      <rect x="55" y="89" width="50" height="3" rx="1.5" className="fill-primary/12" />
      <rect x="55" y="95" width="30" height="2.5" rx="1.25" className="fill-primary/8" />
      <rect x="134" y="88" width="28" height="10" rx="5" className="fill-primary/10" />
      <text x="148" y="95.5" textAnchor="middle" className="fill-primary/30" style={{ fontSize: "6px" }}>+3 pts</text>
    </svg>
  )
}

function ImpactGraphic() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" fill="none">
      <path d="M20 90 L50 75 L80 80 L110 55 L140 45 L170 30 L185 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/35" />
      <path d="M20 90 L50 75 L80 80 L110 55 L140 45 L170 30 L185 25 L185 100 L20 100 Z" className="fill-primary/[0.06]" />
      <circle cx="110" cy="55" r="3.5" className="fill-primary/30" />
      <circle cx="170" cy="30" r="3.5" className="fill-primary/40" />
      <line x1="20" y1="100" x2="185" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-primary/15" />
      <line x1="20" y1="100" x2="20" y2="15" stroke="currentColor" strokeWidth="0.5" className="text-primary/15" />
      <text x="170" y="22" textAnchor="middle" className="fill-primary/35" style={{ fontSize: "7px" }}>+13</text>
      <line x1="110" y1="55" x2="170" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" className="text-primary/20" />
    </svg>
  )
}

const steps = [
  {
    number: "01",
    graphic: SyncGraphic,
    title: "Sync your data",
    description:
      "Connect your CGM and log simple lifestyle inputs -- sleep, meals, activity, stress. Everything Verazoi needs to start building your profile.",
  },
  {
    number: "02",
    graphic: ScoreGraphic,
    title: "Receive your Stability Score",
    description:
      "Your Stability Score is calculated by combining CGM glucose variability, trend consistency, lifestyle behavior patterns, and behavioral impact correlations.",
  },
  {
    number: "03",
    graphic: OptionsGraphic,
    title: "Explore personalized options",
    description:
      "Verazoi analyzes your patterns and presents 3-4 personalized recommendations. Add a 12-minute walk after dinner. Shift carbohydrate timing earlier.",
  },
  {
    number: "04",
    graphic: ImpactGraphic,
    title: "See projected impact",
    description:
      "Each recommendation shows an estimated improvement in your Stability Score before you implement it. You choose what fits your life.",
  },
]

export function HowItWorks() {
  const { ref, visible } = useScrollReveal(0.1)

  return (
    <section id="how-it-works" className="relative px-6 py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-primary/[0.05] blur-[120px]" />
        <div className="absolute -left-20 top-1/3 h-[400px] w-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />
      </div>

      <div ref={ref} className="mx-auto max-w-screen-lg">
        <div
          className={`text-center transition-all duration-700 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/70">
            How It Works
          </p>
          <h2 className="mx-auto mt-6 max-w-xl font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-balance">
            <span className="text-gradient">Four steps</span>{" "}
            <span className="text-foreground">to structured clarity</span>
          </h2>
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-2">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`card-premium gradient-border rounded-2xl bg-card/40 p-8 transition-all duration-700 ease-out ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${300 + i * 150}ms` }}
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/8 text-[11px] font-medium text-primary">
                  {step.number}
                </span>
              </div>

              <div className="mt-4 h-[100px]">
                <step.graphic />
              </div>

              <h3 className="mt-5 font-serif text-[22px] font-light text-foreground">
                {step.title}
              </h3>

              <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
