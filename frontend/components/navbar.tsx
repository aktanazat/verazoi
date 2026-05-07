import Link from "next/link"
import Image from "next/image"
import { basePath } from "@/lib/assets"

const links = [
  { label: "Overview", href: "#overview" },
  { label: "Score", href: "#stability-score" },
  { label: "Our Story", href: "#our-story" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Team", href: "#team" },
  { label: "FAQ", href: "#faq" },
]

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/85 backdrop-blur-2xl">
      <nav className="relative mx-auto flex max-w-screen-lg items-center justify-between px-6 py-5">
        <Link href="/">
          <Image src={`${basePath}/images/verazoilogo.svg`} alt="Verazoi" width={764} height={536} className="h-7 w-auto" />
        </Link>

        <div className="pointer-events-none absolute inset-x-0 hidden justify-center md:flex">
          <div className="pointer-events-auto flex items-center gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1.5 text-[12px] tracking-[0.03em] text-muted-foreground/70 transition-colors duration-300 hover:bg-primary/10 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-[13px] tracking-[0.02em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/early-access"
            className="group relative hidden overflow-hidden rounded-full bg-primary px-5 py-2 text-[13px] tracking-[0.02em] text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 md:inline-flex"
          >
            <span className="relative z-10">Get early access</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
          <details className="group md:hidden">
            <summary className="cursor-pointer list-none text-[12px] uppercase tracking-[0.12em] text-foreground [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <div className="absolute inset-x-0 top-full border-b border-border/50 bg-background/95 px-6 pb-6 pt-2 backdrop-blur-2xl">
              <div className="flex flex-col">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} className="rounded-xl py-3 text-[14px] text-foreground">
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  className="mt-4 py-3 text-center text-[13px] tracking-[0.02em] text-foreground"
                >
                  Log in
                </Link>
                <Link
                  href="/early-access"
                  className="rounded-full bg-primary px-5 py-3 text-center text-[13px] tracking-[0.02em] text-primary-foreground"
                >
                  Get early access
                </Link>
              </div>
            </div>
          </details>
        </div>
      </nav>
    </header>
  )
}
