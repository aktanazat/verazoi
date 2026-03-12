"use client"

import { useState, useEffect, useCallback } from "react"
import { Clock } from "lucide-react"
import { createMedication, listMedications, type Medication } from "@/lib/api"

const doseUnits = ["mg", "units"] as const
const timings = ["before_meal", "with_meal", "after_meal", "bedtime", "morning", "other"] as const

const timingLabels: Record<string, string> = {
  before_meal: "Pre-meal",
  with_meal: "With meal",
  after_meal: "Post-meal",
  bedtime: "Bedtime",
  morning: "Morning",
  other: "Other",
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("verazoi_token")
}

export default function MedicationsLogPage() {
  const [name, setName] = useState("")
  const [doseValue, setDoseValue] = useState("")
  const [doseUnit, setDoseUnit] = useState<string>("mg")
  const [timing, setTiming] = useState<string>("morning")
  const [notes, setNotes] = useState("")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [recent, setRecent] = useState<Medication[]>([])

  const fetchRecent = useCallback(async () => {
    const token = getToken()
    if (!token) return
    try {
      const data = await listMedications(token, 20)
      setRecent(data)
    } catch {
      // no data
    }
  }, [])

  useEffect(() => { fetchRecent() }, [fetchRecent])

  const handleSave = async () => {
    if (!name || !doseValue || saving) return
    const token = getToken()
    if (!token) return
    setSaving(true)
    try {
      await createMedication(token, name, Number(doseValue), doseUnit, timing, notes)
      await fetchRecent()
      setSaved(true)
      setTimeout(() => { setSaved(false); setName(""); setDoseValue(""); setNotes("") }, 2000)
    } catch {
      // save failed
    }
    setSaving(false)
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={!name || !doseValue || saving}
          className="border border-foreground bg-foreground px-6 py-2 text-[12px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85 disabled:opacity-30"
        >
          {saved ? "Saved" : saving ? "..." : "Save medication"}
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="border border-border p-6">
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Medication</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Medication name"
            className="mt-3 w-full border border-border bg-transparent px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/30 focus:outline-none transition-colors"
          />

          <div className="mt-5">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Dose</p>
            <div className="mt-3 flex gap-3">
              <div className="flex flex-1 items-center gap-3">
                <input
                  type="number"
                  value={doseValue}
                  onChange={(e) => setDoseValue(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent font-serif text-[32px] font-light leading-none text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                {doseUnits.map((u) => (
                  <button
                    key={u}
                    onClick={() => setDoseUnit(u)}
                    className={`border px-3.5 py-2 text-[12px] tracking-[0.04em] transition-colors ${
                      doseUnit === u
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground/30"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Timing</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {timings.map((t) => (
                <button
                  key={t}
                  onClick={() => setTiming(t)}
                  className={`border px-3.5 py-2 text-[12px] tracking-[0.02em] transition-colors ${
                    timing === t
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {timingLabels[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Notes (optional)</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Side effects, observations..."
              rows={3}
              className="mt-3 w-full resize-none border border-border bg-transparent px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/30 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="border border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/70" strokeWidth={1.5} />
              <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Recent</p>
            </div>
            <p className="text-[12px] text-muted-foreground/80">{recent.length} logged</p>
          </div>
          <div className="mt-4">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <p className="text-[13px] text-muted-foreground/60">No medications logged</p>
                <p className="mt-1.5 text-[12px] text-muted-foreground/40">Log a medication to track your intake.</p>
              </div>
            ) : (
              recent.map((med) => (
                <div key={med.id} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                  <div>
                    <p className="text-[13px] text-foreground">{med.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {med.dose_value} {med.dose_unit} &middot; {timingLabels[med.timing] ?? med.timing}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground/70">
                    {new Date(med.recorded_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
