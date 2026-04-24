const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string
}

let accessToken: string | null = null

export function setAccessToken(t: string | null) {
  accessToken = t
}

export function getAccessToken() {
  return accessToken
}

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
  if (!res.ok) return null
  const data = await res.json()
  accessToken = data.access_token
  return accessToken
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }

  const token = opts.token ?? accessToken
  if (token) headers["Authorization"] = `Bearer ${token}`

  let res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: "include",
  })

  // On 401, attempt token refresh once
  if (res.status === 401 && !opts.token) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`
      res = await fetch(`${API_BASE}${path}`, {
        method: opts.method || "GET",
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        credentials: "include",
      })
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `API error ${res.status}`)
  }

  return res.json()
}


export type TokenResponse = { access_token: string; token_type: string }

export async function register(email: string, password: string) {
  const res = await request<TokenResponse>("/auth/register", { method: "POST", body: { email, password } })
  accessToken = res.access_token
  return res
}

export async function login(email: string, password: string) {
  const res = await request<TokenResponse>("/auth/login", { method: "POST", body: { email, password } })
  accessToken = res.access_token
  return res
}

export async function logout() {
  await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {})
  accessToken = null
}

export function getMe() {
  return request<{ id: string; email: string; created_at: string }>("/auth/me")
}


export type GlucoseReading = { id: string; value: number; timing: string; recorded_at: string }

export function createGlucose(value: number, timing: string) {
  return request<GlucoseReading>("/glucose", { method: "POST", body: { value, timing } })
}

export function listGlucose(limit = 50) {
  return request<GlucoseReading[]>(`/glucose?limit=${limit}`)
}


export type Meal = { id: string; meal_type: string; foods: string[]; notes: string; recorded_at: string }

export function createMeal(meal_type: string, foods: string[], notes: string) {
  return request<Meal>("/meals", { method: "POST", body: { meal_type, foods, notes } })
}

export function listMeals(limit = 50) {
  return request<Meal[]>(`/meals?limit=${limit}`)
}


export type Activity = { id: string; activity_type: string; duration: number; intensity: string; recorded_at: string }

export function createActivity(activity_type: string, duration: number, intensity: string) {
  return request<Activity>("/activities", { method: "POST", body: { activity_type, duration, intensity } })
}

export function listActivities(limit = 50) {
  return request<Activity[]>(`/activities?limit=${limit}`)
}


export type SleepEntry = { id: string; hours: number; quality: string; recorded_at: string }

export function createSleep(hours: number, quality: string) {
  return request<SleepEntry>("/sleep", { method: "POST", body: { hours, quality } })
}

export function listSleep(limit = 50) {
  return request<SleepEntry[]>(`/sleep?limit=${limit}`)
}


export type TimelineEvent = { id: string; type: string; label: string; value: string; recorded_at: string }

export function listTimeline(limit = 50) {
  return request<TimelineEvent[]>(`/timeline?limit=${limit}`)
}


export type StabilityScore = {
  score: number
  glucose_component: number
  activity_component: number
  sleep_component: number
  heart_rate_component: number
  spike_risk: number
  spike_factors: { label: string; impact: string; weight: number }[]
}

export function getStabilityScore() {
  return request<StabilityScore>("/stability/score")
}


export function syncWearable(data: {
  heart_rate?: number
  steps?: number
  active_minutes?: number
  sleep_hours?: number
  sleep_quality?: string
}) {
  return request<{ status: string }>("/sync/wearable", { method: "POST", body: data })
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

export function getWearableStatus() {
  return request<WearableStatus>("/sync/wearable")
}


export type Medication = { id: string; name: string; dose_value: number; dose_unit: string; timing: string; notes: string; recorded_at: string }

export function createMedication(name: string, dose_value: number, dose_unit: string, timing: string, notes: string) {
  return request<Medication>("/medications", { method: "POST", body: { name, dose_value, dose_unit, timing, notes } })
}

export function listMedications(limit = 50) {
  return request<Medication[]>(`/medications?limit=${limit}`)
}


export type Goals = { glucose_low: number; glucose_high: number; daily_steps: number; sleep_hours: number }
export type GoalProgress = { glucose_in_range_pct: number; steps_today: number; steps_target: number; sleep_last: number; sleep_target: number }

export function getGoals() {
  return request<Goals>("/goals")
}

export function updateGoals(goals: Goals) {
  return request<Goals>("/goals", { method: "PUT", body: goals })
}

export function getGoalProgress() {
  return request<GoalProgress>("/goals/progress")
}


export type GlucoseTrendPoint = { date: string; avg: number; min: number; max: number; count: number }
export type StabilityTrendPoint = { date: string; score: number }

export function getGlucoseTrend(days = 7) {
  return request<GlucoseTrendPoint[]>(`/trends/glucose?days=${days}`)
}

export function getStabilityTrend(days = 30) {
  return request<StabilityTrendPoint[]>(`/trends/stability?days=${days}`)
}


export type MealGlucoseCorrelation = { meal_id: string; meal_type: string; foods: string[]; recorded_at: string; pre_meal_glucose: number | null; peak_glucose: number | null; glucose_delta: number | null }
export type FoodImpact = { food: string; avg_delta: number; occurrences: number }

export function getMealGlucoseCorrelations(days = 14) {
  return request<MealGlucoseCorrelation[]>(`/correlations/meal-glucose?days=${days}`)
}

export function getFoodImpact(days = 30) {
  return request<FoodImpact[]>(`/correlations/food-impact?days=${days}`)
}


export type InsightResponse = { id: string; week_start: string; summary: string; generated_at: string }
export type InsightPreviewResponse = { week_start: string; week_end: string; system_prompt: string; user_prompt: string }

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


export async function recognizeFood(file: File): Promise<string[]> {
  const formData = new FormData()
  formData.append("photo", file)

  const headers: Record<string, string> = {}
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`

  const res = await fetch(`${API_BASE}/meals/recognize-photo`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  })
  if (!res.ok) throw new Error("Recognition failed")
  const data = await res.json()
  return data.foods
}


