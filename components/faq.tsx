"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

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

function FaqItem({
  q,
  a,
  open,
  onClick,
  delay,
  visible,
}: {
  q: string
  a: string
  open: boolean
  onClick: () => void
  delay: number
  visible: boolean
}) {
  return (
    <div
      className={`border-b border-border/50 transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-[15px] text-foreground">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            {a}
          </p>
        </div>
      </div>
    </div>
  )
}

export function FAQ() {
  const { ref, visible } = useScrollReveal(0.1)
  const [openIndex, setOpenIndex] = useState<number>(0)

  return (
    <section id="faq" className="relative px-6 py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-primary/[0.03] blur-[120px]" />
      </div>

      <div ref={ref} className="mx-auto max-w-screen-lg">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div
            className={`transition-all duration-700 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
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
                open={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                delay={200 + i * 60}
                visible={visible}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
