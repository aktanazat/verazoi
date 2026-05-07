import { API_BASE } from "@/lib/config"

const activityTypes = [
  "Walking", "Running", "Cycling", "Weights", "Yoga", "Swimming", "HIIT", "Other",
] as const

const intensities = ["Light", "Moderate", "Intense"] as const

export default function ActivityLogPage() {
  return (
    <form action={`${API_BASE}/activities/form`} method="post">
      <div className="mb-4 flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-foreground px-5 py-2 text-[12px] font-medium tracking-[0.02em] text-background transition-colors hover:bg-foreground/90"
        >
          Save activity
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">Type</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activityTypes.map((type) => (
              <label key={type} className="cursor-pointer">
                <input
                  type="radio"
                  name="activity_type"
                  value={type}
                  defaultChecked={type === "Walking"}
                  className="peer sr-only"
                />
                <span className="block rounded-full border border-border bg-background/60 px-3.5 py-1.5 text-[12px] tracking-[0.02em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                  {type}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">Duration</p>
            <div className="mt-3 flex items-baseline gap-3">
              <input
                type="number"
                name="duration"
                min={1}
                max={600}
                required
                placeholder="0"
                className="w-full bg-transparent font-serif text-[40px] font-light leading-none text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
              />
              <span className="shrink-0 text-[13px] text-muted-foreground">minutes</span>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">Intensity</p>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {intensities.map((intensity) => (
                <label key={intensity} className="cursor-pointer">
                  <input
                    type="radio"
                    name="intensity"
                    value={intensity}
                    defaultChecked={intensity === "Moderate"}
                    className="peer sr-only"
                  />
                  <span className="block rounded-full border border-border bg-background/60 py-1.5 text-center text-[12px] tracking-[0.02em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                    {intensity}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">Recent activity</p>
            <span className="rounded-full border border-primary/20 bg-primary/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-primary">Saved</span>
          </div>
          <div className="mt-6 flex flex-col items-center py-6 text-center">
            <p className="text-[13px] leading-relaxed text-muted-foreground">Activity saves instantly.</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground/50">Return to the dashboard timeline to review your latest movement.</p>
          </div>
        </div>
      </div>
    </form>
  )
}
