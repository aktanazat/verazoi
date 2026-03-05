"use client"

import { useEffect, useState } from "react"
import { HowItWorks } from "@/components/how-it-works"
import { StabilityExplainer } from "@/components/stability-explainer"
import { ScoreDemo } from "@/components/score-demo"
import { StartupFeatures } from "@/components/startup-features"

type ContentTab = "preview" | "details"

const detailHashes = new Set(["#how-it-works", "#stability-score", "#designed-for"])

export function PageSectionsTabs() {
  const [activeTab, setActiveTab] = useState<ContentTab>("preview")

  useEffect(() => {
    const syncWithAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const anchor = target?.closest("a[href^='#']") as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute("href")
      if (href && detailHashes.has(href)) {
        setActiveTab("details")
      }
    }

    setActiveTab("preview")
    if (detailHashes.has(window.location.hash)) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`)
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })

    const onHashChange = () => {
      if (detailHashes.has(window.location.hash)) {
        setActiveTab("details")
      }
    }

    window.addEventListener("hashchange", onHashChange)
    document.addEventListener("click", syncWithAnchorClick)
    return () => {
      window.removeEventListener("hashchange", onHashChange)
      document.removeEventListener("click", syncWithAnchorClick)
    }
  }, [])

  useEffect(() => {
    if (activeTab !== "details" || !window.location.hash) return
    requestAnimationFrame(() => {
      const target = document.querySelector(window.location.hash)
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    })
  }, [activeTab])

  return (
    <>
      <section id="quick-view" className="px-6 pb-8 pt-6 lg:pb-12">
        <div className="mx-auto max-w-screen-lg">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card/70 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`rounded-full px-4 py-2 text-[12px] tracking-[0.02em] transition-colors ${
                  activeTab === "preview" ? "bg-primary/12 text-primary" : "text-muted-foreground"
                }`}
              >
                App Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`rounded-full px-4 py-2 text-[12px] tracking-[0.02em] transition-colors ${
                  activeTab === "details" ? "bg-primary/12 text-primary" : "text-muted-foreground"
                }`}
              >
                How It Works
              </button>
            </div>
          </div>
        </div>
      </section>

      {activeTab === "preview" ? (
        <StartupFeatures />
      ) : (
        <>
          <HowItWorks />
          <StabilityExplainer />
          <ScoreDemo />
        </>
      )}

    </>
  )
}
