"use client";

import { CldImage } from "next-cloudinary";
import FadeIn from "@/shared/components/molecules/fadeIn";

// Sourced from the "Agriminds/Launch-event" folder in Cloudinary — public IDs are Cloudinary's
// own auto-generated names (dynamic folders keep the folder as metadata rather than a public_id
// prefix, so these are used bare, not "Agriminds/Launch-event/photo_...").
const LAUNCH_EVENT_PHOTOS = [
  { publicId: "photo_3357985", width: 2048, height: 1365 },
  { publicId: "photo_3358126", width: 2048, height: 1365 },
  { publicId: "photo_3358300", width: 2048, height: 1365 },
  { publicId: "photo_3358377", width: 2048, height: 1365 },
];

export default function LaunchEventGallery() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <h2 className="font-display text-2xl font-semibold text-foreground-heading sm:text-3xl">Moments from the Day</h2>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {LAUNCH_EVENT_PHOTOS.map((photo, i) => (
          <FadeIn key={photo.publicId} delay={i * 0.08} className="overflow-hidden rounded-2xl border border-border">
            <CldImage
              src={photo.publicId}
              width={photo.width}
              height={photo.height}
              crop={{ type: "fill", source: true }}
              gravity="auto"
              alt="Photograph from the AgriMinds launch event in Vizag"
              sizes="(min-width: 640px) 50vw, 100vw"
              className="aspect-3/2 h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
            />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
