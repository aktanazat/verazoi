import { API_BASE } from "@/lib/config"

const fieldClass = "mt-2 w-full border border-border bg-transparent px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-foreground/30 focus:outline-none"
const buttonClass = "mt-4 w-full bg-foreground py-3.5 text-[13px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85 disabled:opacity-50"

function AuthFields() {
  return (
    <>
      <div>
        <label className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
          Email
        </label>
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          className={fieldClass}
        />
      </div>

      <div>
        <label className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
          Password
        </label>
        <input
          type="password"
          name="password"
          placeholder="********"
          required
          minLength={8}
          className={fieldClass}
        />
      </div>
    </>
  )
}

export function LoginForm() {
  return (
    <div className="mt-4">
      <p className="text-[13px] text-muted-foreground">
        Sign in to your account
      </p>

      <form action={`${API_BASE}/auth/login/form`} method="post" className="mt-10 flex flex-col gap-4">
        <AuthFields />
        <button type="submit" className={buttonClass}>
          Sign in
        </button>
      </form>

      <details className="mt-8 text-center text-[12px] text-muted-foreground">
        <summary className="cursor-pointer list-none text-foreground underline underline-offset-4 [&::-webkit-details-marker]:hidden">
          Create an account
        </summary>
        <form action={`${API_BASE}/auth/register/form`} method="post" className="mt-6 flex flex-col gap-4 text-left">
          <AuthFields />
          <button type="submit" className={buttonClass}>
            Create account
          </button>
        </form>
      </details>
    </div>
  )
}