export type PlaybookEntry = { food: string; avg_delta: number; occurrences: number; suggestion: string | null }

export function getPlaybook(foods: string[]) {
  return request<PlaybookEntry[]>(`/meals/playbook?foods=${foods.join(",")}`)
}


export type Experiment = { id: string; name: string; food_a: string; food_b: string; status: string; created_at: string }
export type ExperimentEntry = { id: string; arm: string; pre_glucose: number; peak_glucose: number; glucose_delta: number; recorded_at: string }
export type ExperimentComparison = { experiment: Experiment; arm_a: ExperimentEntry[]; arm_b: ExperimentEntry[]; avg_delta_a: number | null; avg_delta_b: number | null }

export function createExperiment(name: string, food_a: string, food_b: string) {
  return request<Experiment>("/experiments", { method: "POST", body: { name, food_a, food_b } })
}

export function listExperiments() {
  return request<Experiment[]>("/experiments")
}

export function getExperiment(id: string) {
  return request<ExperimentComparison>(`/experiments/${id}`)
}

export function addExperimentEntry(experimentId: string, arm: string, pre_glucose: number, peak_glucose: number) {
  return request<ExperimentEntry>(`/experiments/${experimentId}/entries`, { method: "POST", body: { arm, pre_glucose, peak_glucose } })
}

export function completeExperiment(id: string) {
  return request<{ status: string }>(`/experiments/${id}/complete`, { method: "POST" })
}


export type FastingSession = { id: string; started_at: string; ended_at: string | null; target_hours: number | null; elapsed_hours: number }

export function startFast(target_hours?: number) {
  return request<FastingSession>("/fasting/start", { method: "POST", body: { target_hours } })
}

export function endFast() {
  return request<FastingSession>("/fasting/end", { method: "POST" })
}

export function getActiveFast() {
  return request<FastingSession & { active?: boolean }>("/fasting/active")
}

export function fastingHistory(limit = 10) {
  return request<FastingSession[]>(`/fasting/history?limit=${limit}`)
}


export type MedSchedule = { id: string; medication_name: string; dose_value: number; dose_unit: string; schedule_time: string; days_of_week: number[]; active: boolean }

export function createMedSchedule(medication_name: string, dose_value: number, dose_unit: string, schedule_time: string, days_of_week: number[]) {
  return request<MedSchedule>("/medication-schedules", { method: "POST", body: { medication_name, dose_value, dose_unit, schedule_time, days_of_week } })
}

export function listMedSchedules() {
  return request<MedSchedule[]>("/medication-schedules")
}

export function deleteMedSchedule(id: string) {
  return request<{ status: string }>(`/medication-schedules/${id}`, { method: "DELETE" })
}


export async function exportCSV(fromDate?: string, toDate?: string) {
  const params = new URLSearchParams()
  if (fromDate) params.set("from_date", fromDate)
  if (toDate) params.set("to_date", toDate)

  const headers: Record<string, string> = {}
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`

  const res = await fetch(`${API_BASE}/export/csv?${params}`, {
    headers,
    credentials: "include",
  })
  return res.blob()
}
