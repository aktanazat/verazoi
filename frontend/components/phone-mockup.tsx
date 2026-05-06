import Link from "next/link"
import { AppScreen } from "@/components/phone-mockup-screens"

export function PhoneMockup() {
  return (
    <section id="overview" className="relative overflow-hidden px-6 py-12 lg:py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[160px]" />
      </div>
      <div className="relative mx-auto max-w-screen-lg">
        <div className="flex flex-col items-center">
          <Link
            href="/app/dashboard"
            aria-label="Open the live dashboard demo"
            className="group relative isolate block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-[44px]"
            style={{ perspective: "1400px" }}
          >
            <div
              className="relative z-10 transition-transform duration-700 ease-out [transform:rotateY(-4deg)_rotateX(2deg)] [transform-style:preserve-3d] group-hover:[transform:rotateY(-2deg)_rotateX(1deg)_scale(1.015)]"
            >
              <div
                className="relative w-[280px] rounded-[44px] bg-gradient-to-b from-foreground/95 to-foreground/85 p-[6px] shadow-[0_24px_90px_-26px_var(--primary),0_0_0_1px_rgba(0,0,0,0.1)]"
                style={{ transform: "translateZ(24px)" }}
              >
                <div
                  className="absolute left-1/2 top-3 z-10 h-[22px] w-[80px] -translate-x-1/2 rounded-full bg-black"
                  style={{ transform: "translateZ(34px)" }}
                />

                <div
                  className="relative h-[580px] overflow-hidden rounded-[38px] bg-background shadow-inner"
                  style={{ transform: "translateZ(16px)" }}
                >
                  <div className="pointer-events-none absolute inset-0">
                    <AppScreen />
                  </div>

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center bg-gradient-to-t from-background via-background/85 to-transparent pb-5 pt-12">
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-[11px] font-medium tracking-[0.08em] text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                      Open live demo →
                    </span>
                  </div>
                </div>

                <div
                  className="absolute bottom-2 left-1/2 h-[4px] w-[100px] -translate-x-1/2 rounded-full bg-foreground/20"
                  style={{ transform: "translateZ(28px)" }}
                />
              </div>

              <div
                className="pointer-events-none absolute inset-[6px] rounded-[38px] bg-gradient-to-br from-white/12 via-transparent to-transparent"
                style={{ transform: "translateZ(42px)" }}
              />
            </div>
          </Link>

          <div className="mt-10 text-center">
            <p className="text-[13px] text-muted-foreground">
              Tap the phone to open the <Link href="/app/dashboard" className="text-primary underline-offset-4 hover:underline">live Dashboard demo</Link>
            </p>
            <p className="mt-2 text-[12px] italic text-primary/50">
              Every recommendation is generated from your personal glucose patterns
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
