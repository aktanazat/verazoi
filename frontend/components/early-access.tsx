"use client"

import { useState } from "react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

export function EarlyAccess() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const { ref, visible } = useScrollReveal(0.1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
    }
  }

  return (
    <section id="early-access" className="relative px-6 py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[120px]" />
      </div>

      <div ref={ref} className="mx-auto max-w-screen-lg">
        <div
          className={`mx-auto max-w-xl text-center transition-all duration-700 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/60">
            Early Access
          </p>
          <h2 className="mt-6 font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-balance">
            <span className="text-gradient">Turn your CGM data</span>{" "}
            <span className="text-foreground">into meaningful stability guidance.</span>
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
            Early users only. Enter your email to reserve a spot.
          </p>

          {submitted ? (
            <div className="mt-12 gradient-border rounded-2xl bg-card/50 p-8">
              <p className="font-serif text-[20px] font-light text-foreground">
                {"You're on the list."}
              </p>
              <p className="mt-3 text-[14px] text-muted-foreground">
                {"We'll be in touch soon with your access details."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-12">
              <div className="mx-auto flex max-w-xs flex-col items-center gap-6">
                <input
                  type="text"
                  inputMode="email"
                  autoComplete="off"
                  name="waitlist-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  required
                  pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                  className="w-full border-0 border-b border-border bg-transparent pb-3 text-center font-serif text-[18px] text-foreground placeholder:text-muted-foreground/30 focus:border-primary/40 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="group relative overflow-hidden rounded-full bg-primary px-10 py-3 text-[13px] font-medium tracking-[0.04em] text-primary-foreground transition-all duration-300 hover:shadow-xl hover:shadow-primary/25"
                >
                  <span className="relative z-10">Join early access</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>
              </div>
              <p className="mt-6 text-[12px] text-muted-foreground/40">
                No spam.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
