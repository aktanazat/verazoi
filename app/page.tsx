import { Navbar } from "@/components/navbar"
import { ScrollProgress } from "@/components/scroll-progress"
import { Hero } from "@/components/hero"
import { PhoneMockup } from "@/components/phone-mockup"
import { PageSectionsTabs } from "@/components/page-sections-tabs"
import { Lifestyle } from "@/components/lifestyle"
import { FAQ } from "@/components/faq"
import { Closing } from "@/components/closing"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <PhoneMockup />
      <PageSectionsTabs />
      <Lifestyle />
      <FAQ />
      <Closing />
      <Footer />
    </main>
  )
}
