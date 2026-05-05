"use client"

import { useCallback, useEffect, useState } from "react"
import {
  fastingHistory,
  getActiveFast,
  getExperiment,
  listExperiments,
  recognizeFood,
  type Experiment,
  type ExperimentComparison,
  type FastingSession,
} from "@/lib/api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export function FastingStatus() {
  const [active, setActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [targetHours, setTargetHours] = useState(16)
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [history, setHistory] = useState<FastingSession[]>([])

  const load = useCallback(async () => {
    try {
      const data = await getActiveFast()
      if ("active" in data && data.active === false) {
        setActive(false)
      } else if (data.started_at) {
        setActive(true)
        setElapsed(data.elapsed_hours)
        setTargetHours(data.target_hours ?? 16)
        setStartedAt(new Date(data.started_at))
      }
    } catch {
      setActive(false)
    }

    const hist = await fastingHistory().catch(() => [])
    setHistory(hist)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!active || !startedAt) return
    const interval = setInterval(() => {
      setElapsed((Date.now() - startedAt.getTime()) / 3600000)
    }, 60000)
    return () => clearInterval(interval)
  }, [active, startedAt])

  const formatElapsed = (h: number) => {
    const hours = Math.floor(h)
    const mins = Math.floor((h - hours) * 60)
    return `${hours}:${mins.toString().padStart(2, "0")}`
  }

  return (
    <div className="border border-border p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
        Current fast
      </p>

      {active ? (
        <div className="mt-5">
          <p className="font-serif text-[48px] font-light text-foreground">
            {formatElapsed(elapsed)}
          </p>

          <div className="mt-4 h-1 w-full bg-border">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min((elapsed / targetHours) * 100, 100)}%` }}
            />
          </div>

          <p className="mt-2 text-[12px] text-muted-foreground">
            {targetHours}h target
          </p>

          <form action={`${API_BASE}/fasting/end/form`} method="post">
            <button
              type="submit"
              className="mt-6 w-full bg-foreground py-2.5 text-[12px] font-medium tracking-wide text-background"
            >
              End fast
            </button>
          </form>
        </div>
      ) : (
        <p className="mt-6 text-center text-[13px] text-muted-foreground/60">No active fast</p>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
          History
        </p>
        {history.length === 0 ? (
          <p className="mt-6 text-center text-[13px] text-muted-foreground/60">No completed fasts yet</p>
        ) : (
          <div className="mt-4">
            {history.map((session) => (
              <div key={session.id} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                <div>
                  <p className="font-mono text-[14px] font-medium text-foreground">
                    {formatElapsed(session.elapsed_hours)}
                  </p>
                  {session.target_hours && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      / {session.target_hours}h target
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground/70">
                  {new Date(session.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function ExperimentList() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [comparison, setComparison] = useState<ExperimentComparison | null>(null)

  const load = useCallback(async () => {
    const data = await listExperiments().catch(() => [])
    setExperiments(data)
  }, [])

  useEffect(() => { load() }, [load])

  const viewExperiment = async (id: string) => {
    const data = await getExperiment(id).catch(() => null)
    setComparison(data)
  }

  return (
    <>
      {comparison && (
        <div className="border border-border p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            {comparison.experiment.name}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-[13px] font-medium text-foreground">{comparison.experiment.food_a}</p>
              <p className="mt-2 font-serif text-[28px] font-light text-foreground">
                {comparison.avg_delta_a !== null ? `${comparison.avg_delta_a > 0 ? "+" : ""}${Math.round(comparison.avg_delta_a)}` : "--"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">mg/dL avg delta</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{comparison.arm_a.length} entries</p>
            </div>
            <div className="text-center">
              <p className="text-[13px] font-medium text-foreground">{comparison.experiment.food_b}</p>
              <p className="mt-2 font-serif text-[28px] font-light text-foreground">
                {comparison.avg_delta_b !== null ? `${comparison.avg_delta_b > 0 ? "+" : ""}${Math.round(comparison.avg_delta_b)}` : "--"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">mg/dL avg delta</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{comparison.arm_b.length} entries</p>
            </div>
          </div>
        </div>
      )}

      {experiments.length === 0 ? (
        <div className="border border-border p-6 text-center">
          <p className="text-[13px] text-muted-foreground/60">No experiments yet</p>
          <p className="mt-1.5 text-[12px] text-muted-foreground/40">
            Compare how different foods affect your glucose with A/B testing.
          </p>
        </div>
      ) : (
        experiments.map((experiment) => (
          <button
            key={experiment.id}
            onClick={() => viewExperiment(experiment.id)}
            className="flex items-center justify-between border border-border p-5 text-left transition-colors hover:border-foreground/30"
          >
            <div>
              <p className="text-[13px] font-medium text-foreground">{experiment.name}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {experiment.food_a} vs {experiment.food_b}
              </p>
            </div>
            <span className={`text-[11px] font-medium ${experiment.status === "active" ? "text-primary" : "text-muted-foreground"}`}>
              {experiment.status}
            </span>
          </button>
        ))
      )}
    </>
  )
}

export function MealPhotoRecognition() {
  const [recognized, setRecognized] = useState<string[]>([])
  const [recognizing, setRecognizing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null)
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null)

  useEffect(() => () => {
    if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl)
  }, [pendingPhotoUrl])

  const clearPendingPhoto = () => {
    if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl)
    setPendingPhoto(null)
    setPendingPhotoUrl(null)
  }

  const handlePhotoSelected = (file: File) => {
    setError(null)
    if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl)
    setPendingPhoto(file)
    setPendingPhotoUrl(URL.createObjectURL(file))
  }

  const handleRecognizePhoto = async () => {
    if (!pendingPhoto || recognizing) return
    setRecognizing(true)
    setError(null)
    try {
      const foods = await recognizeFood(pendingPhoto)
      setRecognized((prev) => [...new Set([...prev, ...foods])])
      clearPendingPhoto()
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Could not recognize foods from that photo.")
    }
    setRecognizing(false)
  }

  return (
    <>
      {recognized.map((food) => <input key={food} type="hidden" name="foods" value={food} />)}
      <label className="flex cursor-pointer items-center border border-border px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
        Photo
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          disabled={recognizing}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            handlePhotoSelected(file)
            event.target.value = ""
          }}
        />
      </label>

      {recognized.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {recognized.map((food) => (
            <span key={food} className="flex items-center gap-1.5 border border-foreground/15 bg-secondary px-3 py-1.5 text-[12px] text-foreground">
              {food}
              <button type="button" onClick={() => setRecognized((prev) => prev.filter((item) => item !== food))} className="text-muted-foreground" aria-label={`Remove ${food}`}>×</button>
            </span>
          ))}
        </div>
      )}

      {pendingPhoto && <p className="mt-2 text-[11px] text-muted-foreground">Review the selected photo before upload.</p>}
      {recognizing && <p className="mt-2 text-[11px] text-muted-foreground">Recognizing foods...</p>}
      {error && <p className="mt-2 text-[11px] text-amber-700">{error}</p>}

      {pendingPhoto && pendingPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 px-6">
          <div className="w-full max-w-xl border border-border bg-background p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">Review photo</p>
            <img src={pendingPhotoUrl} alt="Meal photo preview" className="mt-4 max-h-[420px] w-full object-contain" />
            <p className="mt-4 text-[13px] leading-6 text-muted-foreground">
              This photo will be uploaded to Anthropic for food recognition only if you confirm below.
            </p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={handleRecognizePhoto} disabled={recognizing} className="flex-1 bg-foreground py-2.5 text-[12px] font-medium tracking-wide text-background disabled:opacity-50">
                {recognizing ? "Recognizing..." : "Use this photo"}
              </button>
              <button type="button" onClick={clearPendingPhoto} disabled={recognizing} className="flex-1 border border-border py-2.5 text-[12px] font-medium tracking-wide text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
