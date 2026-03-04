"use client"

import { useState } from "react"
import { Droplets, Utensils, Footprints, Moon, Clock, TrendingUp, TrendingDown, Minus, Plus, X } from "lucide-react"
import { useAppData } from "@/contexts/app-data-context"

type Tab = "glucose" | "meals" | "activity" | "sleep"

const tabs: { key: Tab; label: string; icon: typeof Droplets }[] = [
  { key: "glucose", label: "Glucose", icon: Droplets },
  { key: "meals", label: "Meals", icon: Utensils },
  { key: "activity", label: "Activity", icon: Footprints },
  { key: "sleep", label: "Sleep", icon: Moon },
]

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"] as const
type MealType = (typeof mealTypes)[number]

const quickFoods = [
  "Oatmeal", "Eggs", "Toast", "Rice", "Chicken", "Salad",
  "Fruit", "Yogurt", "Pasta", "Fish", "Nuts", "Smoothie",
]

const activityTypes = [
  "Walking", "Running", "Cycling", "Weights", "Yoga", "Swimming", "HIIT", "Other",
] as const

const intensities = ["Light", "Moderate", "Intense"] as const

const trendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus }

function getTrend(value: number, prev: number): "up" | "down" | "stable" {
  const diff = value - prev
  if (diff > 10) return "up"
  if (diff < -10) return "down"
  return "stable"
}

