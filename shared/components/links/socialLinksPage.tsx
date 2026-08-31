import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SITE, SOCIAL_LINKS } from "@/shared/data/agriminds";

export default function SocialLinksPage() {
  return (
    <div className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-[#0f1d16] px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 40%, rgba(224,160,90,0.16) 0%, rgba(31,77,58,0.14) 45%, rgba(15,29,22,0) 75%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        {/* Forced to pure white via filter — brightness(0) then invert(1) turns any
            non-transparent pixel white while preserving the SVG's own alpha — since this
            page's background is always dark, unlike the homepage there's no lighter section
            to reveal the usual full-colour logo against. */}
        <Image
          src="/brand/images/agriminds_svg.svg"
          alt={SITE.name}
          width={612}
          height={139}
          priority
          className="h-10 w-auto object-contain drop-shadow-[0_0_3px_rgba(255,253,248,0.9)] drop-shadow-[0_0_8px_rgba(255,253,248,0.65)]"
          style={{ filter: "brightness(0) invert(1)" }}
        />

        <p className="mt-6 text-sm leading-relaxed text-deep-foreground/75">
          Follow the AgriMinds Ecosystem Foundation and stay connected with the movement.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3.5">
          {SOCIAL_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-deep-border bg-deep-elevated/70 px-5 py-4 text-left backdrop-blur-sm transition hover:border-accent/60 hover:bg-deep-elevated"
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-deep-foreground">{link.label}</span>
                  <span className="block truncate text-xs text-deep-foreground/60">{link.handle}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 flex-none text-deep-foreground/40 transition group-hover:text-accent" />
              </a>
            );
          })}
        </div>

        <p className="mt-12 text-xs font-medium tracking-[0.08em] text-deep-foreground/45 uppercase">
          AgriMinds Ecosystem Foundation &middot; Founded in Vizag, 2026
        </p>
      </div>
    </div>
  );
}
