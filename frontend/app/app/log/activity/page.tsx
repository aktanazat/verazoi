"use client"

import { useState } from "react"
import { useAppData } from "@/contexts/app-data-context"

const activityTypes = [
  "Walking", "Running", "Cycling", "Weights", "Yoga", "Swimming", "HIIT", "Other",
] as const

const intensities = ["Light", "Moderate", "Intense"] as const

export default function ActivityLogPage() {
  const { state, addActivity } = useAppData()
  const [actType, setActType] = useState<string>("Walking")
  const [duration, setDuration] = useState("")
  const [intensity, setIntensity] = useState<string>("Moderate")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!duration || saving) return
    setSaving(true)
    await addActivity(actType, Number(duration), intensity)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setDuration("") }, 2000)
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={!duration || saving}
          className="border border-foreground bg-foreground px-6 py-2 text-[12px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85 disabled:opacity-30"
        >
          {saved ? "Saved" : saving ? "..." : "Save activity"}
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="border border-border p-6">
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Type</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {activityTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActType(type)}
                className={`border px-3.5 py-2 text-[12px] tracking-[0.02em] transition-colors ${
                  actType === type
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Duration</p>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent font-serif text-[32px] font-light leading-none text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
              <span className="shrink-0 text-[14px] text-muted-foreground">minutes</span>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Intensity</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {intensities.map((i) => (
                <button
                  key={i}
                  onClick={() => setIntensity(i)}
                  className={`border py-2.5 text-[12px] tracking-[0.04em] transition-colors ${
                    intensity === i
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-border p-6">
          <div className="flex items-center justify-between">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Recent activity</p>
            <p className="text-[12px] text-muted-foreground/80">
              {state.timeline.filter((e) => e.type === "activity").length} logged
            </p>
          </div>
          <div className="mt-4">
            {state.timeline.filter((e) => e.type === "activity").length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <p className="text-[13px] text-muted-foreground/60">No activity logged</p>
                <p className="mt-1.5 text-[12px] text-muted-foreground/40">Log a walk, run, or workout to track your movement.</p>
              </div>
            ) : (
              state.timeline.filter((e) => e.type === "activity").map((e, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                  <div>
                    <p className="text-[13px] text-foreground">{e.label}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{e.value}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground/70">{e.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
