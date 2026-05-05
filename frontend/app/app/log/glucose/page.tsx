const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

const timings = [
  { value: "fasting", label: "Fasting" },
  { value: "before", label: "Pre-meal" },
  { value: "after", label: "Post-meal" },
]

export default function GlucoseLogPage() {
  return (
    <form action={`${API_BASE}/glucose/form`} method="post">
      <div className="mb-5 flex justify-end">
        <button
          type="submit"
          className="border border-foreground bg-foreground px-6 py-2 text-[12px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85"
        >
          Save reading
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="border border-border p-6">
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Reading</p>
          <div className="mt-4 flex items-center gap-3">
            <input
              type="number"
              name="value"
              min={20}
              max={500}
              required
              placeholder="0"
              className="w-full bg-transparent font-serif text-[36px] font-light leading-none text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
            <span className="shrink-0 text-[14px] text-muted-foreground">mg/dL</span>
          </div>
          <div className="mt-5">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Timing</p>
            <div className="mt-3 flex gap-2">
              {timings.map((timing) => (
                <label key={timing.value} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="timing"
                    value={timing.value}
                    defaultChecked={timing.value === "fasting"}
                    className="peer sr-only"
                  />
                  <span className="block border border-border py-2.5 text-center text-[12px] capitalize tracking-[0.04em] text-muted-foreground transition-colors hover:border-foreground/30 peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                    {timing.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-border p-6">
          <div className="flex items-center justify-between">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Today</p>
            <p className="text-[12px] text-muted-foreground/80">Saved to timeline</p>
          </div>
          <div className="mt-4 flex flex-col items-center py-8 text-center">
            <p className="text-[13px] text-muted-foreground/60">Glucose readings save instantly.</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground/40">Return to the dashboard timeline to review trends and spike risk.</p>
          </div>
        </div>
      </div>
    </form>
  )
}
