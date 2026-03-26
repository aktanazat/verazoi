import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

const sections = [
  {
    title: "What Verazoi collects",
    body: "Verazoi stores the health data you choose to log or sync, including glucose, meals, activity, sleep, medications, and wearable summaries. Apple Health data stays on your device until you explicitly sync it to Verazoi.",
  },
  {
    title: "How AI features work",
    body: "Weekly AI insights are generated from the exact weekly payload shown to you in the app before generation. Nothing is sent to Anthropic until you review that payload and choose to generate an insight.",
  },
  {
    title: "Photo recognition",
    body: "If you use meal photo recognition, the selected image is uploaded to Anthropic only after you confirm the preview in the app. If you cancel, the image is not sent.",
  },
  {
    title: "Glucose import",
    body: "Verazoi imports CGM glucose through Apple Health. Your CGM credentials stay with your CGM provider app and are not collected by Verazoi.",
  },
  {
    title: "Security",
    body: "App traffic to the Verazoi API is sent over HTTPS. Authentication uses bearer access tokens, and refresh failures clear the session. Weekly insight generation and meal photo recognition send data to Anthropic only after the in-app review step.",
  },
  {
    title: "Your choices",
    body: "You can skip AI insight generation, skip meal photo recognition, disconnect wearable sync, and control Apple Health permissions at any time.",
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="px-6 pb-24 pt-32">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            Legal
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-none sm:text-5xl">
            Privacy
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-muted-foreground">
            This page describes what Verazoi sends off-device, what stays local
            until you act, and where third-party model providers are involved.
          </p>

          <div className="mt-12 space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="border-t border-border pt-8">
                <h2 className="text-lg font-medium">{section.title}</h2>
                <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
