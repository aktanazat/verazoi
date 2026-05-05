import { HowItWorks } from "@/components/how-it-works"
import { StabilityExplainer } from "@/components/stability-explainer"
import { ScoreDemo } from "@/components/score-demo"
import { StartupFeatures } from "@/components/startup-features"

const sectionLinks = [
  { label: "App Preview", href: "#app-preview" },
  { label: "How It Works", href: "#how-it-works" },
]

export function PageSectionsTabs() {
  return (
    <>
      <section id="quick-view" className="px-6 pb-8 pt-6 lg:pb-12">
        <div className="mx-auto max-w-screen-lg">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card/70 p-1">
              {sectionLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-[12px] tracking-[0.02em] text-muted-foreground transition-colors hover:bg-primary/12 hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div id="app-preview">
        <StartupFeatures />
      </div>
      <HowItWorks />
      <StabilityExplainer />
      <ScoreDemo />
    </>
  )
}
