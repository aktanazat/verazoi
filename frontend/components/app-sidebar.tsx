"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { basePath } from "@/lib/assets"

type Item = { label: string; href: string; icon: (props: { className?: string }) => React.ReactElement }

function IconHome({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 7 8 3l5.5 4v6.2c0 .4-.3.8-.8.8H3.3c-.5 0-.8-.4-.8-.8z" />
      <path d="M6.5 14V9.6h3V14" />
    </svg>
  )
}

function IconLog({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className={className}>
      <path d="M8 3.2v9.6M3.2 8h9.6" />
    </svg>
  )
}

function IconTrends({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 11.5 6 8l2.5 2.5L13.5 5" />
      <path d="M10 5h3.5v3.5" />
    </svg>
  )
}

function IconInsights({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="8" r="2.2" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
    </svg>
  )
}

const items: Item[] = [
  { label: "Dashboard", href: "/app/dashboard", icon: IconHome },
  { label: "Log", href: "/app/log/glucose", icon: IconLog },
  { label: "Trends", href: "/app/trends", icon: IconTrends },
  { label: "Insights", href: "/app/insights", icon: IconInsights },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const closeTimer = useRef<number | null>(null)

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (e.clientX <= 56 && !expanded) {
        if (closeTimer.current) {
          window.clearTimeout(closeTimer.current)
          closeTimer.current = null
        }
        setExpanded(true)
      }
    }
    window.addEventListener("mousemove", onMouseMove)
    return () => window.removeEventListener("mousemove", onMouseMove)
  }, [expanded])

  function handleEnter() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setExpanded(true)
  }

  function handleLeave() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setExpanded(false), 200)
  }

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/")

  return (
    <aside
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      data-expanded={expanded}
      className="group fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col overflow-hidden rounded-[22px] border border-border/60 bg-card/55 p-1.5 backdrop-blur-2xl transition-[width,box-shadow] duration-300 ease-out md:flex"
      style={{
        width: expanded ? 196 : 52,
        boxShadow: expanded
          ? "0 24px 60px -28px oklch(0 0 0 / 0.18), 0 2px 8px -4px oklch(0 0 0 / 0.06)"
          : "0 8px 24px -16px oklch(0 0 0 / 0.12)",
      }}
    >
      <Link
        href="/"
        title={expanded ? undefined : "Verazoi"}
        className="flex h-10 items-center gap-2.5 rounded-[14px] px-1.5 text-foreground transition-colors hover:bg-muted/50"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center">
          <Image
            src={`${basePath}/images/verazoilogo.svg`}
            alt="Verazoi"
            width={28}
            height={28}
            className="h-7 w-7"
            priority
          />
        </span>
        <span
          className="whitespace-nowrap font-serif text-[16px] font-light tracking-wide transition-opacity duration-200"
          style={{ opacity: expanded ? 1 : 0 }}
        >
          Verazoi
        </span>
      </Link>

      <div className="mt-1 h-px w-full bg-border/50" />

      <nav className="mt-1 flex flex-col gap-0.5">
        {items.map((item) => (
          <NavRow key={item.href} item={item} active={isActive(item.href)} expanded={expanded} />
        ))}
      </nav>
    </aside>
  )
}

function NavRow({ item, active, expanded }: { item: Item; active: boolean; expanded: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      scroll={false}
      title={expanded ? undefined : item.label}
      className={`flex h-10 items-center gap-2.5 rounded-[14px] px-2 transition-colors ${
        active
          ? "bg-foreground/[0.06] text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      }`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center text-foreground/75">
        <Icon className="h-[16px] w-[16px]" />
      </span>
      <span
        className="whitespace-nowrap text-[13px] transition-opacity duration-150"
        style={{ opacity: expanded ? 1 : 0 }}
      >
        {item.label}
      </span>
    </Link>
  )
}
