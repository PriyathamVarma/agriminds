import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, ArrowUpRight, MessageCircle } from "lucide-react";
import { CONTACT_EMAIL, NAV_LINKS, SITE, SOCIAL_LINKS } from "@/shared/data/agriminds";
import { WHATSAPP_GROUP_URL } from "@/shared/data/links";

// Same source as the /links page — Website is left out here since the footer already has its
// own contact/location block.
const SOCIALS = SOCIAL_LINKS.filter((link) => link.label !== "Website");

export default function Footer() {
  return (
    <footer className="bg-grain relative overflow-hidden bg-deep text-deep-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-96 w-96 rounded-full bg-primary/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-12 border-b border-deep-border pb-14 lg:grid-cols-[1.4fr_0.8fr_0.9fr] lg:gap-20">
          <div className="max-w-lg">
            <Link href="/" className="flex items-center">
              {/* Same wordmark as the navbar/links page, forced to pure white — this footer is
                  always dark, so there's no lighter section to reveal a full-colour version
                  against. brightness(0) then invert(1) turns any non-transparent pixel white
                  while preserving the SVG's own alpha. */}
              <Image
                src="/brand/images/agriminds_svg.svg"
                alt={SITE.name}
                width={612}
                height={139}
                className="h-9 w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </Link>
            <p className="mt-6 max-w-md font-display text-xl leading-snug text-deep-foreground/90 sm:text-2xl">
              From Farm to Enterprise — building India&apos;s agri-food entrepreneurship ecosystem, one chapter at a time.
            </p>
            <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover">
              <MessageCircle className="h-4 w-4" /> Join the WhatsApp community
            </a>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-deep-border px-4 py-2 text-xs font-medium text-deep-foreground/70 transition hover:border-accent hover:text-accent"
                >
                  {social.label}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:pt-1">
            <h3 className="text-xs font-semibold tracking-[0.18em] text-deep-muted uppercase">
              Explore
            </h3>
            <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3">
              {NAV_LINKS.filter((link) => link.label !== "Join Us").map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm text-deep-foreground/80 transition hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:pt-1">
            <h3 className="text-xs font-semibold tracking-[0.18em] text-deep-muted uppercase">
              Get in Touch
            </h3>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-5 flex items-start gap-2.5 text-sm leading-6 text-deep-foreground/80 transition hover:text-accent"
            >
              <Mail className="h-4 w-4 flex-none" />
              {CONTACT_EMAIL}
            </a>
            <div className="mt-4 flex items-start gap-2.5 text-sm leading-6 text-deep-foreground/80">
              <MapPin className="h-4 w-4 flex-none" />
              Visakhapatnam, Andhra Pradesh, India
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-8 text-xs text-deep-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name} · Founded in Vizag, India</p>
          <p className="text-deep-foreground/50">From Farm to Enterprise.</p>
        </div>
      </div>
    </footer>
  );
}
