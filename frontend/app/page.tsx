import { Navbar } from "@/components/navbar"
import { ScrollProgress } from "@/components/scroll-progress"
import { Hero } from "@/components/hero"
import { PhoneMockup } from "@/components/phone-mockup"
import { PageSectionsTabs } from "@/components/page-sections-tabs"
import { OurStory } from "@/components/our-story"
import { Testimonials } from "@/components/testimonials"
import { Lifestyle } from "@/components/lifestyle"
import { Team } from "@/components/team"
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
      <OurStory />
      <Testimonials />
      <Lifestyle />
      <Team />
      <FAQ />
      <Closing />
      <Footer />
    </main>
  )
}
