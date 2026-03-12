"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, ClipboardPen } from "lucide-react"

const tabs = [
  { label: "Dashboard", href: "/app/dashboard", icon: BarChart3 },
  { label: "Log", href: "/app/log", icon: ClipboardPen },
]

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> }
}

export function AppNav() {
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
    <>
      <header className="border-b border-border px-5 py-4 md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/verazoilogo.svg" alt="Verazoi" width={764} height={536} className="h-[22px] w-auto" />
            <span className="font-serif text-[18px] font-light text-foreground">Verazoi</span>
          </Link>
          <span className="text-[12px] text-muted-foreground">
            Demo
          </span>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm md:hidden">
        <div className="mx-auto flex max-w-md">
          {tabs.map((tab) => {
            const active = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                scroll={false}
                onClick={navigateTab(tab.href)}
                className={`flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground/70"
                }`}
              >
                <tab.icon className="h-[18px] w-[18px]" strokeWidth={active ? 2 : 1.5} />
                <span className="text-[10px] tracking-[0.02em]">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
