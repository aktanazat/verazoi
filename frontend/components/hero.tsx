import Link from "next/link"
import Image from "next/image"
import { basePath } from "@/lib/assets"

export function Hero() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 pt-20 lg:min-h-[78dvh]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[150px]" />
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-primary/[0.05] blur-[120px]" />
        <div className="absolute -left-40 bottom-40 h-[400px] w-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--border)_1px,_transparent_1px)] [background-size:48px_48px] opacity-30" />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Phase 1 & 2: "This is metabolic intelligence" shrinks away */}
        <div
          className="hero-intro-animation"
        >
          <h1 className="font-serif text-[clamp(3.5rem,8vw,6.5rem)] font-light leading-[0.95] tracking-tight">
            <span className="text-gradient">This is metabolic</span>
            <br />
            <span className="italic text-foreground">intelligence.</span>
          </h1>
        </div>

        {/* Phase 3: Verazoi brand emerges */}
        <div
          className="hero-brand-animation"
        >
          <div>
            <Image src={`${basePath}/images/verazoi_logo_top.svg`} alt="Verazoi" width={420} height={140} className="mx-auto block h-auto w-[280px] md:w-[320px]" />
          </div>
          <div className="mx-auto mt-4 h-[2px] w-16 rounded-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <p className="mx-auto mt-8 max-w-lg text-[clamp(1.1rem,2.2vw,1.35rem)] leading-relaxed text-muted-foreground">
            Predictive metabolic intelligence. Your CGM data becomes a Stability Score and projected next steps.
          </p>

          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-primary/50">
            From <span className="font-serif italic text-primary/70">Vera</span> (truth) and{" "}
            <span className="font-serif italic text-primary/70">Zoi</span> (life)
          </p>

          <div className="mt-10 flex justify-center">
            <Link
              href="/early-access"
              className="group relative overflow-hidden rounded-full bg-primary px-8 py-3.5 text-[13px] font-medium tracking-[0.04em] text-primary-foreground transition-all duration-300 hover:shadow-xl hover:shadow-primary/25"
            >
              <span className="relative z-10">Get early access</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          </div>
        </div>
      </div>

      <div
        className="hero-arrow-animation absolute inset-x-0 bottom-10 flex justify-center"
      >
        <a href="#overview" className="group">
          <span className="inline-block animate-bounce text-[18px] text-muted-foreground/40 transition-colors group-hover:text-muted-foreground">↓</span>
        </a>
      </div>
    </section>
  )
}
