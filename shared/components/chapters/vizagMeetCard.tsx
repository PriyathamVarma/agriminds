import Image from "next/image";
import { VIZAG_MEET_PHOTOS } from "@/shared/data/vizagMeet";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function VizagMeetCard() {
  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-surface-card sm:grid sm:grid-cols-[220px_1fr]">
      <div className="relative min-h-56">
        <Image src={VIZAG_MEET_PHOTOS[0].src} alt="Participants at the second Vizag agripreneurship meet" fill sizes="(max-width: 640px) 100vw, 220px" className="object-cover" />
      </div>
      <div className="p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Vizag chapter · Meet recap</p>
        <h2 className="font-display mt-3 text-2xl font-semibold text-foreground-heading">AI in Agri: The Future</h2>
        <p className="mt-2 text-sm text-foreground-muted">12 September 2026 · RTIH, Vizag</p>
        <p className="mt-4 text-foreground-body">From smarter farms to stronger agribusinesses: explore the session highlights, startup opportunities, and photos from our agripreneurship meet.</p>
        <Link href="/chapters/vizag/meets/ai-in-agri-future" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Read the meet recap <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </article>
  );
}
