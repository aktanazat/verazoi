const levers = [
  { label: "Post-dinner walk", value: "15 min", width: "50%" },
  { label: "Shift carbs earlier", value: "1.5 hrs", width: "50%" },
  { label: "Extra sleep", value: "45 min", width: "50%" },
]

function StaticScoreRing() {
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const score = 78
  const offset = circumference * (1 - score / 100)

  return (
    <div className="flex shrink-0 flex-col items-center">
      <svg viewBox="0 0 120 120" className="h-[140px] w-[140px]">
        <defs>
          <linearGradient id="demoRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" className="[stop-color:var(--primary)]" />
            <stop offset="100%" className="[stop-color:var(--primary)]" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-primary/8" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#demoRing)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
        <text
          x="60"
          y="58"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-current text-foreground"
          style={{ fontSize: "28px", fontWeight: 300, fontVariantNumeric: "tabular-nums" }}
        >
          {score}
        </text>
        <text
          x="60"
          y="75"
          textAnchor="middle"
          className="fill-current text-muted-foreground"
          style={{ fontSize: "8px", letterSpacing: "0.12em" }}
        >
          STABILITY
        </text>
      </svg>
      <span className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[12px] font-medium text-primary">
        +10 points
      </span>
    </div>
  )
}

export function ScoreDemo() {
  return (
    <section className="relative px-6 py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.03] blur-[120px]" />
      </div>

      <div className="mx-auto max-w-screen-lg">
        <div className="text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/60">
            Score Model
          </p>
          <h2 className="mx-auto mt-6 max-w-lg text-balance font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-foreground">
            See how habits move the score.
          </h2>
        </div>

        <div className="mx-auto mt-16 max-w-2xl">
          <div className="gradient-border rounded-3xl bg-card/50 p-8 md:p-10">
            <div className="flex flex-col items-center gap-10 md:flex-row md:gap-12">
              <StaticScoreRing />

              <div className="flex w-full flex-col gap-6">
                {levers.map((lever) => (
                  <div key={lever.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[13px] text-foreground">{lever.label}</span>
                      <span className="text-[13px] font-medium tabular-nums text-primary">
                        {lever.value}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-border">
                      <div className="h-1 rounded-full bg-primary" style={{ width: lever.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-center text-[12px] text-muted-foreground/40">
              Illustrative example. Actual scores are calculated from your personal data.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
