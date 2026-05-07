"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { key: "glucose", label: "Glucose", token: "G", href: "/app/log/glucose" },
  { key: "meals", label: "Meals", token: "M", href: "/app/log/meals" },
  { key: "activity", label: "Activity", token: "A", href: "/app/log/activity" },
  { key: "sleep", label: "Sleep", token: "S", href: "/app/log/sleep" },
  { key: "medications", label: "Meds", token: "Rx", href: "/app/log/medications" },
  { key: "fasting", label: "Fasting", token: "F", href: "/app/log/fasting" },
  { key: "experiments", label: "A/B", token: "AB", href: "/app/log/experiments" },
]

export function LogTabs() {
  const pathname = usePathname()
  return (
    <div className="mt-5 flex flex-wrap items-center gap-1.5 rounded-full border border-border/70 bg-card/40 p-1 backdrop-blur-md">
      {tabs.map((tab) => {
        const active = pathname?.startsWith(tab.href)
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] tracking-[0.02em] transition-colors ${
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <span className={`text-[10px] font-medium uppercase tracking-[0.08em] ${active ? "text-background/70" : "text-muted-foreground/70"}`}>
              {tab.token}
            </span>
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
