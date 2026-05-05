
const testimonials = [
  {
    quote: "I finally understand why my glucose spikes after certain meals. The recommendations are specific to my patterns, not generic advice.",
    name: "Early access user",
    context: "Type 2, CGM user for 6 months",
  },
  {
    quote: "The Stability Score gave me a single number to track instead of staring at glucose graphs I couldn't interpret. That changed everything.",
    name: "Early access user",
    context: "Pre-diabetic, new to CGM",
  },
  {
    quote: "I showed my endocrinologist the projected impact feature. She said it was the first consumer tool that actually aligned with how she thinks about interventions.",
    name: "Early access user",
    context: "Type 1, 10+ years on CGM",
  },
]

export function Testimonials() {
  const visible = true

  return (
    <section id="testimonials" className="relative px-6 py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        <div className="absolute -right-20 top-1/3 h-[400px] w-[400px] rounded-full bg-primary/[0.04] blur-[120px]" />
      </div>

      <div className="mx-auto max-w-screen-lg">
        <div
          className={`text-center transition-all duration-700 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/60">
            From Early Users
          </p>
          <h2 className="mx-auto mt-6 max-w-lg font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-balance">
            <span className="text-gradient">Real people,</span>{" "}
            <span className="text-foreground">real patterns.</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`gradient-border card-premium rounded-2xl bg-card/40 p-6 transition-all duration-700 ease-out ${
                visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${200 + i * 120}ms` }}
            >
              <p className="text-[14px] leading-relaxed text-foreground/90">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 border-t border-border/40 pt-4">
                <p className="text-[13px] font-medium text-foreground">{t.name}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{t.context}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
