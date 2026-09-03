import { FileSignature, Rocket, Users } from "lucide-react";
import FadeIn from "@/shared/components/molecules/fadeIn";

const HIGHLIGHTS = [
  {
    icon: FileSignature,
    title: "MoU with RTIH",
    body: "AgriMinds signed a Memorandum of Understanding with RTIH to collaborate on and incubate agritech startups — a formal step toward building out the innovation side of the ecosystem.",
  },
  {
    icon: Rocket,
    title: "Startup collaborations",
    body: "A number of agritech startup collaborations were showcased on the day, pointing to what the ecosystem can look like as more founders, farmers, and enterprises connect through it.",
  },
  {
    icon: Users,
    title: "Farmers & FPOs took the stage",
    body: "Farmers and FPO representatives shared their own stories and experiences from the ground — the perspective the whole foundation exists to serve.",
  },
];

export default function LaunchEventHighlights() {
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {HIGHLIGHTS.map((item, i) => {
          const Icon = item.icon;
          return (
            <FadeIn key={item.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-border bg-surface-card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-4 text-lg font-semibold text-foreground-heading">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-body">{item.body}</p>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
