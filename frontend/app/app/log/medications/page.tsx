import { API_BASE } from "@/lib/config"

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

export default function MedicationsLogPage() {
  return (
    <form action={`${API_BASE}/medications/form`} method="post">
      <div className="mb-4 flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-foreground px-5 py-2 text-[12px] font-medium tracking-[0.02em] text-background transition-colors hover:bg-foreground/90"
        >
          Save medication
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">Medication</p>
          <input
            type="text"
            name="name"
            required
            placeholder="Medication name"
            className="mt-3 w-full rounded-full border border-border bg-background/60 px-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-foreground/40 focus:outline-none"
          />

          <div className="mt-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">Dose</p>
            <div className="mt-3 flex items-baseline gap-3">
              <input
                type="number"
                name="dose_value"
                step="any"
                min={0}
                required
                placeholder="0"
                className="w-full bg-transparent font-serif text-[36px] font-light leading-none text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
              />
              <div className="flex shrink-0 gap-1.5">
                {doseUnits.map((unit) => (
                  <label key={unit} className="cursor-pointer">
                    <input
                      type="radio"
                      name="dose_unit"
                      value={unit}
                      defaultChecked={unit === "mg"}
                      className="peer sr-only"
                    />
                    <span className="block rounded-full border border-border bg-background/60 px-3 py-1 text-[12px] tracking-[0.02em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                      {unit}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">Timing</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {timings.map((timing) => (
                <label key={timing} className="cursor-pointer">
                  <input
                    type="radio"
                    name="timing"
                    value={timing}
                    defaultChecked={timing === "morning"}
                    className="peer sr-only"
                  />
                  <span className="block rounded-full border border-border bg-background/60 px-3 py-1.5 text-[12px] tracking-[0.02em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                    {timingLabels[timing]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">Notes (optional)</p>
            <textarea
              name="notes"
              placeholder="Side effects, observations..."
              rows={3}
              className="mt-3 w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-foreground/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">Recent</p>
            <span className="rounded-full border border-primary/20 bg-primary/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-primary">Saved</span>
          </div>
          <div className="mt-6 flex flex-col items-center py-6 text-center">
            <p className="text-[13px] leading-relaxed text-muted-foreground">Medication logs save instantly.</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground/50">Return to the dashboard timeline to review intake history.</p>
          </div>
        </div>
      </div>
    </form>
  )
}
