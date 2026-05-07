import { LogTabs } from "@/components/log-tabs"

export default function LogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Log entry
      </p>
      <h1 className="mt-1.5 font-serif text-[30px] font-light leading-tight text-foreground">
        Log
      </h1>

      <LogTabs />

      <div className="mt-5">{children}</div>
    </div>
  )
}
