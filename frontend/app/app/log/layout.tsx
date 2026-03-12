"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Droplets, Utensils, Footprints, Moon, Pill } from "lucide-react"

const tabItems = [
  { key: "glucose", label: "Glucose", icon: Droplets, href: "/app/log/glucose" },
  { key: "meals", label: "Meals", icon: Utensils, href: "/app/log/meals" },
  { key: "activity", label: "Activity", icon: Footprints, href: "/app/log/activity" },
  { key: "sleep", label: "Sleep", icon: Moon, href: "/app/log/sleep" },
  { key: "medications", label: "Meds", icon: Pill, href: "/app/log/medications" },
]

export default function LogLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div>
      <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Log Entry
      </p>
      <h1 className="mt-3 font-serif text-[28px] font-light text-foreground">
        Log
      </h1>

      <div className="mt-6 flex border border-border">
        {tabItems.map((t, i) => {
          const active = pathname.includes("/log/" + t.key)
          return (
            <Link
              key={t.key}
              href={t.href}
              className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-[13px] tracking-[0.02em] transition-colors ${
                i > 0 ? "border-l border-border" : ""
              } ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">{t.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="mt-5">
        {children}
      </div>
    </div>
  )
}
