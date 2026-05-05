import { InsightsContent } from "@/components/insights-content"

export default function InsightsPage() {
  return (
    <div>
      <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Intelligence
      </p>
      <h1 className="mt-3 font-serif text-[28px] font-light text-foreground">
        Insights
      </h1>
      <InsightsContent />
    </div>
  )
}
