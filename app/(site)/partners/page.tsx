import type { Metadata } from "next";
import { ArrowUpRight, Handshake } from "lucide-react";
import { SITE } from "@/shared/data/agriminds";
import Breadcrumbs from "@/shared/components/seo/breadcrumbs";

export const metadata: Metadata = {
  title: `Partners — ${SITE.name}`,
  description: "Organizations and enterprises connected with AgriMinds to strengthen agriculture, innovation, entrepreneurship, and market access.",
  alternates: { canonical: "/partners" },
};

const PARTNERS = [
  { name: "Ratan Tata Innovation Hub", shortName: "RTIH", description: "An innovation and entrepreneurship hub supporting the development of new ideas and enterprises in Andhra Pradesh.", href: "https://rtih.co.in/" },
  { name: "agriDNA Ventures", shortName: "agriDNA", description: "An agriculture-focused venture working to connect technology, farmers, and Farmer Producer Companies for a sustainable future.", href: "https://www.agridna.in/" },
  { name: "AP MSME ONE", shortName: "AP MSME", description: "Andhra Pradesh’s MSME-focused platform for enterprise support, information, and access to state-level resources.", href: "https://apmsmeone.ap.gov.in/" },
  { name: "SERP Andhra Pradesh", shortName: "SERP", description: "The Andhra Pradesh rural development network supporting community-led livelihoods and enterprise development.", href: "https://www.serp.ap.gov.in/" },
  { name: "Native Araku Coffee", shortName: "Araku Coffee", description: "A regional coffee enterprise representing the value of origin, farmer communities, and market-ready agricultural products.", href: "https://nativearakucoffee.com/" },
  { name: "Picxy", shortName: "Picxy", description: "A visual media platform that can help surface authentic stories and imagery from agriculture, communities, and enterprise-building work.", href: "https://www.picxy.com/" },
  { name: "Global Alliance for Mass Entrepreneurship", shortName: "GAME", description: "A mass-entrepreneurship ecosystem builder focused on district-level entrepreneurship, women’s economic empowerment, markets, finance, and technology.", href: "https://massentrepreneurship.org/" },
];

export default function PartnersPage() {
  return <main className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
    <Breadcrumbs items={[{ name: "Partners" }]} />
    <div className="max-w-3xl"><p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Building together</p><h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-foreground-heading sm:text-6xl">Partners in the ecosystem</h1><p className="mt-6 text-lg leading-relaxed text-foreground-body">AgriMinds works with organizations and enterprises that help farmers, FPOs, founders, and rural communities move from potential to enterprise.</p></div>
    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{PARTNERS.map((partner) => <article key={partner.href} className="flex h-full flex-col rounded-3xl border border-border bg-surface-card p-6 transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary"><Handshake className="h-5 w-5" /></span><span className="text-xs font-semibold tracking-wide text-foreground-muted uppercase">{partner.shortName}</span></div><h2 className="font-display mt-6 text-xl font-semibold text-foreground-heading">{partner.name}</h2><p className="mt-3 flex-1 text-sm leading-relaxed text-foreground-body">{partner.description}</p><a href={partner.href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Visit partner <ArrowUpRight className="h-4 w-4" /></a></article>)}</div>
    <div className="mt-14 rounded-3xl bg-deep p-7 text-deep-foreground sm:p-9"><p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Shared ambition</p><h2 className="font-display mt-3 text-2xl font-semibold sm:text-3xl">Stronger connections create stronger enterprises.</h2><p className="mt-3 max-w-2xl leading-relaxed text-deep-foreground/80">These links are provided as part of the AgriMinds ecosystem story. Visit each partner to learn more about its work and current initiatives.</p></div>
  </main>;
}
