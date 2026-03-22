"use client"

import { useState, useEffect, useCallback } from "react"
import * as api from "@/lib/api"

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<api.Experiment[]>([])
  const [comparison, setComparison] = useState<api.ExperimentComparison | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState("")
  const [foodA, setFoodA] = useState("")
  const [foodB, setFoodB] = useState("")

  const load = useCallback(async () => {
    const data = await api.listExperiments().catch(() => [])
    setExperiments(data)
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    await api.createExperiment(name, foodA, foodB)
    setName(""); setFoodA(""); setFoodB(""); setShowCreate(false)
    await load()
  }

  const viewExperiment = async (id: string) => {
    const data = await api.getExperiment(id).catch(() => null)
    setComparison(data)
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
          Food Experiments
        </p>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="border border-border px-3 py-1.5 text-[11px] tracking-[0.04em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          New experiment
        </button>
      </div>

      {showCreate && (
        <div className="border border-border p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            Create Experiment
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Experiment name"
            className="mt-4 w-full border border-border bg-transparent px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:border-foreground/30 focus:outline-none"
          />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">Food A</label>
              <input
                type="text"
                value={foodA}
                onChange={(e) => setFoodA(e.target.value)}
                placeholder="e.g. Oatmeal"
                className="mt-1 w-full border border-border bg-transparent px-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:border-foreground/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Food B</label>
              <input
                type="text"
                value={foodB}
                onChange={(e) => setFoodB(e.target.value)}
                placeholder="e.g. Eggs"
                className="mt-1 w-full border border-border bg-transparent px-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:border-foreground/30 focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={!name || !foodA || !foodB}
            className="mt-4 w-full bg-foreground py-2 text-[12px] font-medium tracking-wide text-background disabled:opacity-30"
          >
            Create
          </button>
        </div>
      )}

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

      {experiments.length === 0 && !showCreate ? (
        <div className="border border-border p-6 text-center">
          <p className="text-[13px] text-muted-foreground/60">No experiments yet</p>
          <p className="mt-1.5 text-[12px] text-muted-foreground/40">
            Compare how different foods affect your glucose with A/B testing.
          </p>
        </div>
      ) : (
        experiments.map((exp) => (
          <button
            key={exp.id}
            onClick={() => viewExperiment(exp.id)}
            className="flex items-center justify-between border border-border p-5 text-left transition-colors hover:border-foreground/30"
          >
            <div>
              <p className="text-[13px] font-medium text-foreground">{exp.name}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {exp.food_a} vs {exp.food_b}
              </p>
            </div>
            <span className={`text-[11px] font-medium ${exp.status === "active" ? "text-primary" : "text-muted-foreground"}`}>
              {exp.status}
            </span>
          </button>
        ))
      )}
    </div>
  )
}
