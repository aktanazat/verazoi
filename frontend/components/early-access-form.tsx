export function EarlyAccessForm() {
  return (
    <div className="mt-12">
      <style>{`
        #early-access-joined { display: none; }
        #early-access-joined:target { display: block; }
        #early-access-joined:target + form { display: none; }
      `}</style>
      <div id="early-access-joined" className="gradient-border rounded-2xl bg-card/50 p-8">
        <p className="font-serif text-[20px] font-light text-foreground">
          You&apos;re on the list.
        </p>
        <p className="mt-3 text-[14px] text-muted-foreground">
          We&apos;ll be in touch soon with your access details.
        </p>
      </div>

      <form action="#early-access-joined">
        <div className="mx-auto flex max-w-xs flex-col items-center gap-6">
          <input
            type="text"
            inputMode="email"
            autoComplete="off"
            name="waitlist-email"
            placeholder="name@email.com"
            required
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
            className="w-full border-0 border-b border-border bg-transparent pb-3 text-center font-serif text-[18px] text-foreground placeholder:text-muted-foreground/30 focus:border-primary/40 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="group relative overflow-hidden rounded-full bg-primary px-10 py-3 text-[13px] font-medium tracking-[0.04em] text-primary-foreground transition-all duration-300 hover:shadow-xl hover:shadow-primary/25"
          >
            <span className="relative z-10">Join early access</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </button>
        </div>
        <p className="mt-6 text-[12px] text-muted-foreground/40">
          No spam.
        </p>
      </form>
    </div>
  )
}
