"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function AppRouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: reducedMotion ? "auto" : "smooth",
    })
  }, [pathname])

  return (
    <div
      key={pathname}
      className="flex flex-1 flex-col animate-[app-page-enter_320ms_cubic-bezier(0.22,1,0.36,1)] will-change-transform"
    >
      {children}
    </div>
  )
}
