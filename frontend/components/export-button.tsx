const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export function ExportButton({ fromDate, toDate }: { fromDate?: string; toDate?: string }) {
  const params = new URLSearchParams()
  if (fromDate) params.set("from_date", fromDate)
  if (toDate) params.set("to_date", toDate)
  const query = params.toString()
  const href = `${API_BASE}/export/csv${query ? `?${query}` : ""}`

  return (
    <a
      href={href}
      className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-[11px] tracking-[0.04em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
    >
      <span aria-hidden="true">↓</span>
      Export CSV
    </a>
  )
}
