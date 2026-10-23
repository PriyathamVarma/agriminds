import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import tieVizagLogo from "@/Partners/partner-tie-vizag.jpeg";
import andhraUniversityLogo from "@/Partners/partner-andhra-university.jpeg";
import aHubLogo from "@/Partners/partner-a-hub.jpeg";
import alcovePartnersLogo from "@/Partners/partner-alcove-partners.png";
import picxyLogo from "@/Partners/partner-picxy.jpeg";
import { SITE } from "@/shared/data/agriminds";
import Breadcrumbs from "@/shared/components/seo/breadcrumbs";

export const metadata: Metadata = {
  title: `Partners — ${SITE.name}`,
  description: "Organizations and enterprises connected with AgriMinds to strengthen agriculture, innovation, entrepreneurship, and market access.",
  alternates: { canonical: "/partners" },
};

const PARTNERS = [
  {
    name: "TiE Vizag",
    logo: tieVizagLogo,
    description: "The Visakhapatnam chapter of TiE supports entrepreneurship in Andhra Pradesh through mentoring, networking, education, funding, and incubation, connecting founders with an entrepreneurial community.",
    href: "https://vizag.tie.org/about/",
  },
  {
    name: "Andhra University",
    logo: andhraUniversityLogo,
    description: "Based in Visakhapatnam, Andhra University brings together higher education, research, and innovation. Through its incubation ecosystem, the university helps students and entrepreneurs turn knowledge and ideas into enterprises.",
    href: "https://www.andhrauniversity.edu.in/",
  },
  {
    name: "ā hub — Andhra University Incubation Council",
    logo: aHubLogo,
    description: "Andhra University’s incubation council supports startups with workspace, prototyping facilities, business advice, mentoring, training, and access to finance. Its multidisciplinary ecosystem includes agritech and food-related innovation.",
    href: "https://www.a-hub.co/",
  },
  {
    name: "Alcove Partners",
    logo: alcovePartnersLogo,
    description: "Alcove Partners provides mentoring and investment support for startups. Its startup school and entrepreneurial events help founders develop their ideas and connect with the startup ecosystem.",
    href: "https://alcovepartners.com/",
  },
  {
    name: "Picxy",
    logo: picxyLogo,
    description: "Picxy is a visual media platform offering professional photography for events, products, portraits, and brands, alongside AI portrait generation and on-the-spot reel creation.",
    href: "https://www.picxy.com/",
  },
];

export default function PartnersPage() {
  return <main className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
    <Breadcrumbs items={[{ name: "Partners" }]} />
    <div className="max-w-3xl"><p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Building together</p><h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-foreground-heading sm:text-6xl">Partners in the ecosystem</h1><p className="mt-6 text-lg leading-relaxed text-foreground-body">AgriMinds works with organizations and enterprises that help farmers, FPOs, founders, and rural communities move from potential to enterprise.</p></div>
    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {PARTNERS.map((partner) => (
        <article key={partner.href} className="flex h-full flex-col rounded-3xl border border-border bg-surface-card p-6 transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg">
          <div className="flex h-36 items-center justify-center rounded-2xl bg-white p-5">
            <Image
              src={partner.logo}
              alt={`${partner.name} logo`}
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 40vw, 80vw"
              className="h-full w-full object-contain"
            />
          </div>
          <h2 className="font-display mt-6 text-xl font-semibold text-foreground-heading">{partner.name}</h2>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground-body">{partner.description}</p>
          <a href={partner.href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            Visit {partner.name} <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
          </a>
        </article>
      ))}
    </div>
    <div className="mt-14 rounded-3xl bg-deep p-7 text-deep-foreground sm:p-9"><p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Shared ambition</p><h2 className="font-display mt-3 text-2xl font-semibold sm:text-3xl">Stronger connections create stronger enterprises.</h2><p className="mt-3 max-w-2xl leading-relaxed text-deep-foreground/80">These links are provided as part of the AgriMinds ecosystem story. Visit each partner to learn more about its work and current initiatives.</p></div>
  </main>;
}
