"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, ClipboardPen, TrendingUp, Sparkles } from "lucide-react"
import { AppDataProvider } from "@/contexts/app-data-context"

const navItems = [
  { label: "Dashboard", href: "/app/dashboard", icon: BarChart3 },
  { label: "Log", href: "/app/log/glucose", icon: ClipboardPen, match: "/app/log" },
  { label: "Trends", href: "/app/trends", icon: TrendingUp },
  { label: "Insights", href: "/app/insights", icon: Sparkles },
]

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> }
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const navigateTab = (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      pathname === href
    ) {
      return
    }

    event.preventDefault()

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const go = () => router.push(href, { scroll: false })

    const documentWithTransition = document as DocumentWithViewTransition
    if (!reducedMotion && documentWithTransition.startViewTransition) {
      documentWithTransition.startViewTransition(go)
      return
    }

    go()
  }

  return (
    <AppDataProvider>
      <div className="min-h-dvh bg-background">
        {/* Desktop top nav — fixed like landing navbar */}
        <header className="fixed inset-x-0 top-0 z-50 hidden border-b border-border/50 bg-background/80 backdrop-blur-2xl md:block">
          <nav className="relative mx-auto flex max-w-screen-lg items-center justify-between px-6 py-5">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-[22px] font-light tracking-wide text-foreground">Verazoi</span>
            </Link>

            <div className="pointer-events-none absolute inset-x-0 flex justify-center">
              <div className="pointer-events-auto flex items-center gap-2">
                {navItems.map((item) => {
                  const active = item.match
                    ? pathname.includes(item.match)
                    : pathname.includes(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      scroll={false}
                      onClick={navigateTab(item.href)}
                      className={`rounded-full px-3 py-1.5 text-[12px] tracking-[0.03em] transition-colors duration-300 ${
                        active
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground/70 hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            <span className="text-[11px] tracking-[0.1em] text-muted-foreground">Demo</span>
          </nav>
        </header>

        {/* Mobile top header */}
        <header className="border-b border-border px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between">
            <Link href="/" className="font-serif text-[22px] font-light tracking-wide text-foreground">
              Verazoi
            </Link>
            <span className="text-[12px] text-muted-foreground">Demo</span>
          </div>
        </header>

        {/* Main content — pt accounts for fixed header on desktop */}
        <main className="mx-auto max-w-screen-lg px-5 pb-20 pt-6 md:px-6 md:pb-8 md:pt-24">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm md:hidden">
          <div className="mx-auto flex max-w-md">
            {navItems.map((item) => {
              const active = item.match
                ? pathname.includes(item.match)
                : pathname.includes(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  scroll={false}
                  onClick={navigateTab(item.href)}
                  className={`flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground/70"
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px]" strokeWidth={active ? 2 : 1.5} />
                  <span className="text-[10px] tracking-[0.02em]">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </AppDataProvider>
  )
}
