const questions = [
  {
    q: "What CGMs does Verazoi support?",
    a: "Verazoi is designed to work with data from popular CGM systems including Dexcom, Libre, and Medtronic. We integrate via standard data exports and are expanding direct sync options.",
  },
  {
    q: "Is the Stability Score medical advice?",
    a: "No. The Stability Score is a structured wellness metric, not a clinical diagnosis. Verazoi provides guidance to help you understand lifestyle patterns. Always consult your physician for clinical decisions.",
  },
  {
    q: "How is the Stability Score calculated?",
    a: "It combines CGM glucose variability, trend consistency, behavioral inputs (meals, sleep, activity, stress), and historical pattern analysis into a single structured measure of glucose predictability.",
  },
  {
    q: "How accurate are the projected impact estimates?",
    a: "Projected impacts are based on patterns observed in your personal data and established metabolic research. They represent estimated improvements and become more personalized over time as you log more data.",
  },
  {
    q: "How is my health data protected?",
    a: "Your data is encrypted end-to-end. We never sell or share your data with third parties. You retain full ownership and can export or delete your data at any time.",
  },
  {
    q: "When will Verazoi be available?",
    a: "We are currently onboarding a small group of early access users. Join the waitlist to reserve your spot and be among the first to use Verazoi.",
  },
]

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  return (
    <details className="group border-b border-border/50" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-left [&::-webkit-details-marker]:hidden">
        <span className="pr-4 text-[15px] text-foreground">{q}</span>
        <span className="text-[18px] leading-none text-muted-foreground/40 transition-transform duration-300 group-open:rotate-45">+</span>
      </summary>
      <div className="pb-5">
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          {a}
        </p>
      </div>
    </details>
  )
}

export function FAQ() {
  return (
    <section id="faq" className="relative px-6 py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-primary/[0.03] blur-[120px]" />
      </div>

      <div className="mx-auto max-w-screen-lg">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/60">
              FAQ
            </p>
            <h2 className="mt-6 font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-foreground text-balance">
              Common questions.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Everything you need to know about Verazoi and the Stability Score.
            </p>
          </div>

          <div>
            {questions.map((item, i) => (
              <FaqItem
                key={item.q}
                q={item.q}
                a={item.a}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
