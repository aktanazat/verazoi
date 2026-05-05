import { TrendsContent } from "@/components/trends-content"

export default function TrendsPage() {
  return (
    <div>
      <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Analytics
      </p>
      <h1 className="mt-3 font-serif text-[28px] font-light text-foreground">
        Trends
      </h1>
      <TrendsContent />
    </div>
  )
}
