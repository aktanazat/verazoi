"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import * as api from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<"login" | "register">("login")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const fn = mode === "login" ? api.login : api.register
      const res = await fn(email, password)
      localStorage.setItem("verazoi_token", res.access_token)
      localStorage.setItem("verazoi_email", email)
      router.push("/app/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6">
      <div className="w-full max-w-[320px]">
        <h1 className="font-serif text-[36px] font-light text-foreground">Verazoi</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {mode === "login" ? "Sign in to your account" : "Create your account"}
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
              required
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
              required
              minLength={8}
              className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:border-foreground/30 focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-[12px] text-amber-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-foreground py-3.5 text-[13px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {isLoading ? "..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-center text-[12px] text-muted-foreground">
          {mode === "login" ? (
            <>
              {"Don't have an account? "}
              <button onClick={() => setMode("register")} className="text-foreground underline underline-offset-4">
                Create one
              </button>
            </>
          ) : (
            <>
              {"Already have an account? "}
              <button onClick={() => setMode("login")} className="text-foreground underline underline-offset-4">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
