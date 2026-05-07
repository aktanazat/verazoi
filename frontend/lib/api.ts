import { API_BASE } from "@/lib/config"
import type { Experiment, ExperimentComparison, FastingSession, FoodImpact, GlucoseReading, GlucoseTrendPoint, GoalProgress, InsightPreviewResponse, InsightResponse, StabilityScore, StabilityTrendPoint, TimelineEvent, WearableStatus, WearableSyncPayload } from "./api-types"

export type { Experiment, ExperimentComparison, FastingSession, FoodImpact, GlucoseReading, GlucoseTrendPoint, GoalProgress, InsightPreviewResponse, InsightResponse, StabilityScore, StabilityTrendPoint, TimelineEvent, WearableStatus, WearableSyncPayload } from "./api-types"

type RequestOptions = {
  method?: string
  body?: unknown
}

async function refreshAccessToken(): Promise<boolean> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
  return res.ok
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }

  let res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: "include",
  })

  // On 401, attempt token refresh once
  if (res.status === 401 && await refreshAccessToken()) {
    res = await fetch(`${API_BASE}${path}`, {
      method: opts.method || "GET",
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      credentials: "include",
    })
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `API error ${res.status}`)
  }

  return res.json()
}



export function listGlucose(limit = 50) {
  return request<GlucoseReading[]>(`/glucose?limit=${limit}`)
}


export function listTimeline(limit = 50) {
  return request<TimelineEvent[]>(`/timeline?limit=${limit}`)
}


export function getStabilityScore() {
  return request<StabilityScore>("/stability/score")
}


export function syncWearable(data: WearableSyncPayload) {
  return request<{ status: string }>("/sync/wearable", { method: "POST", body: data })
}


export function getWearableStatus() {
  return request<WearableStatus>("/sync/wearable")
}


export function getGoalProgress() {
  return request<GoalProgress>("/goals/progress")
}


export function getGlucoseTrend(days = 7) {
  return request<GlucoseTrendPoint[]>(`/trends/glucose?days=${days}`)
}

export function getStabilityTrend(days = 30) {
  return request<StabilityTrendPoint[]>(`/trends/stability?days=${days}`)
}


export function getFoodImpact(days = 30) {
  return request<FoodImpact[]>(`/correlations/food-impact?days=${days}`)
}


export function getWeeklyInsight() {
  return request<InsightResponse | { status: string }>("/insights/weekly")
}

export function getWeeklyInsightPreview() {
  return request<InsightPreviewResponse>("/insights/weekly/preview")
}

export function generateWeeklyInsight(week_start: string, user_prompt: string) {
  return request<InsightResponse>("/insights/weekly/generate", {
    method: "POST",
    body: { week_start, user_prompt },
  })
}

export function getInsightHistory(limit = 10) {
  return request<InsightResponse[]>(`/insights/history?limit=${limit}`)
}

export type DemoSeedResponse = {
  status: string
  inserted: { glucose: number; meals: number; activities: number; sleep: number; medications: number; timeline: number; wearable: number }
}

export function seedDemoData() {
  return request<DemoSeedResponse>("/demo/seed", { method: "POST" })
}


export async function recognizeFood(file: File): Promise<string[]> {
  const formData = new FormData()
  formData.append("photo", file)

  const res = await fetch(`${API_BASE}/meals/recognize-photo`, {
    method: "POST",
    body: formData,
    credentials: "include",
  })
  if (!res.ok) throw new Error("Recognition failed")
  const data = await res.json()
  return data.foods
}


export function listExperiments() {
  return request<Experiment[]>("/experiments")
}

export function getExperiment(id: string) {
  return request<ExperimentComparison>(`/experiments/${id}`)
}


export function getActiveFast() {
  return request<FastingSession & { active?: boolean }>("/fasting/active")
}

export function fastingHistory(limit = 10) {
  return request<FastingSession[]>(`/fasting/history?limit=${limit}`)
}


