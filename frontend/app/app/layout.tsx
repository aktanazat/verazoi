import Link from "next/link"
import { AppDataProvider, ErrorBoundary } from "@/components/stability-score"

const navItems = [
  { label: "Dashboard", href: "/app/dashboard", token: "D" },
  { label: "Log", href: "/app/log/glucose", token: "L" },
  { label: "Trends", href: "/app/trends", token: "T" },
  { label: "Insights", href: "/app/insights", token: "AI" },
]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <div className="min-h-dvh bg-background">
        <header className="fixed inset-x-0 top-0 z-50 hidden border-b border-border/50 bg-background/80 backdrop-blur-2xl md:block">
          <nav className="relative mx-auto flex max-w-screen-lg items-center justify-between px-6 py-5">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-[22px] font-light tracking-wide text-foreground">Verazoi</span>
            </Link>

            <div className="pointer-events-none absolute inset-x-0 flex justify-center">
              <div className="pointer-events-auto flex items-center gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    scroll={false}
                    className="rounded-full px-3 py-1.5 text-[12px] tracking-[0.03em] text-muted-foreground/70 transition-colors duration-300 hover:bg-primary/10 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <span className="text-[11px] tracking-[0.1em] text-muted-foreground">Demo</span>
          </nav>
        </header>

        <header className="border-b border-border px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between">
            <Link href="/" className="font-serif text-[22px] font-light tracking-wide text-foreground">
              Verazoi
            </Link>
            <span className="text-[12px] text-muted-foreground">Demo</span>
          </div>
        </header>

        <AppDataProvider>
          <main className="mx-auto max-w-screen-lg px-5 pb-20 pt-6 md:px-6 md:pb-8 md:pt-24">
            {children}
          </main>
        </AppDataProvider>

        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm md:hidden">
          <div className="mx-auto flex max-w-md">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                scroll={false}
                className="flex flex-1 flex-col items-center gap-1 py-3 text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                <span className="text-[10px] font-medium uppercase tracking-[0.08em]">{item.token}</span>
                <span className="text-[10px] tracking-[0.02em]">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </ErrorBoundary>
  )
}
