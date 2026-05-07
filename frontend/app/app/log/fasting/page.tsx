import { FastingStatus } from "@/components/log-async-widgets"

import { API_BASE } from "@/lib/config"
const targets = [12, 16, 18, 24]

export default function FastingPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form action={`${API_BASE}/fasting/start/form`} method="post" className="rounded-xl border border-border bg-card/40 p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
          Fasting timer
        </p>

        <div className="mt-4">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Track how fasting affects your glucose levels.
          </p>

          <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
            Target duration
          </p>
          <div className="mt-3 flex gap-1.5">
            {targets.map((target) => (
              <label key={target} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="target_hours"
                  value={target}
                  defaultChecked={target === 16}
                  className="peer sr-only"
                />
                <span className="block rounded-full border border-border bg-background/60 py-1.5 text-center text-[12px] tracking-[0.02em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                  {target}h
                </span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-foreground py-2 text-[12px] font-medium tracking-[0.02em] text-background transition-colors hover:bg-foreground/90"
          >
            Start fast
          </button>
        </div>
      </form>

      <FastingStatus />
    </div>
  )
}
