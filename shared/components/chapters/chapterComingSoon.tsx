import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin, Sprout } from "lucide-react";

export default function ChapterComingSoon({ city }: { city: string }) {
  return (
    <main className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden bg-deep px-5 py-24 text-deep-foreground sm:px-8">
      <div className="pointer-events-none absolute -top-40 right-[-8%] h-[32rem] w-[32rem] rounded-full bg-primary/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 left-[-10%] h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-3xl" />
      <div className="relative mx-auto w-full max-w-3xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground"><Sprout className="h-7 w-7" /></span>
        <p className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.22em] text-accent uppercase"><MapPin className="h-4 w-4" /> Upcoming chapter</p>
        <h1 className="font-display mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">{city}</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-deep-foreground/80">The AgriMinds {city} chapter is coming soon. We’re preparing the local network to connect farmers, FPOs, founders, mentors, and institutions.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/chapters" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover">All chapters <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-deep-foreground/25 px-5 py-3 text-sm font-semibold text-deep-foreground transition hover:border-accent hover:text-accent"><ArrowLeft className="h-4 w-4" /> Back home</Link>
        </div>
      </div>
    </main>
  );
}
