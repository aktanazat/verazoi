import Link from "next/link"
import { AppDataProvider, ErrorBoundary } from "@/components/stability-score"
import { AppSidebar } from "@/components/app-sidebar"

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
        <AppSidebar />

        <header className="border-b border-border px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between">
            <Link href="/" className="font-serif text-[22px] font-light tracking-wide text-foreground">
              Verazoi
            </Link>
            <span className="text-[12px] text-muted-foreground">Demo</span>
          </div>
        </header>

        <AppDataProvider>
          <main className="px-5 pb-20 pt-6 md:pb-10 md:pl-[80px] md:pr-6 md:pt-8">
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
