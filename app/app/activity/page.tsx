"use client"

import { useState } from "react"
import { Moon, Footprints } from "lucide-react"
import { useAppData } from "@/contexts/app-data-context"

const activityTypes = [
  "Walking", "Running", "Cycling", "Weights", "Yoga", "Swimming", "HIIT", "Other",
] as const

const intensities = ["Light", "Moderate", "Intense"] as const

export default function ActivityPage() {
  const { dispatch } = useAppData()
  const [tab, setTab] = useState<"activity" | "sleep">("activity")

  const [actType, setActType] = useState<string>("Walking")
  const [duration, setDuration] = useState("")
  const [intensity, setIntensity] = useState<string>("Moderate")

  const [sleepHours, setSleepHours] = useState("")
  const [sleepQuality, setSleepQuality] = useState<"poor" | "fair" | "good" | "great">("good")

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (tab === "activity") {
      dispatch({
        type: "addActivity",
        payload: {
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          activityType: actType,
          duration: Number(duration),
          intensity,
        },
      })
    } else {
      dispatch({
        type: "addSleep",
        payload: {
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          hours: Number(sleepHours),
          quality: sleepQuality,
        },
      })
    }
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      if (tab === "activity") setDuration("")
      else setSleepHours("")
    }, 2000)
  }

  return (
    <div className="flex flex-1 flex-col">
      <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Log
      </p>
      <h1 className="mt-3 font-serif text-[28px] font-light text-foreground">
        {"Activity & Sleep"}
      </h1>

      <div className="mt-6 grid grid-cols-2 border border-border">
        <button
          onClick={() => setTab("activity")}
          className={`flex items-center justify-center gap-2 py-3 text-[13px] tracking-[0.02em] transition-colors ${
            tab === "activity"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Footprints className="h-4 w-4" strokeWidth={1.5} />
          Activity
        </button>
        <button
          onClick={() => setTab("sleep")}
          className={`flex items-center justify-center gap-2 py-3 text-[13px] tracking-[0.02em] transition-colors ${
            tab === "sleep"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Moon className="h-4 w-4" strokeWidth={1.5} />
          Sleep
        </button>
      </div>

      <div className="relative mt-6 flex-1 border border-border p-5">
        <div
          className={`transition-opacity duration-200 ${tab === "activity" ? "opacity-100" : "pointer-events-none absolute inset-0 p-5 opacity-0"}`}
        >
          <div>
            <label className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
              Type
            </label>
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
          </div>

          <div className="mt-5">
            <label className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
              Duration
            </label>
            <div className="mt-2 flex items-baseline gap-2">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent font-serif text-[32px] font-light text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
              <span className="text-[14px] text-muted-foreground">minutes</span>
            </div>
          </div>

          <div className="mt-5">
            <label className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
              Intensity
            </label>
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

        <div
          className={`transition-opacity duration-200 ${tab === "sleep" ? "opacity-100" : "pointer-events-none absolute inset-0 p-5 opacity-0"}`}
        >
          <div>
            <label className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
              Hours slept
            </label>
            <div className="mt-2 flex items-baseline gap-2">
              <input
                type="number"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent font-serif text-[32px] font-light text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
              <span className="text-[14px] text-muted-foreground">hours</span>
            </div>
          </div>

          <div className="mt-5">
            <label className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
              Quality
            </label>
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
      </div>

      <button
        onClick={handleSave}
        disabled={tab === "activity" ? !duration : !sleepHours}
        className="mt-6 w-full bg-foreground py-3.5 text-[13px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85 disabled:opacity-30"
      >
        {saved ? "Saved" : tab === "activity" ? "Save activity" : "Save sleep"}
      </button>
    </div>
  )
}
