import { GlucoseMiniChart, MiniMetric, RecommendationCard, StabilityRing } from "@/components/phone-mockup-screen-core"

export function AppScreen() {
  const score = 78
  const gain = 7

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background px-4 pb-4 pt-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto w-full max-w-[230px]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Overview
            </p>
            <p className="mt-0.5 text-[14px] font-light text-foreground" style={{ fontFamily: "var(--font-serif, Georgia)" }}>
              Dashboard
            </p>
          </div>
          <div className="flex h-6 items-center gap-1.5 rounded-full border border-primary/10 bg-primary/[0.04] px-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[7px] font-medium text-primary">Live</span>
          </div>
        </div>

        <div className="mt-3 flex justify-center gap-1.5">
          {(["Today", "7D", "30D"] as const).map((value) => (
            <span
              key={value}
              className={`rounded-full px-2.5 py-1 text-[7px] ${
                value === "Today" ? "bg-primary/12 text-primary" : "bg-card text-muted-foreground"
              }`}
            >
              {value}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center">
          <StabilityRing score={score} />
        </div>

        <p className="mt-1 text-center text-[8px] text-primary">+{gain} projected</p>

        <div className="mt-3 flex justify-center gap-6">
          <MiniMetric label="Avg glucose" value="94" />
          <MiniMetric label="In range" value="93%" />
        </div>

        <div className="mt-4">
          <p className="text-[8px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Glucose Trend
          </p>
          <div className="mt-1.5 rounded-lg border border-border/50 bg-card p-2">
            <GlucoseMiniChart level={gain} />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[8px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Recommendations
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            <RecommendationCard text="12-min walk after dinner" points="+4 pts" active />
            <RecommendationCard text="Shift carbs earlier" points="+6 pts" active />
            <RecommendationCard text="Sleep +45 min" points="+3 pts" active={false} />
          </div>
        </div>
      </div>
    </div>
  )
}
