"use client"

import { AlertTriangle, ChevronRight, Minus } from "lucide-react"
import { useAppData } from "@/contexts/app-data-context"

const impactColors: Record<string, string> = {
  high: "bg-amber-800/10 text-amber-800",
  moderate: "bg-foreground/5 text-foreground/70",
  low: "bg-foreground/5 text-foreground/50",
}

export function SpikeRisk() {
  const { state } = useAppData()
  const riskPercent = Math.round(state.spikeRisk * 100)
  const factors = state.spikeFactors

  const riskLabel = riskPercent >= 60 ? "Elevated" : riskPercent >= 40 ? "Moderate" : "Low"

  return (
    <div className="border border-border p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
            Spike Risk
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground/80">
            Next 4 hours
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {riskPercent >= 40 ? (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-700/70" strokeWidth={2} />
          ) : (
            <Minus className="h-3.5 w-3.5 text-muted-foreground/60" strokeWidth={2} />
          )}
          <span className="text-[13px] font-medium text-foreground">{riskLabel}</span>
        </div>
      </div>

      <div className="mt-5 border border-border bg-secondary/50 p-4">
        <p className="text-[13px] leading-relaxed text-foreground/80">
          {"Based on your patterns, there's a "}
          <span className="font-medium text-foreground">{riskPercent}% chance</span>
          {" of a glucose spike above 140 mg/dL in the next 4 hours."}
        </p>
      </div>

      {factors.length > 0 && (
        <div className="mt-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
            Contributing Factors
          </p>

          <div className="mt-4 flex flex-col">
            {factors.map((factor, i) => (
              <details
                key={i}
                className="group border-b border-border last:border-0"
              >
                <summary className="flex cursor-pointer items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${
                        impactColors[factor.impact] ?? impactColors.moderate
                      }`}
                    >
                      {factor.impact}
                    </span>
                    <span className="text-[13px] text-foreground">{factor.label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform group-open:rotate-90" strokeWidth={1.5} />
                </summary>
              </details>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 border-t border-border pt-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
          Suggestion
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-foreground/80">
          A 15-minute walk now could reduce your spike risk by an estimated 30%.
        </p>
      </div>
    </div>
  )
}
