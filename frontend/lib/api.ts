const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `API error ${res.status}`)
  }

  return res.json()
}

// ── Auth ──

export type TokenResponse = { access_token: string; token_type: string }

export function register(email: string, password: string) {
  return request<TokenResponse>("/auth/register", { method: "POST", body: { email, password } })
}

export function login(email: string, password: string) {
  return request<TokenResponse>("/auth/login", { method: "POST", body: { email, password } })
}

export function getMe(token: string) {
  return request<{ id: string; email: string; created_at: string }>("/auth/me", { token })
}

// ── Glucose ──

export type GlucoseReading = { id: string; value: number; timing: string; recorded_at: string }

export function createGlucose(token: string, value: number, timing: string) {
  return request<GlucoseReading>("/glucose", { method: "POST", token, body: { value, timing } })
}

export function listGlucose(token: string, limit = 50) {
  return request<GlucoseReading[]>(`/glucose?limit=${limit}`, { token })
}

// ── Meals ──

export type Meal = { id: string; meal_type: string; foods: string[]; notes: string; recorded_at: string }

export function createMeal(token: string, meal_type: string, foods: string[], notes: string) {
  return request<Meal>("/meals", { method: "POST", token, body: { meal_type, foods, notes } })
}

export function listMeals(token: string, limit = 50) {
  return request<Meal[]>(`/meals?limit=${limit}`, { token })
}

// ── Activities ──

export type Activity = { id: string; activity_type: string; duration: number; intensity: string; recorded_at: string }

export function createActivity(token: string, activity_type: string, duration: number, intensity: string) {
  return request<Activity>("/activities", { method: "POST", token, body: { activity_type, duration, intensity } })
}

export function listActivities(token: string, limit = 50) {
  return request<Activity[]>(`/activities?limit=${limit}`, { token })
}

// ── Sleep ──

export type SleepEntry = { id: string; hours: number; quality: string; recorded_at: string }

export function createSleep(token: string, hours: number, quality: string) {
  return request<SleepEntry>("/sleep", { method: "POST", token, body: { hours, quality } })
}

export function listSleep(token: string, limit = 50) {
  return request<SleepEntry[]>(`/sleep?limit=${limit}`, { token })
}

// ── Timeline ──

export type TimelineEvent = { id: string; type: string; label: string; value: string; recorded_at: string }

export function listTimeline(token: string, limit = 50) {
  return request<TimelineEvent[]>(`/timeline?limit=${limit}`, { token })
}

// ── Stability ──

export type StabilityScore = {
  score: number
  glucose_component: number
  activity_component: number
  sleep_component: number
  heart_rate_component: number
  spike_risk: number
  spike_factors: { label: string; impact: string; weight: number }[]
}

export function getStabilityScore(token: string) {
  return request<StabilityScore>("/stability/score", { token })
}

// ── Wearable sync ──

export function syncWearable(token: string, data: {
  heart_rate?: number
  steps?: number
  active_minutes?: number
  sleep_hours?: number
  sleep_quality?: string
}) {
  return request<{ status: string }>("/sync/wearable", { method: "POST", token, body: data })
}

export type WearableStatus = {
  connected: boolean
  heart_rate?: number
  steps?: number
  active_minutes?: number
  sleep_hours?: number
  sleep_quality?: string
  last_sync?: string
}

export function getWearableStatus(token: string) {
  return request<WearableStatus>("/sync/wearable", { token })
}

// ── Medications ──

export type Medication = { id: string; name: string; dose_value: number; dose_unit: string; timing: string; notes: string; recorded_at: string }

export function createMedication(token: string, name: string, dose_value: number, dose_unit: string, timing: string, notes: string) {
  return request<Medication>("/medications", { method: "POST", token, body: { name, dose_value, dose_unit, timing, notes } })
}

export function listMedications(token: string, limit = 50) {
  return request<Medication[]>(`/medications?limit=${limit}`, { token })
}

// ── Goals ──

export type Goals = { glucose_low: number; glucose_high: number; daily_steps: number; sleep_hours: number }
export type GoalProgress = { glucose_in_range_pct: number; steps_today: number; steps_target: number; sleep_last: number; sleep_target: number }

export function getGoals(token: string) {
  return request<Goals>("/goals", { token })
}

export function updateGoals(token: string, goals: Goals) {
  return request<Goals>("/goals", { method: "PUT", token, body: goals })
}

export function getGoalProgress(token: string) {
  return request<GoalProgress>("/goals/progress", { token })
}

// ── Trends ──

export type GlucoseTrendPoint = { date: string; avg: number; min: number; max: number; count: number }
export type StabilityTrendPoint = { date: string; score: number }

export function getGlucoseTrend(token: string, days = 7) {
  return request<GlucoseTrendPoint[]>(`/trends/glucose?days=${days}`, { token })
}

export function getStabilityTrend(token: string, days = 30) {
  return request<StabilityTrendPoint[]>(`/trends/stability?days=${days}`, { token })
}

// ── Correlations ──

export type MealGlucoseCorrelation = { meal_id: string; meal_type: string; foods: string[]; recorded_at: string; pre_meal_glucose: number | null; peak_glucose: number | null; glucose_delta: number | null }
export type FoodImpact = { food: string; avg_delta: number; occurrences: number }

export function getMealGlucoseCorrelations(token: string, days = 14) {
  return request<MealGlucoseCorrelation[]>(`/correlations/meal-glucose?days=${days}`, { token })
}

export function getFoodImpact(token: string, days = 30) {
  return request<FoodImpact[]>(`/correlations/food-impact?days=${days}`, { token })
}

// ── Insights ──

export type InsightResponse = { id: string; week_start: string; summary: string; generated_at: string }

export function getWeeklyInsight(token: string) {
  return request<InsightResponse | { status: string }>("/insights/weekly", { token })
}

export function generateWeeklyInsight(token: string) {
  return request<InsightResponse>("/insights/weekly/generate", { method: "POST", token })
}

export function getInsightHistory(token: string, limit = 10) {
  return request<InsightResponse[]>(`/insights/history?limit=${limit}`, { token })
}

// ── Export ──

export async function exportCSV(token: string, fromDate?: string, toDate?: string) {
  const params = new URLSearchParams()
  if (fromDate) params.set("from_date", fromDate)
  if (toDate) params.set("to_date", toDate)
  const res = await fetch(`${API_BASE}/export/csv?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.blob()
}
