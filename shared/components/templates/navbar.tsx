"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { NAV_LINKS, SITE, WHATSAPP_GROUP_URL } from "@/shared/data/agriminds";
import { cx } from "@/shared/lib/utils";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  // The transparent header + white logo only work over the homepage's dark hero photo — every
  // other page starts on the site's light background, so it must render solid from the start.
  const hasHeroToFloatOver = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !hasHeroToFloatOver || scrolled || open;
  const navGroups = [
    {
      label: "Explore",
      links: NAV_LINKS.filter((link) => ["Pillars", "Programmes", "Chapter Model", "Roadmap", "Impact"].includes(link.label)),
    },
    {
      label: "Community",
      links: NAV_LINKS.filter((link) => ["Chapters", "Our Team", "Blog"].includes(link.label)),
    },
  ];

  return (
    <header
      className={cx(
        "fixed inset-x-3 top-3 z-50 mx-auto max-w-7xl rounded-2xl transition-all duration-500 md:rounded-full",
        solid
          ? "border border-border bg-background/90 shadow-[0_10px_35px_rgba(20,32,26,0.1)] backdrop-blur-md"
          : "border border-deep-foreground/15 bg-deep/10 shadow-[0_8px_30px_rgba(4,10,11,0.12)] backdrop-blur-sm",
      )}
    >
      <nav className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5">
        <Link href="/" onClick={() => setOpen(false)} className="relative inline-block h-9">
          {/* Base — the usual full-colour logo, always present so it defines the box's size. */}
          <Image
            src="/brand/images/agriminds_svg.svg"
            alt={SITE.name}
            width={612}
            height={139}
            priority
            className="h-9 w-auto object-contain"
          />
          {/* Overlay — forced to pure white via filter (brightness(0) then invert(1) turns any
              non-transparent pixel white while preserving the SVG's own alpha), crossfaded out
              as soon as the page scrolls past the dark hero so the usual logo shows through. */}
          <Image
            src="/brand/images/agriminds_svg.svg"
            alt=""
            aria-hidden="true"
            fill
            sizes="160px"
            className={cx(
              "object-contain drop-shadow-[0_0_3px_rgba(255,253,248,0.9)] drop-shadow-[0_0_8px_rgba(255,253,248,0.65)] transition-opacity duration-500",
              solid ? "opacity-0" : "opacity-100",
            )}
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          {navGroups.map((group) => (
            <div key={group.label} className="relative">
              <button
                type="button"
                onClick={() => setDropdown((current) => current === group.label ? null : group.label)}
                onMouseEnter={() => setDropdown(group.label)}
                aria-expanded={dropdown === group.label}
                className={cx(
                  "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  dropdown === group.label ? "bg-primary-soft text-primary" : solid ? "text-foreground-body hover:bg-surface hover:text-primary" : "text-deep-foreground/85 hover:text-deep-foreground",
                )}
              >
                {group.label}<ChevronDown className={cx("h-3.5 w-3.5 transition-transform", dropdown === group.label && "rotate-180")} />
              </button>
              <div
                onMouseLeave={() => setDropdown(null)}
                className={cx(
                  "absolute left-1/2 top-[calc(100%+0.65rem)] w-60 -translate-x-1/2 rounded-2xl border border-border bg-surface-card p-2 shadow-[0_18px_50px_rgba(20,32,26,0.14)] transition-all duration-200",
                  dropdown === group.label ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
                )}
              >
                <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-muted">{group.label}</p>
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setDropdown(null)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground-body transition-colors hover:bg-primary-soft hover:text-primary">{link.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden items-center gap-5 md:flex">
          
          <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover">
            Join the Movement
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cx(
            "flex h-10 w-10 items-center justify-center rounded-full border transition-colors md:hidden",
            solid
              ? "border-border text-foreground-heading"
              : "border-deep-foreground/30 text-deep-foreground",
          )}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        id="mobile-navigation"
        inert={!open}
        className={cx(
          "overflow-y-auto border-t border-border bg-background md:hidden transition-[max-height]",
          open ? "max-h-[calc(100dvh-73px)]" : "max-h-0 border-t-0",
        )}
      >
        <div className="flex flex-col gap-1 px-5 py-3">
          {navGroups.map((group) => (
            <div key={group.label} className="pt-2 first:pt-0">
              <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-muted">{group.label}</p>
              {group.links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-body hover:bg-surface">{link.label}</Link>)}
            </div>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-body hover:bg-surface">
            Sign in
          </Link>
          <a
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-1 rounded-full bg-accent px-4 py-2.5 text-center text-sm font-semibold text-accent-foreground"
          >
            Join the Movement
          </a>
        </div>
      </div>
    </header>
  );
}
