"use client"

import { useState, useEffect, useCallback } from "react"
import { Sparkles } from "lucide-react"
import {
  getWeeklyInsight, getWeeklyInsightPreview, generateWeeklyInsight, getInsightHistory,
  type InsightPreviewResponse, type InsightResponse,
} from "@/lib/api"

function isInsight(data: InsightResponse | { status: string }): data is InsightResponse {
  return "summary" in data
}

export default function InsightsPage() {
  const [current, setCurrent] = useState<InsightResponse | null>(null)
  const [history, setHistory] = useState<InsightResponse[]>([])
  const [preview, setPreview] = useState<InsightPreviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [weekly, hist] = await Promise.all([
        getWeeklyInsight(),
        getInsightHistory(),
      ])
      if (isInsight(weekly)) setCurrent(weekly)
      setHistory(hist)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleLoadPreview = async () => {
    setLoadingPreview(true)
    setError(null)
    try {
      setPreview(await getWeeklyInsightPreview())
    } catch {
      setPreview(null)
      setError("Could not load the reviewed payload.")
    }
    setLoadingPreview(false)
  }

  const handleGenerate = async () => {
    if (!preview) return
    setGenerating(true)
    setError(null)
    try {
      const insight = await generateWeeklyInsight(preview.week_start, preview.user_prompt)
      setCurrent(insight)
      const hist = await getInsightHistory()
      setHistory(hist)
    } catch {
      setError("Could not generate the weekly insight.")
    }
    setGenerating(false)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  return (
    <div>
      <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Intelligence
      </p>
      <h1 className="mt-3 font-serif text-[28px] font-light text-foreground">
        Insights
      </h1>

      <div className="mt-6 grid gap-5">
        <div className="border border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
                Weekly Insight
              </p>
              {current && (
                <p className="mt-1 text-[12px] text-muted-foreground/80">
                  Week of {formatDate(current.week_start)}
                </p>
              )}
            </div>
            <Sparkles className="h-4 w-4 text-muted-foreground/60" strokeWidth={1.5} />
          </div>

          <p className="mt-5 text-[12px] leading-5 text-muted-foreground">
            Review the exact weekly payload before sending it to Anthropic.
            Nothing is sent until you choose to generate the insight.
          </p>

          <button
            onClick={handleLoadPreview}
            disabled={loadingPreview}
            className="mt-4 w-full border border-border py-2.5 text-[12px] font-medium tracking-wide text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
          >
            {loadingPreview ? "Loading preview..." : "Review AI payload"}
          </button>

          {preview ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
                  Week
                </p>
                <p className="mt-2 text-[12px] text-foreground/80">
                  {formatDate(preview.week_start)} to {formatDate(preview.week_end)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
                  System prompt
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-foreground/80">
                  {preview.system_prompt}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
                  User payload
                </p>
                <pre className="mt-2 whitespace-pre-wrap border border-border bg-secondary/50 p-4 font-mono text-[12px] leading-relaxed text-foreground/80">
                  {preview.user_prompt}
                </pre>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-[12px] leading-5 text-muted-foreground">
              Load the payload preview before generating so you can verify the
              exact data sent to Anthropic.
            </p>
          )}

          {error && (
            <p className="mt-4 text-[12px] text-amber-700">
              {error}
            </p>
          )}

          {loading ? (
            <p className="mt-6 text-[13px] text-muted-foreground">Loading...</p>
          ) : current ? (
            <div className="mt-5 space-y-4">
              {current.summary.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-[13px] leading-relaxed text-foreground/80">
                  {paragraph}
                </p>
              ))}
              <p className="text-[11px] text-muted-foreground/50">
                Generated {formatDate(current.generated_at)}
              </p>
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center py-8 text-center">
              <p className="text-[13px] text-muted-foreground/60">No insight generated yet</p>
              <p className="mt-1.5 text-[12px] text-muted-foreground/40">
                Generate your first weekly metabolic insight.
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating || !preview}
            className="mt-5 w-full bg-foreground py-2.5 text-[12px] font-medium tracking-wide text-background disabled:opacity-50"
          >
            {generating ? "Generating..." : current ? "Regenerate insight" : (preview ? "Generate insight" : "Review AI payload to continue")}
          </button>
        </div>

        {history.length > 0 && (
          <div className="border border-border p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
              History
            </p>
            <div className="mt-4">
              {history.map((insight) => (
                <details key={insight.id} className="group border-b border-border last:border-0">
                  <summary className="flex cursor-pointer items-center justify-between py-4 text-[13px] text-foreground [&::-webkit-details-marker]:hidden">
                    <span>Week of {formatDate(insight.week_start)}</span>
                    <span className="text-[11px] text-muted-foreground/60">{formatDate(insight.generated_at)}</span>
                  </summary>
                  <div className="pb-4 space-y-3">
                    {insight.summary.split("\n\n").map((p, i) => (
                      <p key={i} className="text-[13px] leading-relaxed text-foreground/70">
                        {p}
                      </p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
