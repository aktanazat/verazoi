const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

const activityTypes = [
  "Walking", "Running", "Cycling", "Weights", "Yoga", "Swimming", "HIIT", "Other",
] as const

const intensities = ["Light", "Moderate", "Intense"] as const

export default function ActivityLogPage() {
  return (
    <form action={`${API_BASE}/activities/form`} method="post">
      <div className="mb-5 flex justify-end">
        <button
          type="submit"
          className="border border-foreground bg-foreground px-6 py-2 text-[12px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85"
        >
          Save activity
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="border border-border p-6">
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Type</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {activityTypes.map((type) => (
              <label key={type} className="cursor-pointer">
                <input
                  type="radio"
                  name="activity_type"
                  value={type}
                  defaultChecked={type === "Walking"}
                  className="peer sr-only"
                />
                <span className="block border border-border px-3.5 py-2 text-[12px] tracking-[0.02em] text-muted-foreground transition-colors hover:border-foreground/30 peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                  {type}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-5">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Duration</p>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                name="duration"
                min={1}
                max={600}
                required
                placeholder="0"
                className="w-full bg-transparent font-serif text-[32px] font-light leading-none text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
              <span className="shrink-0 text-[14px] text-muted-foreground">minutes</span>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Intensity</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {intensities.map((intensity) => (
                <label key={intensity} className="cursor-pointer">
                  <input
                    type="radio"
                    name="intensity"
                    value={intensity}
                    defaultChecked={intensity === "Moderate"}
                    className="peer sr-only"
                  />
                  <span className="block border border-border py-2.5 text-center text-[12px] tracking-[0.04em] text-muted-foreground transition-colors hover:border-foreground/30 peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                    {intensity}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-border p-6">
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Recent activity</p>
          <div className="mt-4 flex flex-col items-center py-8 text-center">
            <p className="text-[13px] text-muted-foreground/60">Activity saves instantly.</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground/40">Return to the dashboard timeline to review your latest movement.</p>
          </div>
        </div>
      </div>
    </form>
  )
}
