"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { basePath } from "@/lib/utils"

const links = [
  { label: "Overview", href: "#overview" },
  { label: "App", href: "#quick-view" },
  { label: "Our Story", href: "#our-story" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Team", href: "#team" },
  { label: "FAQ", href: "#faq" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [showCta, setShowCta] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeHref, setActiveHref] = useState(links[0].href)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      setShowCta(window.scrollY > window.innerHeight * 0.6)

      const checkpoint = window.scrollY + 140
      let nextActive = links[0].href

      for (const link of links) {
        const section = document.getElementById(link.href.slice(1))
        if (section && section.offsetTop <= checkpoint) {
          nextActive = link.href
        }
      }

      if (window.location.hash !== nextActive) {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextActive}`)
      }

      setActiveHref((current) => (current === nextActive ? current : nextActive))
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-2xl border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <nav className="relative mx-auto flex max-w-screen-lg items-center justify-between px-6 py-5">
        <Link href="/">
          <Image src={`${basePath}/images/verazoilogo.svg`} alt="Verazoi" width={764} height={536} className="h-7 w-auto" />
        </Link>

        <div className="pointer-events-none absolute inset-x-0 hidden justify-center md:flex">
          <div className="pointer-events-auto flex items-center gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setActiveHref(l.href)}
                className={`rounded-full px-3 py-1.5 text-[12px] tracking-[0.03em] transition-colors duration-300 ${
                  activeHref === l.href
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground/70 hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-[13px] tracking-[0.02em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/early-access"
            className={`group relative hidden overflow-hidden rounded-full bg-primary px-5 py-2 text-[13px] tracking-[0.02em] text-primary-foreground transition-all duration-500 hover:shadow-lg hover:shadow-primary/20 md:inline-flex ${
              showCta ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none"
            }`}
          >
            <span className="relative z-10">Get early access</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
          <div className="md:hidden">
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </button>
          </div>
        </div>
      </nav>

      {open && (
        <div className="bg-background/95 backdrop-blur-2xl border-b border-border/50 md:hidden">
          <div className="flex flex-col px-6 pb-6 pt-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => {
                  setActiveHref(l.href)
                  setOpen(false)
                }}
                className={`rounded-xl py-3 text-[14px] ${
                  activeHref === l.href ? "text-primary" : "text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-4 py-3 text-center text-[13px] tracking-[0.02em] text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/early-access"
              onClick={() => setOpen(false)}
              className="rounded-full bg-primary px-5 py-3 text-center text-[13px] tracking-[0.02em] text-primary-foreground"
            >
              Get early access
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
