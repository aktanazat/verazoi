
export function OurStory() {
  const visible = true

  return (
    <section id="our-story" className="relative px-6 py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[120px]" />
      </div>

      <div className="mx-auto max-w-screen-lg">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div
            className={`transition-all duration-700 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/60">
              Our Story
            </p>
            <h2 className="mt-6 font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-balance">
              <span className="text-gradient">Built from</span>{" "}
              <span className="text-foreground">lived experience.</span>
            </h2>
          </div>

          <div
            className={`flex flex-col justify-center gap-6 transition-all delay-150 duration-700 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Verazoi started when we realized the gap between wearing a CGM and actually understanding what it means. The data was there -- glucose spikes, dips, trends -- but no clear way to connect it to daily decisions.
            </p>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              We built the system we wanted: one that takes raw glucose data and behavioral inputs, then produces a single structured score with projected next steps. Not generic advice. Personalized clarity, grounded in your patterns.
            </p>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              The name comes from <span className="font-serif italic text-primary/70">Vera</span> (truth) and <span className="font-serif italic text-primary/70">Zoi</span> (life). Truth about your metabolic life -- structured, actionable, and yours.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
