import { FastingStatus } from "@/components/log-async-widgets"

import { API_BASE } from "@/lib/config"
const targets = [12, 16, 18, 24]

export default function FastingPage() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <form action={`${API_BASE}/fasting/start/form`} method="post" className="border border-border p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
          Fasting Timer
        </p>

        <div className="mt-5">
          <p className="text-[13px] text-muted-foreground">
            Track how fasting affects your glucose levels.
          </p>

          <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            Target duration
          </p>
          <div className="mt-3 flex gap-2">
            {targets.map((target) => (
              <label key={target} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="target_hours"
                  value={target}
                  defaultChecked={target === 16}
                  className="peer sr-only"
                />
                <span className="block border border-border py-2 text-center text-[12px] tracking-[0.04em] text-muted-foreground transition-colors hover:border-foreground/30 peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                  {target}h
                </span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="mt-6 w-full bg-foreground py-2.5 text-[12px] font-medium tracking-wide text-background"
          >
            Start fast
          </button>
        </div>
      </form>

      <FastingStatus />
    </div>
  )
}
