"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import * as api from "@/lib/api"

type TimelineEvent = {
  time: string
  type: "glucose" | "meal" | "activity" | "sleep"
  label: string
  value: string
}

type GlucoseReading = {
  time: string
  value: number
  timing: "fasting" | "before" | "after"
}

type Meal = {
  time: string
  mealType: string
  foods: string[]
  notes: string
}

type ActivityEntry = {
  time: string
  activityType: string
  duration: number
  intensity: string
}

type SleepEntry = {
  time: string
  hours: number
  quality: string
}

type SpikeFactorData = {
  label: string
  impact: string
  weight: number
}

type AppState = {
  meals: Meal[]
  glucoseReadings: GlucoseReading[]
  activities: ActivityEntry[]
  sleepEntries: SleepEntry[]
  timeline: TimelineEvent[]
  stabilityScore: number
  spikeRisk: number
  spikeFactors: SpikeFactorData[]
  isLoading: boolean
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("verazoi_token")
}

const AppDataContext = createContext<{
  state: AppState
  addGlucoseReading: (value: number, timing: "fasting" | "before" | "after") => Promise<void>
  addMeal: (mealType: string, foods: string[], notes: string) => Promise<void>
  addActivity: (activityType: string, duration: number, intensity: string) => Promise<void>
  addSleep: (hours: number, quality: string) => Promise<void>
  refresh: () => Promise<void>
}>(null!)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    meals: [],
    glucoseReadings: [],
    activities: [],
    sleepEntries: [],
    timeline: [],
    stabilityScore: 0,
    spikeRisk: 0,
    spikeFactors: [],
    isLoading: true,
  })

  const refresh = useCallback(async () => {
    const token = getToken()
    if (!token) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const [glucose, meals, activities, sleep, timeline, score] = await Promise.all([
        api.listGlucose(token),
        api.listMeals(token),
        api.listActivities(token),
        api.listSleep(token),
        api.listTimeline(token),
        api.getStabilityScore(token),
      ])

      setState({
        glucoseReadings: glucose.map(r => ({
          time: formatTime(r.recorded_at),
          value: r.value,
          timing: r.timing as "fasting" | "before" | "after",
        })),
        meals: meals.map(m => ({
          time: formatTime(m.recorded_at),
          mealType: m.meal_type,
          foods: m.foods,
          notes: m.notes,
        })),
        activities: activities.map(a => ({
          time: formatTime(a.recorded_at),
          activityType: a.activity_type,
          duration: a.duration,
          intensity: a.intensity,
        })),
        sleepEntries: sleep.map(s => ({
          time: formatTime(s.recorded_at),
          hours: s.hours,
          quality: s.quality,
        })),
        timeline: timeline.map(e => ({
          time: formatTime(e.recorded_at),
          type: e.type as TimelineEvent["type"],
          label: e.label,
          value: e.value,
        })),
        stabilityScore: score.score,
        spikeRisk: score.spike_risk,
        spikeFactors: score.spike_factors,
        isLoading: false,
      })
    } catch {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const addGlucoseReading = async (value: number, timing: "fasting" | "before" | "after") => {
    const token = getToken()
    if (!token) return
    await api.createGlucose(token, value, timing)
    await refresh()
  }

  const addMeal = async (mealType: string, foods: string[], notes: string) => {
    const token = getToken()
    if (!token) return
    await api.createMeal(token, mealType, foods, notes)
    await refresh()
  }

  const addActivity = async (activityType: string, duration: number, intensity: string) => {
    const token = getToken()
    if (!token) return
    await api.createActivity(token, activityType, duration, intensity)
    await refresh()
  }

  const addSleep = async (hours: number, quality: string) => {
    const token = getToken()
    if (!token) return
    await api.createSleep(token, hours, quality)
    await refresh()
  }

  return (
    <AppDataContext.Provider value={{ state, addGlucoseReading, addMeal, addActivity, addSleep, refresh }}>
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  return useContext(AppDataContext)
}
