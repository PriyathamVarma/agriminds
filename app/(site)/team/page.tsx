import type { Metadata } from "next";
import Image from "next/image";
import { Sprout } from "lucide-react";
import { SITE } from "@/shared/data/agriminds";
import { WHATSAPP_GROUP_URL } from "@/shared/data/links";

export const metadata: Metadata = {
  title: `Our Team — ${SITE.name}`,
  description: "Meet the people building India's next generation of agricultural enterprises.",
};

const directors = [
  {
    name: "Narendra Reddy, Nerla",
    role: "Chairman",
    image: "/team/narendra-reddy.jpeg",
    bio: "A leadership and technology professional with 25+ years of experience building high-performing teams and creating value for stakeholders. He actively invests in sustainability-focused startups, with a special interest in agri-tech.",
  },
  {
    name: "Shubash Kiran",
    role: "Managing Director",
    image: "/team/shubash-kiran.jpeg",
    bio: "A rural development, IT, and innovation professional with 12+ years of experience. As State Lead for the PMFME scheme in Andhra Pradesh, Kiran supports food enterprises with strategy, skills, and market access.",
  },
  {
    name: "Lingala Shankar",
    role: "Director",
    image: "/team/lingala-shankar.jpeg",
    bio: "A regenerative farmer and ecosystem builder working across agriculture, clean energy, and community development. Shankar is also a co-founder of the Agriminds Ecosystem Foundation.",
  },
  {
    name: "Vatsavaye Priyatham Varma",
    role: "Director",
    image: "/team/priyatham-varma.jpeg",
    bio: "An Indian entrepreneur returning to his roots through sustainable farming. Varma brings a background in technology, innovation, and building ventures across borders.",
  },
];

export default function TeamPage() {
  return (
    <div className="bg-background">
      <section className="relative overflow-hidden bg-deep px-5 pb-20 pt-36 text-deep-foreground sm:px-8 sm:pb-28 sm:pt-44">
        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-primary opacity-40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-accent"><Sprout className="h-4 w-4" /> The people behind the movement</p>
          <h1 className="max-w-4xl font-display text-5xl font-medium leading-[0.98] tracking-[-0.05em] sm:text-7xl lg:text-8xl">Rooted in purpose.<br /><span className="text-accent">Growing together.</span></h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-deep-muted sm:text-xl">AgriMinds is shaped by people who believe India’s farmers can be the country’s next great entrepreneurs.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="mb-14 flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Our leadership</p><h2 className="mt-3 font-display text-4xl font-medium tracking-[-0.04em] text-foreground-heading sm:text-5xl">Meet the directors</h2></div>
          <p className="max-w-sm text-sm leading-6 text-foreground-muted">Different journeys, one shared conviction: when people and possibility come together, agriculture becomes an engine for lasting change.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {directors.map((director) => (
            <article key={director.name} className="overflow-hidden rounded-3xl border border-border bg-surface-card transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(20,32,26,0.1)]">
              <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                <Image src={director.image} alt={director.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover object-center transition duration-500 hover:scale-105" />
              </div>
              <div className="min-h-[245px] p-6 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{director.role}</p>
                <h3 className="mt-3 min-h-[2.5rem] font-display text-2xl font-medium leading-tight tracking-[-0.04em] text-foreground-heading">{director.name}</h3>
                <p className="mt-5 border-t border-border pt-5 text-sm leading-7 text-foreground-body">{director.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="connect" className="bg-surface px-5 py-20 text-center sm:px-8 sm:py-24"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Build with us</p><h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-medium tracking-[-0.04em] text-foreground-heading sm:text-5xl">There’s room for your story here.</h2><p className="mx-auto mt-5 max-w-xl text-base leading-7 text-foreground-muted">Join a growing network of farmers, founders, and ecosystem partners making agriculture more entrepreneurial.</p><a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover">Join the movement on WhatsApp</a></section>
    </div>
  );
}
