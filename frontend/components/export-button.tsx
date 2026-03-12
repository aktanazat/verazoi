"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { exportCSV } from "@/lib/api"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("verazoi_token")
}

export function ExportButton({ fromDate, toDate }: { fromDate?: string; toDate?: string }) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    const token = getToken()
    if (!token) return
    setExporting(true)
    try {
      const blob = await exportCSV(token, fromDate, toDate)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `verazoi-export-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // export failed
    }
    setExporting(false)
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-[11px] tracking-[0.04em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
    >
      <Download className="h-3 w-3" strokeWidth={1.5} />
      {exporting ? "Exporting..." : "Export CSV"}
    </button>
  )
}
