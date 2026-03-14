import Link from "next/link"
import Image from "next/image"
import { basePath } from "@/lib/utils"

export function Footer() {
  return (
    <footer className="relative px-6 py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="mx-auto max-w-screen-lg">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/">
              <Image src={`${basePath}/images/verazoi_logo_bottom.svg`} alt="Verazoi - Rooted in truth. Designed for life." width={600} height={150} className="h-auto w-[180px]" />
            </Link>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              Predictive metabolic intelligence for CGM-using adults. Structured
              clarity, not guesswork.
            </p>
          </div>

          <div className="flex gap-10">
            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
                Product
              </p>
              <Link href="#stability-score" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                Stability Score
              </Link>
              <Link href="/early-access" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                Early access
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
                Contact
              </p>
              <a href="mailto:contactverazoi@gmail.com" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                contactverazoi@gmail.com
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
                Legal
              </p>
              <Link href="#" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-border pt-8">
          <p className="text-[12px] text-muted-foreground/50">
            &copy; {new Date().getFullYear()} Verazoi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
