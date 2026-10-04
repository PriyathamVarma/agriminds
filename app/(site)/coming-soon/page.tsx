import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sprout } from "lucide-react";
import { SITE } from "@/shared/data/agriminds";

export const metadata: Metadata = {
  title: `Coming Soon — ${SITE.name}`,
  description: "New AgriMinds chapter opportunities are coming soon.",
};

export default function ComingSoonPage() {
  return (
    <main className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden bg-deep px-5 py-24 text-deep-foreground sm:px-8">
      <div className="pointer-events-none absolute -top-40 right-[-8%] h-[32rem] w-[32rem] rounded-full bg-primary/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 left-[-10%] h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-3xl" />
      <div className="relative mx-auto w-full max-w-3xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground"><Sprout className="h-7 w-7" /></span>
        <p className="mt-8 text-xs font-semibold tracking-[0.22em] text-accent uppercase">The network is growing</p>
        <h1 className="font-display mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">Start a chapter</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-deep-foreground/80">Chapter applications are coming soon. We’re preparing the next steps to help local agri-ecosystems connect, grow, and thrive.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/chapters" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover">Explore chapters <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-deep-foreground/25 px-5 py-3 text-sm font-semibold text-deep-foreground transition hover:border-accent hover:text-accent"><ArrowLeft className="h-4 w-4" /> Back home</Link>
        </div>
      </div>
    </main>
  );
}
