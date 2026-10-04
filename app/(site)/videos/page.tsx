import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Play } from "lucide-react";
import { SITE } from "@/shared/data/agriminds";
import Breadcrumbs from "@/shared/components/seo/breadcrumbs";
import { JsonLd, videoJsonLd } from "@/shared/components/seo/jsonLd";

export const metadata: Metadata = {
  title: `Videos — ${SITE.name}`,
  description: "Watch videos about AgriMinds, its community, and the enterprises it supports.",
  alternates: { canonical: "/videos" },
};

const VIDEOS = [
  { id: "QcpPkA22df8", title: "AgriMinds Market Place", description: "A look at the October 2026 marketplace where FPOs, farmers, and agri-focused enterprises met their customers in Vizag.", label: "Event highlight", url: "https://www.youtube.com/watch?v=QcpPkA22df8&t=1s" },
  { id: "KjO2CIx2ck8", title: "Telling the AgriMinds story", description: "A video sharing more about AgriMinds and the ecosystem it is building for farmers and agri-enterprises.", label: "About AgriMinds", url: "https://youtu.be/KjO2CIx2ck8?si=trluUixYwn8QeJsS" },
];

export default function VideosPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <JsonLd data={videoJsonLd({ name: "AgriMinds Market Place", description: "A look at the October 2026 marketplace in Vizag.", videoId: "QcpPkA22df8" })} />
      <JsonLd data={videoJsonLd({ name: "Telling the AgriMinds story", description: "A video about AgriMinds and the ecosystem it is building.", videoId: "KjO2CIx2ck8" })} />
      <Breadcrumbs items={[{ name: "Videos" }]} />
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
      <div className="max-w-3xl"><p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Watch and learn</p><h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-foreground-heading sm:text-6xl">Videos about AgriMinds</h1><p className="mt-6 text-lg leading-relaxed text-foreground-body">Stories from our events, community, and the people working to build stronger agri-enterprises.</p></div>
      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        {VIDEOS.map((video) => <article key={video.id} className="overflow-hidden rounded-3xl border border-border bg-surface-card shadow-[0_14px_38px_rgba(20,32,26,0.07)]"><div className="aspect-video bg-deep"><iframe className="h-full w-full" src={`https://www.youtube.com/embed/${video.id}`} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><div className="p-6 sm:p-8"><p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{video.label}</p><h2 className="font-display mt-3 text-2xl font-semibold text-foreground-heading">{video.title}</h2><p className="mt-3 leading-relaxed text-foreground-body">{video.description}</p><a href={video.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><Play className="h-4 w-4" /> Open on YouTube <ExternalLink className="h-3.5 w-3.5" /></a></div></article>)}
      </div>
    </main>
  );
}
