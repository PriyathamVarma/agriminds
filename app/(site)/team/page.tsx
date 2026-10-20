import type { Metadata } from "next";
import Image from "next/image";
import styles from "./team.module.css";
import { SITE } from "@/shared/data/agriminds";
import { WHATSAPP_GROUP_URL } from "@/shared/data/links";

export const metadata: Metadata = {
  title: `Our Team — ${SITE.name}`,
  description: "Meet the AgriMinds directors building India's next generation of agricultural enterprises.",
  alternates: { canonical: "/team" },
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
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-16 text-center sm:px-8 sm:pt-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">The people behind AgriMinds</p>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-foreground-heading sm:text-6xl">Meet our founders</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-foreground-body">Different journeys, one shared purpose: helping India’s farmers become the country’s next generation of entrepreneurs.</p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8 sm:pb-28 sm:pt-12" aria-labelledby="leadership-heading">
        <h2 id="leadership-heading" className="font-display text-3xl font-semibold text-foreground-heading sm:text-4xl">Leadership</h2>
        <div className="mt-4 h-0.5 w-24 bg-primary" aria-hidden="true" />
        <p className="mt-5 text-sm leading-6 text-foreground-body">Hover over a portrait, or select it, to meet each director.</p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {directors.map((director) => (
            <details key={director.name} className={styles.card}>
              <summary className={styles.summary}>
                <Image src={director.image} alt={director.name} fill sizes="(min-width: 1280px) 280px, (min-width: 640px) 45vw, 90vw" className={styles.portrait} />
                <div className={styles.caption}>
                  <h3 className="font-display text-2xl font-semibold leading-tight">{director.name}</h3>
                  <p className="mt-3 text-sm font-semibold">{director.role}</p>
                </div>
              </summary>
              <div className={styles.bio}>
                <p className="font-display text-2xl font-semibold leading-tight">{director.name}</p>
                <p className="mt-3 text-sm font-semibold">{director.role}</p>
                <p className="mt-5 text-sm leading-6">{director.bio}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
      <section id="connect" className="bg-surface px-5 py-20 text-center sm:px-8 sm:py-24"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Build with us</p><h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-medium tracking-[-0.04em] text-foreground-heading sm:text-5xl">There’s room for your story here.</h2><p className="mx-auto mt-5 max-w-xl text-base leading-7 text-foreground-muted">Join a growing network of farmers, founders, and ecosystem partners making agriculture more entrepreneurial.</p><a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover">Join the movement on WhatsApp</a></section>
    </div>
  );
}
