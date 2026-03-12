"use client"

import { useState } from "react"

const schemes = [
  {
    name: "Current -- Warm Neutral",
    description: "Minimal beige/cream. Clean but not distinctive.",
    bg: "#f5f1ec",
    fg: "#2a2520",
    muted: "#8a8078",
    border: "#e0d8ce",
    accent: "#2a2520",
    accentFg: "#f5f1ec",
  },
  {
    name: "Deep Teal",
    description: "Clinical warmth. Trust, health, clarity.",
    bg: "#f6f7f6",
    fg: "#1a2f2f",
    muted: "#6b8080",
    border: "#d4dede",
    accent: "#1a6b5a",
    accentFg: "#ffffff",
  },
  {
    name: "Sage + Cream",
    description: "Organic, natural. Wellness-forward.",
    bg: "#f5f3ee",
    fg: "#2d3a2e",
    muted: "#7a8672",
    border: "#d8ddd0",
    accent: "#4a6a4a",
    accentFg: "#f5f3ee",
  },
  {
    name: "Deep Navy + Gold",
    description: "Premium, authoritative. Science-first.",
    bg: "#f8f7f4",
    fg: "#141c2e",
    muted: "#6a7088",
    border: "#d8d9e0",
    accent: "#141c2e",
    accentFg: "#c8a960",
  },
  {
    name: "Indigo Vitals",
    description: "Modern tech-health. AI-forward.",
    bg: "#f4f4f8",
    fg: "#1e1b3a",
    muted: "#7571a0",
    border: "#d8d6e8",
    accent: "#4f46a0",
    accentFg: "#ffffff",
  },
  {
    name: "Warm Terracotta",
    description: "Distinctive, human-centered health.",
    bg: "#faf5f0",
    fg: "#2e2018",
    muted: "#9a7e68",
    border: "#e4d5c8",
    accent: "#b05a3a",
    accentFg: "#faf5f0",
  },
]

function MiniHero({ scheme }: { scheme: (typeof schemes)[number] }) {
  return (
    <div
      className="flex flex-col items-center rounded-xl p-8 transition-all"
      style={{ background: scheme.bg, color: scheme.fg }}
    >
      <p
        className="text-[10px] font-medium uppercase tracking-[0.3em]"
        style={{ color: scheme.muted }}
      >
        Metabolic Intelligence
      </p>
      <h2
        className="mt-3 text-center font-serif text-[28px] font-light leading-[1.1]"
        style={{ color: scheme.fg }}
      >
        Know your glucose.
        <br />
        <span className="italic">Own your health.</span>
      </h2>
      <p
        className="mt-3 max-w-[260px] text-center text-[11px] leading-relaxed"
        style={{ color: scheme.muted }}
      >
        Verazoi uses machine learning to predict glucose stability and spike
        risk from your daily habits.
      </p>
      <div className="mt-5 flex gap-3">
        <button
          className="rounded-full px-5 py-2 text-[11px] font-medium tracking-wide transition-opacity hover:opacity-85"
          style={{
            background: scheme.accent,
            color: scheme.accentFg,
          }}
        >
          Request early access
        </button>
        <button
          className="rounded-full px-4 py-2 text-[11px] tracking-wide"
          style={{
            border: `1px solid ${scheme.border}`,
            color: scheme.muted,
          }}
        >
          How it works
        </button>
      </div>

      <div
        className="mt-6 flex w-full gap-3"
        style={{ borderTop: `1px solid ${scheme.border}`, paddingTop: "16px" }}
      >
        {[
          { v: "88%", l: "metabolically unhealthy" },
          { v: "10+", l: "years undiagnosed" },
          { v: "73%", l: "spikes unnoticed" },
        ].map((s) => (
          <div key={s.v} className="flex-1 text-center">
            <p className="font-serif text-[20px] font-light" style={{ color: scheme.fg }}>
              {s.v}
            </p>
            <p className="text-[9px] leading-tight" style={{ color: scheme.muted }}>
              {s.l}
            </p>
          </div>
        ))}
      </div>

      <div
        className="mt-5 flex w-full flex-col items-center gap-3"
        style={{ borderTop: `1px solid ${scheme.border}`, paddingTop: "16px" }}
      >
        <div className="flex w-full max-w-[220px] items-center gap-2">
          <div
            className="h-[1px] flex-1"
            style={{ background: scheme.border }}
          />
          <p className="text-[10px]" style={{ color: scheme.muted }}>
            name@email.com
          </p>
          <div
            className="h-[1px] flex-1"
            style={{ background: scheme.border }}
          />
        </div>
        <button
          className="rounded-full px-5 py-1.5 text-[10px] font-medium"
          style={{
            background: scheme.accent,
            color: scheme.accentFg,
          }}
        >
          Join waitlist
        </button>
      </div>

      <p
        className="mt-6 text-center font-serif text-[18px] font-light italic leading-[1.2]"
        style={{ color: scheme.fg }}
      >
        This is metabolic
        <br />
        intelligence.
      </p>
    </div>
  )
}

function ColorRow({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-6 w-6 shrink-0 rounded-full border border-black/10"
        style={{ background: color }}
      />
      <div className="flex flex-col">
        <span className="text-[11px] text-neutral-500">{label}</span>
        <span className="font-mono text-[11px] text-neutral-700">{color}</span>
      </div>
    </div>
  )
}

export default function PreviewPage() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-center font-serif text-[36px] font-light text-neutral-900">
          Verazoi Color Schemes
        </h1>
        <p className="mt-2 text-center text-[14px] text-neutral-500">
          Click a scheme to see it enlarged. Compare how each feels across the
          full landing page.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {schemes.map((scheme, i) => (
            <div
              key={scheme.name}
              onClick={() => setSelected(selected === i ? null : i)}
              className={`cursor-pointer rounded-2xl border p-5 transition-all hover:shadow-lg ${
                selected === i
                  ? "ring-2 ring-neutral-900 shadow-lg"
                  : "border-neutral-200"
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-[14px] font-medium text-neutral-900">
                    {scheme.name}
                  </h3>
                  <p className="mt-0.5 text-[12px] text-neutral-500">
                    {scheme.description}
                  </p>
                </div>
                {i === 0 && (
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500">
                    current
                  </span>
                )}
              </div>

              <MiniHero scheme={scheme} />

              <div className="mt-4 grid grid-cols-3 gap-2">
                <ColorRow label="BG" color={scheme.bg} />
                <ColorRow label="Text" color={scheme.fg} />
                <ColorRow label="Accent" color={scheme.accent} />
                <ColorRow label="Muted" color={scheme.muted} />
                <ColorRow label="Border" color={scheme.border} />
                <ColorRow label="Accent FG" color={scheme.accentFg} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
