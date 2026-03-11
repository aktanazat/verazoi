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
