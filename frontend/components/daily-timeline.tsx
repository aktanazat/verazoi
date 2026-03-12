"use client"

import { Droplets, Utensils, Footprints, Moon } from "lucide-react"
import { useAppData } from "@/contexts/app-data-context"

const iconMap = {
  glucose: Droplets,
  meal: Utensils,
  activity: Footprints,
  sleep: Moon,
}

export function DailyTimeline() {
  const { state } = useAppData()
  const events = state.timeline

  return (
    <div className="border border-border p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
            {"Today's Log"}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground/80">
            {events.length} entries
          </p>
        </div>
      </div>

      <div className="mt-6">
        {events.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-[13px] text-muted-foreground/60">No entries yet</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground/40">
              Log glucose, meals, activity, or sleep to see your day here.
            </p>
          </div>
        ) : (
          events.map((event, i) => {
            const Icon = iconMap[event.type]
            return (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 items-center justify-center border border-border">
                    <Icon className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  {i < events.length - 1 && (
                    <div className="w-px flex-1 bg-border" />
                  )}
                </div>

                <div className={`flex-1 ${i < events.length - 1 ? "pb-3" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[13px] text-foreground">{event.label}</p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{event.value}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground/70">{event.time}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
