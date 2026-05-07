import Image from "next/image"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"
import { basePath } from "@/lib/assets"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-6">
      <Link
        href="/"
        className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/40 px-3 py-1.5 text-[12px] text-muted-foreground backdrop-blur-md transition-colors hover:border-foreground/30 hover:text-foreground"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <path d="M9.5 3.5 5 8l4.5 4.5" />
        </svg>
        <span>Back</span>
      </Link>

      <div className="w-full max-w-[320px]">
        <Image src={`${basePath}/images/verazoi_logo_top.svg`} alt="Verazoi" width={420} height={140} className="h-auto w-[180px]" />
        <LoginForm />
      </div>
    </div>
  )
}
