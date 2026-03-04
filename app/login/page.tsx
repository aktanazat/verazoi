"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/app/dashboard")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6">
      <div className="w-full max-w-[320px]">
        <h1 className="font-serif text-[36px] font-light text-foreground">Verazoi</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4">
          <div>
            <label className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:border-foreground/30 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:border-foreground/30 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-foreground py-3.5 text-[13px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85"
          >
            Sign in
          </button>
        </form>

        <p className="mt-8 text-center text-[12px] text-muted-foreground">
          {"Don't have an account? "}
          <Link href="/early-access" className="text-foreground underline underline-offset-4">
            Join waitlist
          </Link>
        </p>
      </div>
    </div>
  )
}
