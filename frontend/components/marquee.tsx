"use client"

const items = [
  "Stability Score",
  "Predictive Clarity",
  "CGM Intelligence",
  "Personalized Guidance",
  "Projected Impact",
  "Structured Refinement",
]

function MarqueeTrack() {
  return (
    <div className="flex shrink-0 animate-[marquee_30s_linear_infinite] items-center gap-8">
      {items.map((item) => (
        <span key={item} className="flex items-center gap-8 whitespace-nowrap">
          <span className="font-serif text-[15px] font-light tracking-wide text-muted-foreground/40">
            {item}
          </span>
          <span className="h-1 w-1 rounded-full bg-primary/20" />
        </span>
      ))}
    </div>
  )
}

export function Marquee() {
  return (
    <section className="relative overflow-hidden border-y border-border/40 py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div className="flex gap-8">
        <MarqueeTrack />
        <MarqueeTrack />
        <MarqueeTrack />
      </div>
    </section>
  )
}
