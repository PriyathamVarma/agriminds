"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, SITE } from "@/shared/data/agriminds";
import { cx } from "@/shared/lib/utils";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || open;

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid
          ? "border-b border-border bg-background/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/brand/images/agriminds_svg.svg"
            alt={SITE.name}
            width={612}
            height={139}
            priority
            className={cx(
              "h-9 w-auto object-contain transition-all duration-500",
              !solid &&
                "drop-shadow-[0_0_3px_rgba(255,253,248,0.9)] drop-shadow-[0_0_8px_rgba(255,253,248,0.65)]",
            )}
          />
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cx(
                "group relative text-sm font-medium transition-colors",
                solid ? "text-foreground-body hover:text-primary" : "text-deep-foreground/85 hover:text-deep-foreground",
              )}
            >
              {link.label}
              <span
                className={cx(
                  "absolute -bottom-1 left-0 h-px w-0 transition-all duration-300 group-hover:w-full",
                  solid ? "bg-primary" : "bg-deep-foreground",
                )}
              />
            </a>
          ))}
        </div>

        <a
          href="#join"
          className="hidden rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover md:inline-block"
        >
          Join the Movement
        </a>

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
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        className={cx(
          "overflow-hidden border-t border-border bg-background md:hidden transition-[max-height]",
          open ? "max-h-96" : "max-h-0 border-t-0",
        )}
      >
        <div className="flex flex-col gap-1 px-5 py-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-body hover:bg-surface"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#join"
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
