import Image from "next/image";
import { VIZAG_MEET_PHOTOS } from "@/shared/data/vizagMeet";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function VizagMeetCard() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <article className="overflow-hidden rounded-3xl border border-border bg-surface-card">
        <div className="relative aspect-[16/9]">
          <Image src={VIZAG_MEET_PHOTOS[9].src} alt="Participants at the September Vizag agripreneurship meet" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Vizag chapter · Meet recap</p>
          <h2 className="font-display mt-3 text-2xl font-semibold text-foreground-heading">AI in Agri: The Future</h2>
          <p className="mt-2 text-sm text-foreground-muted">12 September 2026 · RTIH, Vizag</p>
          <p className="mt-4 text-foreground-body">Highlights from the first Vizag chapter meet on AI in agriculture, smart farming and food-processing startup opportunities.</p>
          <Link href="/chapters/vizag/meets/ai-in-agri-future" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Read the meet recap <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </article>
      <article className="overflow-hidden rounded-3xl border border-border bg-surface-card">
        <div className="relative aspect-[16/9]">
          {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary performs the HEIC-to-JPEG conversion */}
          <img src="https://res.cloudinary.com/vot5ad3f/image/upload/f_jpg,q_auto/v1791806648/IMG_6620.heic" alt="Participants at the October Vizag agripreneurship meet" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Vizag chapter · Meet recap</p>
          <h2 className="font-display mt-3 text-2xl font-semibold text-foreground-heading">Agripreneurship Meet in Vizag</h2>
          <p className="mt-2 text-sm text-foreground-muted">10 October 2026 · Visakhapatnam</p>
          <p className="mt-4 text-foreground-body">Explore the second meet’s sessions on food waste to wealth, agri-startup market readiness and practical entrepreneurship challenges.</p>
          <Link href="/chapters/vizag/meets/agripreneurship-meet-2026" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Read the meet recap <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </article>
    </div>
  );
}
