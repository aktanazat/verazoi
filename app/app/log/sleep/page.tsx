"use client"

import { useState } from "react"
import { useAppData } from "@/contexts/app-data-context"

export default function SleepLogPage() {
  const { state, addSleep } = useAppData()
  const [sleepHours, setSleepHours] = useState("")
  const [sleepQuality, setSleepQuality] = useState<"poor" | "fair" | "good" | "great">("good")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!sleepHours || saving) return
    setSaving(true)
    await addSleep(Number(sleepHours), sleepQuality)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setSleepHours("") }, 2000)
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={!sleepHours || saving}
          className="border border-foreground bg-foreground px-6 py-2 text-[12px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85 disabled:opacity-30"
        >
          {saved ? "Saved" : saving ? "..." : "Save sleep"}
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="border border-border p-6">
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Hours slept</p>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="number"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent font-serif text-[32px] font-light leading-none text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
            <span className="shrink-0 text-[14px] text-muted-foreground">hours</span>
          </div>

          <div className="mt-5">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Quality</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {(["poor", "fair", "good", "great"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setSleepQuality(q)}
                  className={`border py-2.5 text-[12px] capitalize tracking-[0.04em] transition-colors ${
                    sleepQuality === q
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-border p-6">
          <div className="flex items-center justify-between">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Recent sleep</p>
            <p className="text-[12px] text-muted-foreground/80">
              {state.timeline.filter((e) => e.type === "sleep").length} logged
            </p>
          </div>
          <div className="mt-4">
            {state.timeline.filter((e) => e.type === "sleep").length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <p className="text-[13px] text-muted-foreground/60">No sleep logged</p>
                <p className="mt-1.5 text-[12px] text-muted-foreground/40">Log your sleep to track rest and recovery.</p>
              </div>
            ) : (
              state.timeline.filter((e) => e.type === "sleep").map((e, i) => (
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
