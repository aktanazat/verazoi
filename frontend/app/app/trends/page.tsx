import { TrendsContent } from "@/components/trends-content"

export default function TrendsPage() {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Analytics
      </p>
      <h1 className="mt-1.5 font-serif text-[30px] font-light leading-tight text-foreground">
        Trends
      </h1>
      <TrendsContent />
    </div>
  )
}
