import { API_BASE } from "@/lib/config"

const qualities = ["poor", "fair", "good", "great"] as const

export default function SleepLogPage() {
  return (
    <form action={`${API_BASE}/sleep/form`} method="post">
      <div className="mb-5 flex justify-end">
        <button
          type="submit"
          className="border border-foreground bg-foreground px-6 py-2 text-[12px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85"
        >
          Save sleep
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="border border-border p-6">
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Hours slept</p>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="number"
              name="hours"
              step="0.5"
              min={0}
              max={24}
              required
              placeholder="0"
              className="w-full bg-transparent font-serif text-[32px] font-light leading-none text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
            <span className="shrink-0 text-[14px] text-muted-foreground">hours</span>
          </div>

          <div className="mt-5">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Quality</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {qualities.map((quality) => (
                <label key={quality} className="cursor-pointer">
                  <input
                    type="radio"
                    name="quality"
                    value={quality}
                    defaultChecked={quality === "good"}
                    className="peer sr-only"
                  />
                  <span className="block border border-border py-2.5 text-center text-[12px] capitalize tracking-[0.04em] text-muted-foreground transition-colors hover:border-foreground/30 peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                    {quality}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-border p-6">
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Recent sleep</p>
          <div className="mt-4 flex flex-col items-center py-8 text-center">
            <p className="text-[13px] text-muted-foreground/60">Sleep saves instantly.</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground/40">Return to the dashboard timeline to review your latest rest entry.</p>
          </div>
        </div>
      </div>
    </form>
  )
}
