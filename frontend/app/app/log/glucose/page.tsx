import { API_BASE } from "@/lib/config"

const timings = [
  { value: "fasting", label: "Fasting" },
  { value: "before", label: "Pre-meal" },
  { value: "after", label: "Post-meal" },
]

export default function GlucoseLogPage() {
  return (
    <form action={`${API_BASE}/glucose/form`} method="post">
      <div className="mb-4 flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-foreground px-5 py-2 text-[12px] font-medium tracking-[0.02em] text-background transition-colors hover:bg-foreground/90"
        >
          Save reading
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">Reading</p>
          <div className="mt-4 flex items-baseline gap-3">
            <input
              type="number"
              name="value"
              min={20}
              max={500}
              required
              placeholder="0"
              className="w-full bg-transparent font-serif text-[44px] font-light leading-none text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
            />
            <span className="shrink-0 text-[13px] text-muted-foreground">mg/dL</span>
          </div>
          <div className="mt-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">Timing</p>
            <div className="mt-2.5 flex gap-1.5">
              {timings.map((timing) => (
                <label key={timing.value} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="timing"
                    value={timing.value}
                    defaultChecked={timing.value === "fasting"}
                    className="peer sr-only"
                  />
                  <span className="block rounded-full border border-border bg-background/60 py-1.5 text-center text-[12px] tracking-[0.02em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                    {timing.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">Today</p>
            <span className="rounded-full border border-primary/20 bg-primary/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-primary">Saved</span>
          </div>
          <div className="mt-6 flex flex-col items-center py-6 text-center">
            <p className="text-[13px] leading-relaxed text-muted-foreground">Glucose readings save instantly.</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground/50">Return to the dashboard timeline to review trends and spike risk.</p>
          </div>
        </div>
      </div>
    </form>
  )
}