export default function LogPage() {
  const { state, dispatch } = useAppData()
  const [tab, setTab] = useState<Tab>("glucose")
  const [saved, setSaved] = useState(false)

  const [glucoseValue, setGlucoseValue] = useState("")
  const [timing, setTiming] = useState<"fasting" | "before" | "after">("fasting")

  const [mealType, setMealType] = useState<MealType>("Breakfast")
  const [selected, setSelected] = useState<string[]>([])
  const [custom, setCustom] = useState("")
  const [notes, setNotes] = useState("")

  const [actType, setActType] = useState<string>("Walking")
  const [duration, setDuration] = useState("")
  const [intensity, setIntensity] = useState<string>("Moderate")

  const [sleepHours, setSleepHours] = useState("")
  const [sleepQuality, setSleepQuality] = useState<"poor" | "fair" | "good" | "great">("good")

  const nowStr = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })

  const toggleFood = (food: string) => {
    setSelected((prev) => prev.includes(food) ? prev.filter((f) => f !== food) : [...prev, food])
  }

  const addCustom = () => {
    if (custom.trim() && !selected.includes(custom.trim())) {
      setSelected((prev) => [...prev, custom.trim()])
      setCustom("")
    }
  }

  const flash = (reset: () => void) => {
    setSaved(true)
    setTimeout(() => { setSaved(false); reset() }, 2000)
  }

  const handleSave = () => {
    if (tab === "glucose" && glucoseValue) {
      dispatch({ type: "addGlucoseReading", payload: { time: nowStr(), value: Number(glucoseValue), timing } })
      flash(() => setGlucoseValue(""))
    } else if (tab === "meals" && selected.length > 0) {
      dispatch({ type: "addMeal", payload: { time: nowStr(), mealType, foods: selected, notes } })
      flash(() => { setSelected([]); setNotes("") })
    } else if (tab === "activity" && duration) {
      dispatch({ type: "addActivity", payload: { time: nowStr(), activityType: actType, duration: Number(duration), intensity } })
      flash(() => setDuration(""))
    } else if (tab === "sleep" && sleepHours) {
      dispatch({ type: "addSleep", payload: { time: nowStr(), hours: Number(sleepHours), quality: sleepQuality } })
      flash(() => setSleepHours(""))
    }
  }

  const recentReadings = state.glucoseReadings.map((r, i, arr) => ({
    time: r.time,
    value: r.value,
    trend: i === 0 ? "stable" as const : getTrend(r.value, arr[i - 1].value),
  }))

  const saveDisabled =
    (tab === "glucose" && !glucoseValue) ||
    (tab === "meals" && selected.length === 0) ||
    (tab === "activity" && !duration) ||
    (tab === "sleep" && !sleepHours)

  const saveLabel = saved
    ? "Saved"
    : tab === "glucose" ? "Save reading"
    : tab === "meals" ? "Save meal"
    : tab === "activity" ? "Save activity"
    : "Save sleep"

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Log Entry
          </p>
          <h1 className="mt-3 font-serif text-[28px] font-light text-foreground">
            Log
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saveDisabled}
          className="mb-1 border border-foreground bg-foreground px-6 py-2 text-[12px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85 disabled:opacity-30"
        >
          {saveLabel}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-px overflow-hidden border border-border bg-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center justify-center gap-2 bg-background py-3 text-[13px] tracking-[0.02em] transition-colors ${
              tab === t.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {/* ── Glucose ── */}
        <div className={tab === "glucose" ? "contents" : "hidden"}>
          <div className="border border-border p-6">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Reading</p>
            <div className="mt-4 flex items-baseline gap-2">
              <input
                type="number"
                value={glucoseValue}
                onChange={(e) => setGlucoseValue(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent font-serif text-[36px] font-light text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
              <span className="text-[14px] text-muted-foreground">mg/dL</span>
            </div>
            <div className="mt-5">
              <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Timing</p>
              <div className="mt-3 flex gap-2">
                {(["fasting", "before", "after"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTiming(t)}
                    className={`flex-1 border py-2.5 text-[12px] capitalize tracking-[0.04em] transition-colors ${
                      timing === t
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground/30"
                    }`}
                  >
                    {t === "before" ? "Pre-meal" : t === "after" ? "Post-meal" : t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground/70" strokeWidth={1.5} />
                <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Today</p>
              </div>
              <p className="text-[12px] text-muted-foreground/80">{recentReadings.length} readings</p>
            </div>
            <div className="mt-4">
              {recentReadings.map((r, i) => {
                const Icon = trendIcon[r.trend]
                return (
                  <div key={i} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] text-muted-foreground">{r.time}</span>
                      <span className="font-serif text-[20px] font-light text-foreground">{r.value}</span>
                    </div>
                    <Icon
                      className={`h-4 w-4 ${r.trend === "up" ? "text-amber-600/70" : r.trend === "down" ? "text-emerald-700/60" : "text-muted-foreground/60"}`}
                      strokeWidth={1.5}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Meals ── */}
        <div className={tab === "meals" ? "contents" : "hidden"}>
          <div className="border border-border p-6">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Meal type</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {mealTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`border py-2.5 text-[12px] tracking-[0.04em] transition-colors ${
                    mealType === type
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">What did you eat?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickFoods.map((food) => (
                  <button
                    key={food}
                    onClick={() => toggleFood(food)}
                    className={`border px-3.5 py-2 text-[12px] tracking-[0.02em] transition-colors ${
                      selected.includes(food)
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground/30"
                    }`}
                  >
                    {food}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustom()}
                  placeholder="Add custom food..."
                  className="flex-1 border border-border bg-transparent px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/30 focus:outline-none transition-colors"
                />
                <button onClick={addCustom} className="border border-border px-3 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {selected.length > 0 && (
              <div className="border border-border p-6">
                <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Selected ({selected.length})</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.map((food) => (
                    <span key={food} className="flex items-center gap-1.5 border border-foreground/15 bg-secondary px-3 py-1.5 text-[12px] text-foreground">
                      {food}
                      <button onClick={() => toggleFood(food)}><X className="h-3 w-3 text-muted-foreground" /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="border border-border p-6">
              <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Notes (optional)</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did you feel after eating?"
                rows={5}
                className="mt-3 w-full resize-none border border-border bg-transparent px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/30 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ── Activity ── */}
        <div className={tab === "activity" ? "contents" : "hidden"}>
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
                {state.activities.length + state.timeline.filter((e) => e.type === "activity").length} logged
              </p>
            </div>
            <div className="mt-4">
              {state.timeline.filter((e) => e.type === "activity").map((e, i) => (
                <div key={`seed-${i}`} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                  <div>
                    <p className="text-[13px] text-foreground">{e.label}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{e.value}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground/70">{e.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sleep ── */}
        <div className={tab === "sleep" ? "contents" : "hidden"}>
          <div className="border border-border p-6">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Hours slept</p>
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
                {state.sleepEntries.length + state.timeline.filter((e) => e.type === "sleep").length} logged
              </p>
            </div>
            <div className="mt-4">
              {state.timeline.filter((e) => e.type === "sleep").map((e, i) => (
                <div key={`seed-${i}`} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                  <div>
                    <p className="text-[13px] text-foreground">{e.label}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{e.value}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground/70">{e.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
