import Link from "next/link"
import Image from "next/image"
import { basePath } from "@/lib/assets"

export function Closing() {
  const visible = true

  return (
    <section className="relative px-6 py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-[150px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--border)_1px,_transparent_1px)] [background-size:48px_48px] opacity-20" />

      <div className="relative mx-auto max-w-screen-lg text-center">
        <div
          className={`flex justify-center transition-all duration-1000 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <Image src={`${basePath}/images/verazoi_logo_bottom.svg`} alt="Verazoi - Rooted in truth. Designed for life." width={600} height={150} className="h-auto w-[260px] md:w-[320px]" />
        </div>

        <div
          className={`mx-auto mt-8 max-w-md transition-all duration-1000 delay-400 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            Your metabolic patterns are unique. Your guidance should be too.
          </p>
        </div>

        <div
          className={`mt-10 transition-all duration-1000 delay-500 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <Link
            href="/early-access"
            className="group relative inline-flex overflow-hidden rounded-full bg-primary px-8 py-3.5 text-[13px] font-medium tracking-[0.04em] text-primary-foreground transition-all duration-300 hover:shadow-xl hover:shadow-primary/25"
          >
            <span className="relative z-10">Join the waitlist</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
        </div>
      </div>
    </section>
  )
}
