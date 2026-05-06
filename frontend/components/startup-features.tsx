import { StartupFeaturesShowcase } from "@/components/startup-features-showcase"

export function StartupFeatures() {
  return (
    <section className="relative px-6 py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-screen-lg">
        <div className="text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/70">
            Inside the App
          </p>
          <h2 className="mx-auto mt-6 max-w-xl text-balance font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1]">
            <span className="text-gradient">Personalized</span>{" "}
            <span className="italic text-foreground">at every layer.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Every screen adapts to your data, your habits, and your goals.
          </p>
        </div>

        <StartupFeaturesShowcase />
      </div>
    </section>
  )
}
