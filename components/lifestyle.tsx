"use client"

import Image from "next/image"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import cgmMonitor from "@/public/images/cgm-monitor.jpg"
import cgmBreakfast from "@/public/images/cgm-breakfast.jpg"
import cgmData from "@/public/images/cgm-data.jpg"

const images = [
  {
    src: cgmMonitor,
    alt: "Person checking glucose readings on their phone",
  },
  {
    src: cgmBreakfast,
    alt: "Man reviewing glucose history over breakfast",
  },
  {
    src: cgmData,
    alt: "Woman managing her glucose with a smile",
  },
]

export function Lifestyle() {
  const { ref, visible } = useScrollReveal(0.15)

  return (
    <section className="relative px-6 py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div ref={ref} className="mx-auto max-w-screen-lg">
        <div
          className={`mb-16 text-center transition-all duration-700 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/60">
            Built for real life
          </p>
          <h2 className="mt-6 font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1]">
            <span className="text-gradient">Designed around</span>{" "}
            <span className="italic text-foreground">your day.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {images.map((img, i) => (
            <div
              key={img.src}
              className={`group overflow-hidden rounded-2xl transition-all duration-700 ease-out ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: visible ? `${200 + i * 150}ms` : "0ms" }}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
