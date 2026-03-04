"use client"

import { StabilityScore } from "@/components/stability-score"
import { SpikeRisk } from "@/components/spike-risk"
import { DailyTimeline } from "@/components/daily-timeline"

export default function DashboardPage() {
  return (
    <div>
      <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Overview
      </p>
      <h1 className="mt-3 font-serif text-[28px] font-light text-foreground">
        Dashboard
      </h1>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <StabilityScore />
        <SpikeRisk />
        <div className="md:col-span-2">
          <DailyTimeline />
        </div>
      </div>
    </div>
  )
}
