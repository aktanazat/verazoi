import { ExperimentList } from "@/components/log-async-widgets"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export default function ExperimentsPage() {
  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
          Food Experiments
        </p>
        <span className="text-[11px] tracking-[0.04em] text-muted-foreground">
          A/B testing
        </span>
      </div>

      <details className="border border-border p-6">
        <summary className="cursor-pointer list-none text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60 [&::-webkit-details-marker]:hidden">
          New experiment
        </summary>
        <form action={`${API_BASE}/experiments/form`} method="post" className="mt-4">
          <input
            type="text"
            name="name"
            required
            placeholder="Experiment name"
            className="w-full border border-border bg-transparent px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:border-foreground/30 focus:outline-none"
          />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">Food A</label>
              <input
                type="text"
                name="food_a"
                required
                placeholder="e.g. Oatmeal"
                className="mt-1 w-full border border-border bg-transparent px-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:border-foreground/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Food B</label>
              <input
                type="text"
                name="food_b"
                required
                placeholder="e.g. Eggs"
                className="mt-1 w-full border border-border bg-transparent px-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:border-foreground/30 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-foreground py-2 text-[12px] font-medium tracking-wide text-background"
          >
            Create
          </button>
        </form>
      </details>

      <ExperimentList />
    </div>
  )
}
