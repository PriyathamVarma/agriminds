"use client";

import { CldImage } from "next-cloudinary";
import FadeIn from "@/shared/components/molecules/fadeIn";

const MARKETPLACE_PHOTOS = [
  ["Screenshot_2026-10-04_at_4.54.23_PM", 1418, 1036],
  ["Screenshot_2026-10-04_at_5.00.27_PM", 936, 890],
  ["Screenshot_2026-10-04_at_5.00.05_PM", 1204, 944],
  ["Screenshot_2026-10-04_at_4.59.37_PM", 852, 888],
  ["Screenshot_2026-10-04_at_4.59.17_PM", 766, 928],
  ["Screenshot_2026-10-04_at_4.56.34_PM", 850, 916],
  ["Screenshot_2026-10-04_at_4.58.59_PM", 748, 882],
  ["Screenshot_2026-10-04_at_4.58.34_PM", 1326, 906],
  ["Screenshot_2026-10-04_at_4.56.22_PM", 840, 962],
  ["Screenshot_2026-10-04_at_4.58.24_PM", 744, 868],
  ["Screenshot_2026-10-04_at_4.57.58_PM", 1516, 850],
  ["Screenshot_2026-10-04_at_4.57.00_PM", 888, 894],
  ["Screenshot_2026-10-04_at_4.56.04_PM", 1366, 1048],
  ["Screenshot_2026-10-04_at_4.55.10_PM", 1854, 940],
  ["Screenshot_2026-10-04_at_4.54.38_PM", 732, 1038],
] as const;

export default function MarketPlaceGallery() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">From the marketplace</p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-foreground-heading sm:text-4xl">Moments from the event</h2>
        <p className="mt-3 leading-relaxed text-foreground-body">A look at the people, products, and conversations that made Market Place possible.</p>
      </div>
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {MARKETPLACE_PHOTOS.map(([publicId, width, height], i) => (
          <FadeIn key={publicId} delay={(i % 3) * 0.06} className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-surface-card">
            <CldImage src={publicId} width={width} height={height} crop={{ type: "fill", source: true }} gravity="auto" alt="Moment from the AgriMinds Market Place event in Vizag" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="h-auto w-full transition duration-500 hover:scale-[1.03]" />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
