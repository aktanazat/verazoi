"use client"

import { StabilityScore } from "@/components/stability-score"
import { SpikeRisk } from "@/components/spike-risk"
import { GoalProgress } from "@/components/goal-progress"
import { DailyTimeline } from "@/components/daily-timeline"
import { WearableDevice } from "@/components/wearable-device"
import { ExportButton } from "@/components/export-button"

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Overview
          </p>
          <h1 className="mt-3 font-serif text-[28px] font-light text-foreground">
            Dashboard
          </h1>
        </div>
        <ExportButton />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <StabilityScore />
        <SpikeRisk />
        <GoalProgress />
        <div className="md:col-span-2">
          <DailyTimeline />
        </div>
        <div className="md:col-span-2">
          <WearableDevice />
        </div>
      </div>
    </div>
  )
}
