import { InsightsContent } from "@/components/insights-content"

export default function InsightsPage() {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Intelligence
      </p>
      <h1 className="mt-1.5 font-serif text-[30px] font-light leading-tight text-foreground">
        Insights
      </h1>
      <InsightsContent />
    </div>
  )
}
