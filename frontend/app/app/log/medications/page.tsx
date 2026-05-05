const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

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
      <div className="mb-5 flex justify-end">
        <button
          type="submit"
          className="border border-foreground bg-foreground px-6 py-2 text-[12px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85"
        >
          Save medication
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="border border-border p-6">
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Medication</p>
          <input
            type="text"
            name="name"
            required
            placeholder="Medication name"
            className="mt-3 w-full border border-border bg-transparent px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-foreground/30 focus:outline-none"
          />

          <div className="mt-5">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Dose</p>
            <div className="mt-3 flex gap-3">
              <div className="flex flex-1 items-center gap-3">
                <input
                  type="number"
                  name="dose_value"
                  step="any"
                  min={0}
                  required
                  placeholder="0"
                  className="w-full bg-transparent font-serif text-[32px] font-light leading-none text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                {doseUnits.map((unit) => (
                  <label key={unit} className="cursor-pointer">
                    <input
                      type="radio"
                      name="dose_unit"
                      value={unit}
                      defaultChecked={unit === "mg"}
                      className="peer sr-only"
                    />
                    <span className="block border border-border px-3.5 py-2 text-[12px] tracking-[0.04em] text-muted-foreground transition-colors hover:border-foreground/30 peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                      {unit}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Timing</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {timings.map((timing) => (
                <label key={timing} className="cursor-pointer">
                  <input
                    type="radio"
                    name="timing"
                    value={timing}
                    defaultChecked={timing === "morning"}
                    className="peer sr-only"
                  />
                  <span className="block border border-border px-3.5 py-2 text-[12px] tracking-[0.02em] text-muted-foreground transition-colors hover:border-foreground/30 peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                    {timingLabels[timing]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Notes (optional)</p>
            <textarea
              name="notes"
              placeholder="Side effects, observations..."
              rows={3}
              className="mt-3 w-full resize-none border border-border bg-transparent px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-foreground/30 focus:outline-none"
            />
          </div>
        </div>

        <div className="border border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground/70">Now</span>
              <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Recent</p>
            </div>
            <p className="text-[12px] text-muted-foreground/80">Saved to timeline</p>
          </div>
          <div className="mt-4 flex flex-col items-center py-8 text-center">
            <p className="text-[13px] text-muted-foreground/60">Medication logs save instantly.</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground/40">Return to the dashboard timeline to review intake history.</p>
          </div>
        </div>
      </div>
    </form>
  )
}
