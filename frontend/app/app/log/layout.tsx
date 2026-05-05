import Link from "next/link"

const tabItems = [
  { key: "glucose", label: "Glucose", token: "G", href: "/app/log/glucose" },
  { key: "meals", label: "Meals", token: "M", href: "/app/log/meals" },
  { key: "activity", label: "Activity", token: "A", href: "/app/log/activity" },
  { key: "sleep", label: "Sleep", token: "S", href: "/app/log/sleep" },
  { key: "medications", label: "Meds", token: "Rx", href: "/app/log/medications" },
  { key: "fasting", label: "Fasting", token: "F", href: "/app/log/fasting" },
  { key: "experiments", label: "A/B", token: "AB", href: "/app/log/experiments" },
]

export default function LogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Log Entry
      </p>
      <h1 className="mt-3 font-serif text-[28px] font-light text-foreground">
        Log
      </h1>

      <div className="mt-6 flex border border-border">
        {tabItems.map((tab, index) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-[13px] tracking-[0.02em] text-muted-foreground transition-colors hover:bg-foreground hover:text-background ${
              index > 0 ? "border-l border-border" : ""
            }`}
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.08em]">{tab.token}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-5">
        {children}
      </div>
    </div>
  )
}
