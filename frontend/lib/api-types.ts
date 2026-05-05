export type TokenResponse = { access_token: string; token_type: string }
export type User = { id: string; email: string; created_at: string }

export type GlucoseReading = { id: string; value: number; timing: string; recorded_at: string }
export type Meal = { id: string; meal_type: string; foods: string[]; notes: string; recorded_at: string }
export type Activity = { id: string; activity_type: string; duration: number; intensity: string; recorded_at: string }
export type SleepEntry = { id: string; hours: number; quality: string; recorded_at: string }

export type TimelineEventType = "glucose" | "meal" | "activity" | "sleep" | "medication" | "experiment" | string
export type TimelineEvent = { id: string; type: TimelineEventType; label: string; value: string; recorded_at: string }

export type StabilityScore = {
  score: number
  glucose_component: number
  activity_component: number
  sleep_component: number
  heart_rate_component: number
  spike_risk: number
  spike_factors: { label: string; impact: string; weight: number }[]
}

export type WearableSyncPayload = {
  heart_rate?: number
  steps?: number
  active_minutes?: number
  sleep_hours?: number
  sleep_quality?: string
}

export type WearableStatus = WearableSyncPayload & {
  connected: boolean
  last_sync?: string
}

export type Medication = { id: string; name: string; dose_value: number; dose_unit: string; timing: string; notes: string; recorded_at: string }

export type Goals = { glucose_low: number; glucose_high: number; daily_steps: number; sleep_hours: number }
export type GoalProgress = { glucose_in_range_pct: number; steps_today: number; steps_target: number; sleep_last: number; sleep_target: number }

export type GlucoseTrendPoint = { date: string; avg: number; min: number; max: number; count: number }
export type StabilityTrendPoint = { date: string; score: number }

export type MealGlucoseCorrelation = {
  meal_id: string
  meal_type: string
  foods: string[]
  recorded_at: string
  pre_meal_glucose: number | null
  peak_glucose: number | null
  glucose_delta: number | null
}
export type FoodImpact = { food: string; avg_delta: number; occurrences: number }

export type InsightResponse = { id: string; week_start: string; summary: string; generated_at: string }
export type InsightPreviewResponse = { week_start: string; week_end: string; system_prompt: string; user_prompt: string }

export type PlaybookEntry = { food: string; avg_delta: number; occurrences: number; suggestion: string | null }

export type Experiment = { id: string; name: string; food_a: string; food_b: string; status: string; created_at: string }
export type ExperimentEntry = { id: string; arm: string; pre_glucose: number; peak_glucose: number; glucose_delta: number; recorded_at: string }
export type ExperimentComparison = { experiment: Experiment; arm_a: ExperimentEntry[]; arm_b: ExperimentEntry[]; avg_delta_a: number | null; avg_delta_b: number | null }

export type FastingSession = { id: string; started_at: string; ended_at: string | null; target_hours: number | null; elapsed_hours: number }

export type MedSchedule = { id: string; medication_name: string; dose_value: number; dose_unit: string; schedule_time: string; days_of_week: number[]; active: boolean }
