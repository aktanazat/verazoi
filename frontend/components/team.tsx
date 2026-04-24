"use client"

import Image from "next/image"
import { Linkedin, Mail } from "lucide-react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import desireePic from "@/public/images/team/desiree.png"
import roshniPic from "@/public/images/team/roshni.png"
import adamPic from "@/public/images/team/adam.png"
import aktanPic from "@/public/images/team/aktan.png"
import aishwariPic from "@/public/images/team/aishwari.png"
import ozeranPic from "@/public/images/team/ozeran.jpg"
import karstenPic from "@/public/images/team/karsten.jpg"
import chancePic from "@/public/images/team/chance.jpg"

type Person = {
  name: string
  role: string
  major: string
  email: string
  linkedin: string
  image: typeof desireePic
}

const leadership: Person[] = [
  {
    name: "Desiree Bishnoi",
    role: "Founder / CEO",
    major: "Computer Science & Statistics, UC Davis",
    email: "debishnoi@ucdavis.edu",
    linkedin: "https://www.linkedin.com/in/desiree-bishnoi",
    image: desireePic,
  },
  {
    name: "Roshni Sandhu",
    role: "CTO",
    major: "Computer Science & Engineering, UC Davis",
    email: "rrsandhu@ucdavis.edu",
    linkedin: "https://www.linkedin.com/in/roshnisandhu/",
    image: roshniPic,
  },
]

const team: Person[] = [
  {
    name: "Adam Thorne",
    role: "AI / ML Engineer",
    major: "Computer Science + Applied Math, UC Davis",
    email: "amthorne@ucdavis.edu",
    linkedin: "https://www.linkedin.com/in/adam-thorne-55b931261/",
    image: adamPic,
  },
  {
    name: "Aktan Azat",
    role: "Web App Developer",
    major: "Computer Science & Engineering, UC Davis",
    email: "aazat@ucdavis.edu",
    linkedin: "https://www.linkedin.com/in/aktanazat/",
    image: aktanPic,
  },
  {
    name: "Aishwari Sirur",
    role: "UXR, Marketing Lead",
    major: "Computer Science & Statistics, UC Davis",
    email: "asirur@ucdavis.edu",
    linkedin: "https://www.linkedin.com/in/aishwari-sirur/",
    image: aishwariPic,
  },
]

type Advisor = {
  name: string
  role: string
  image: typeof ozeranPic
}

const advisors: Advisor[] = [
  {
    name: "Dr. Larry Ozeran",
    role: "President @ Clinical Informatics",
    image: ozeranPic,
  },
  {
    name: "Karsten Russell-Wood",
    role: "Chief Marketing & Experience Officer @ EQUUM",
    image: karstenPic,
  },
  {
    name: "Chance Mathisen",
    role: "Investor @ F-Prime",
    image: chancePic,
  },
]

function PersonCard({ person }: { person: Person }) {
  return (
    <div className="gradient-border card-premium group flex h-full flex-col items-center rounded-2xl bg-card/40 px-6 py-8 text-center transition-shadow duration-500 hover:shadow-xl hover:shadow-primary/5">
      <div className="relative h-32 w-32 overflow-hidden rounded-full bg-muted ring-1 ring-border/60 transition-all duration-500 group-hover:ring-primary/40 group-hover:ring-offset-2 group-hover:ring-offset-background">
        <Image
          src={person.image}
          alt={person.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          sizes="128px"
        />
      </div>
      <h3 className="mt-6 text-[15px] font-medium tracking-tight text-foreground">
        {person.name}
      </h3>
      <p className="mt-1 font-serif text-[13px] italic text-primary/80">
        {person.role}
      </p>
      <p className="mt-3 min-h-[2.5rem] text-[12px] leading-relaxed text-muted-foreground">
        {person.major}
      </p>
      <div className="mt-auto flex w-full items-center justify-center gap-2 pt-6">
        <a
          href={`mailto:${person.email}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
          aria-label={`Email ${person.name}`}
        >
          <Mail className="h-3.5 w-3.5" strokeWidth={1.6} />
        </a>
        <a
          href={person.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
          aria-label={`${person.name} on LinkedIn`}
        >
          <Linkedin className="h-3.5 w-3.5" strokeWidth={1.6} />
        </a>
      </div>
    </div>
  )
}

export function Team() {
  const { ref, visible } = useScrollReveal(0.1)

  return (
    <section id="team" className="relative px-6 py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        <div className="absolute -left-24 top-1/3 h-[420px] w-[420px] rounded-full bg-primary/[0.05] blur-[120px]" />
        <div className="absolute -right-24 bottom-1/4 h-[360px] w-[360px] rounded-full bg-primary/[0.04] blur-[100px]" />
      </div>

      <div ref={ref} className="mx-auto max-w-screen-lg">
        <div
          className={`text-center transition-all duration-700 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-primary/60">
            Meet Our Team
          </p>
          <h2 className="mx-auto mt-6 max-w-2xl font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.1] text-balance">
            <span className="text-gradient">The people</span>{" "}
            <span className="text-foreground">behind Verazoi.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            Engineers, researchers, and operators from UC Davis building the
            metabolic intelligence layer we wished existed.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-2xl gap-5 sm:grid-cols-2">
          {leadership.map((p, i) => (
            <div
              key={p.email}
              className={`transition-all duration-700 ease-out ${
                visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${200 + i * 90}ms` }}
            >
              <PersonCard person={p} />
            </div>
          ))}
        </div>

        <div className="mx-auto mt-5 grid max-w-4xl gap-5 md:grid-cols-3">
          {team.map((p, i) => (
            <div
              key={p.email}
              className={`transition-all duration-700 ease-out ${
                visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${380 + i * 90}ms` }}
            >
              <PersonCard person={p} />
            </div>
          ))}
        </div>

        <div
          className={`mt-24 text-center transition-all duration-700 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Advisors
          </p>
          <h3 className="mx-auto mt-5 max-w-xl font-serif text-[clamp(1.25rem,2.4vw,1.75rem)] font-light leading-[1.15] text-foreground text-balance">
            Guided by clinical, operator, and investor expertise.
          </h3>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-3">
          {advisors.map((a, i) => (
            <div
              key={a.name}
              className={`gradient-border card-premium group flex flex-col items-center rounded-2xl bg-card/30 px-6 py-8 text-center transition-all duration-700 ease-out hover:shadow-xl hover:shadow-primary/5 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${400 + i * 100}ms` }}
            >
              <div className="relative h-24 w-24 overflow-hidden rounded-full bg-muted ring-1 ring-border/60 grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:ring-primary/30">
                <Image
                  src={a.image}
                  alt={a.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <p className="mt-5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Advisor
              </p>
              <p className="mt-2 text-[15px] font-medium tracking-tight text-foreground">
                {a.name}
              </p>
              <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
                {a.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
