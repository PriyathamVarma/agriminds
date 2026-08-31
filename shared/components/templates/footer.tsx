import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import { CONTACT_EMAIL, NAV_LINKS, SITE, SOCIAL_LINKS } from "@/shared/data/agriminds";

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
        <div className="grid gap-14 border-b border-deep-border pb-16 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div className="max-w-md">
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
            <p className="mt-5 font-display text-2xl leading-snug text-deep-foreground/90">
              From Farm to Enterprise — building India&apos;s agri-food entrepreneurship ecosystem, one chapter at a time.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
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

          <div>
            <h3 className="text-xs font-semibold tracking-[0.18em] text-deep-muted uppercase">
              Explore
            </h3>
            <ul className="mt-5 space-y-3.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-deep-foreground/80 transition hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.18em] text-deep-muted uppercase">
              Get in Touch
            </h3>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-5 flex items-center gap-2.5 text-sm text-deep-foreground/80 transition hover:text-accent"
            >
              <Mail className="h-4 w-4 flex-none" />
              {CONTACT_EMAIL}
            </a>
            <div className="mt-3.5 flex items-center gap-2.5 text-sm text-deep-foreground/80">
              <MapPin className="h-4 w-4 flex-none" />
              Visakhapatnam, Andhra Pradesh, India
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-8 text-xs text-deep-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name} — Agriminds Ecosystem Foundation. Founded in Vizag.</p>
          <p>From Farm to Enterprise.</p>
        </div>
      </div>
    </footer>
  );
}
