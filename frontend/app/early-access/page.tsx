import Link from "next/link"
import Image from "next/image"
import { EarlyAccessForm } from "@/components/early-access-form"
import { basePath } from "@/lib/assets"

export default function EarlyAccessPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6">
      <div className="mx-auto max-w-xl text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
          ←
          Back
        </Link>

        <div className="mt-8 flex justify-center">
          <Image src={`${basePath}/images/verazoi_logo_top.svg`} alt="Verazoi" width={420} height={140} className="h-auto w-[140px]" />
        </div>

        <h1 className="mt-12 font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-balance">
          <span className="text-gradient">Turn your CGM data</span>{" "}
          <span className="text-foreground">into meaningful stability guidance.</span>
        </h1>
        <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
          Early users only. Enter your email to reserve a spot.
        </p>

        <EarlyAccessForm />
      </div>
    </div>
  )
}
