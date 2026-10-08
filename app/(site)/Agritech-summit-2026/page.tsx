import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Lightbulb, MapPin, Sprout } from "lucide-react";
import Breadcrumbs from "@/shared/components/seo/breadcrumbs";
import { JsonLd, eventJsonLd } from "@/shared/components/seo/jsonLd";

export const metadata: Metadata = {
  title: `AgriTech Summit 2026 Hackathon | AgriMinds`,
  description: "AgriMinds Hackathon on 30 October 2026: solve real agritech challenges across seed quality, soil data, pest action, labour, dairy, poultry, grading, post-harvest losses, food processing, labels, and direct delivery.",
  alternates: { canonical: "/Agritech-summit-2026" },
  openGraph: {
    title: "AgriTech Summit 2026 Hackathon | AgriMinds",
    description: "Real agri value-chain problem statements for students, start-ups, and innovators on 30 October 2026.",
    type: "website",
    url: "/Agritech-summit-2026",
  },
};

const TRACKS = [
  {
    name: "Pre-Production",
    description: "Help farmers make better decisions before crops and enterprises begin.",
    problems: [
      ["Seed quality check before sowing", "Farmers sow saved or local seed without knowing its germination rate. How can they test it cheaply before they sow?"],
      ["Soil data that farmers can act on", "Soil test reports exist, yet fertiliser and sowing decisions still run on habit. How can test results turn into clear, usable decisions?"],
    ],
  },
  {
    name: "Production",
    description: "Build practical tools for timely action, resilience, and farm operations.",
    problems: [
      ["Right-time pest and disease action", "Farmers spray after damage shows, or at the wrong time and dose. How can they know when to act, and how much?"],
      ["Labour at peak farm operations", "Weeding, transplanting, and harvesting need many hands in a short window, and workers are hard to find. How can this gap be closed?"],
      ["Early warning in small dairy and poultry units", "Disease, heat stress, or falling output is noticed only after the loss. How can small units catch warning signs early?"],
    ],
  },
  {
    name: "Post-Harvest",
    description: "Reduce avoidable losses and create trust from collection to processing.",
    problems: [
      ["Independent grading at the point of sale", "Buyers grade the produce and farmers cannot verify it, so they accept lower prices. How can a farmer check quality on the spot?"],
      ["Tracking losses in the first leg of the chain", "Small lots from scattered farms spoil between collection and market or processor. How can we find where the value is lost and reduce it?"],
      ["Consistent quality in micro food processing", "Small units run without measured steps, so every batch differs. How can they get consistent, hygienic output with minimal resources?"],
    ],
  },
  {
    name: "Marketing",
    description: "Help small producers reach customers with compliant, viable routes to market.",
    problems: [
      ["Compliant labels for small food brands", "Micro processors cannot easily produce labels with the required nutrition, allergen, and date details. How can they get compliant labels cheaply?"],
      ["Viable direct delivery to city buyers", "Small, scattered orders cost more to deliver than they earn, so producers sell through middlemen. How can direct sales to urban households pay off?"],
    ],
  },
] as const;

const PROBLEM_BRIEFS: Record<string, { context: string; realProblem: string; illustration: string }> = {
  "Seed quality check before sowing": { context: "Farmers often save seed from a previous harvest or buy local seed without a quick, trusted way to check whether it will germinate well.", realProblem: "A poor germination rate is discovered only after sowing. Re-sowing costs seed, labour, water, and time, while a laboratory test may be too expensive, slow, or far away.", illustration: "A farmer buys local seed, sows the whole field, and later sees that only half the plants emerge. What could help the farmer test a small sample before risking the entire field?" },
  "Soil data that farmers can act on": { context: "Soil test reports contain useful measurements, but farmers may receive numbers without a simple explanation of what to change in the next crop cycle.", realProblem: "The gap is not only collecting soil data; it is converting the data into an affordable, crop-specific decision about fertiliser, sowing, irrigation, or soil improvement.", illustration: "A farmer receives a soil report showing several values and recommendations. The farmer still follows last season’s fertiliser routine because the report does not explain the next action in a practical way. How would you turn the report into a decision?" },
  "Right-time pest and disease action": { context: "Pest and disease pressure changes with crop stage, weather, field conditions, and local spread. Farmers often act after visible damage appears.", realProblem: "Farmers need trustworthy advice on whether to act, when to act, what method to use, and the right dose—without unnecessary spraying or delayed intervention.", illustration: "A farmer notices a few damaged leaves and waits. Within a week the pest spreads across the plot, or the farmer sprays too early and spends money unnecessarily. How could the farmer know when action is justified and what to do?" },
  "Labour at peak farm operations": { context: "Weeding, transplanting, and harvesting are time-sensitive operations. Many farms need extra workers during the same short periods.", realProblem: "Workers are difficult to find at the right time, and informal arrangements provide limited visibility into availability, location, skills, and fair rates.", illustration: "A farmer’s crop is ready for harvesting, but the usual workers are already committed to nearby farms. A delay could reduce quality and price. How could the farmer find reliable help or an affordable alternative in time?" },
  "Early warning in small dairy and poultry units": { context: "Small dairy and poultry units may not have sensors, veterinarians, or regular monitoring systems. Problems become visible through illness, heat stress, or reduced output.", realProblem: "The challenge is to detect small changes early enough for an owner to take practical action before the loss becomes severe.", illustration: "A poultry owner notices that birds are drinking more and moving less, but the signs do not yet look like a serious disease. Two days later mortality begins. What low-cost warning system could prompt action earlier?" },
  "Independent grading at the point of sale": { context: "Farmers may rely on a buyer’s grading decision when selling produce, even though the grade directly affects the price they receive.", realProblem: "There is a trust and information gap: farmers need a quick, understandable, and independent way to check quality at the collection or sale point.", illustration: "A farmer brings tomatoes to a collection centre. The buyer says the lot is lower grade because of size and damage, but the farmer cannot verify the assessment. What could make the quality check visible and trustworthy?" },
  "Tracking losses in the first leg of the chain": { context: "Small lots travel from scattered farms through collection points before reaching a market or processor. Delays, heat, handling, and poor packaging can reduce value.", realProblem: "The chain often records the final quantity or price but not where quality and value were lost, making it difficult to fix the highest-impact step.", illustration: "A collection vehicle picks up produce from several villages. By the time it reaches the processor, part of the lot is spoiled, but nobody knows whether the loss happened during waiting, loading, transport, or storage. How would you locate the loss?" },
  "Consistent quality in micro food processing": { context: "Small food-processing units often depend on manual judgement instead of measured process steps, records, and repeatable quality checks.", realProblem: "A product can vary between batches in taste, safety, moisture, shelf life, or packaging, making it harder to build customer trust and grow the business.", illustration: "A women-led unit produces millet snacks that customers like, but one batch is crisp and another is soft because cooking time and moisture are judged by eye. What simple system could make every batch more consistent?" },
  "Compliant labels for small food brands": { context: "Micro processors need labels that communicate product information and meet applicable requirements, but designing and updating labels can be difficult and costly.", realProblem: "The challenge is to make nutrition, allergens, ingredients, dates, batch details, and other required information easier to prepare correctly for small production runs.", illustration: "A small pickle brand changes its pack size and recipe, but the label still has the old ingredients and date fields. The owner cannot afford a designer for every batch. How could compliant labels be created and checked simply?" },
  "Viable direct delivery to city buyers": { context: "Small producers may receive scattered orders from urban households. Delivery costs, distance, timing, and low order density can consume the margin.", realProblem: "Direct selling only works when ordering, aggregation, routing, payment, packaging, and repeat demand are coordinated well enough to beat the middleman route.", illustration: "Ten households in different parts of a city order small quantities from one farmer group. After packaging and delivery, the group earns less than it would through a wholesaler. What would make direct delivery financially viable?" },
};

export default function AgriTech2026Page() {
  return (
    <main className="bg-background">
      <JsonLd data={eventJsonLd({ name: "AgriMinds AgriTech Summit 2026 Hackathon", description: "A student and start-up hackathon focused on real agri value-chain challenges across pre-production, production, post-harvest, and marketing.", startDate: "2026-10-30", endDate: "2026-10-30", location: "YVS Murthy Auditorium", address: "Andhra University, Visakhapatnam, Andhra Pradesh", url: "https://agriminds.org/Agritech-summit-2026", eventStatus: "https://schema.org/EventScheduled" })} />
      <section className="bg-deep py-20 text-deep-foreground sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Breadcrumbs items={[{ name: "AgriTech 2026" }]} />
          <div className="mt-12 max-w-4xl">
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-accent"><Sprout className="h-4 w-4" /> AgriMinds Hackathon · Agritech Summit 2026</p>
            <h1 className="font-display mt-6 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">AgriMinds Hackathon – Agritech 2026</h1>
            <p className="mt-7 max-w-3xl text-lg leading-relaxed text-deep-foreground/85 sm:text-xl">Students and start-ups are invited to work on practical challenges faced by farmers, FPOs, dairy and poultry units, food processors, and agri-food enterprises.</p>
            <div className="mt-9 flex flex-wrap gap-3 text-sm font-semibold">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-accent-foreground"><CalendarDays className="h-4 w-4" /> 30 October 2026</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-deep-border px-4 py-2 text-deep-foreground/85"><MapPin className="h-4 w-4" /> YVS Murthy Auditorium, Andhra University, Vizag</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-border bg-surface-card p-7 sm:p-9">
            <h2 className="font-display text-3xl font-semibold text-foreground-heading">Details</h2>
            <dl className="mt-7 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="font-bold text-foreground-heading">Date</dt><dd className="mt-1 text-foreground-body"><time dateTime="2026-10-30">30 October 2026</time></dd></div>
              <div><dt className="font-bold text-foreground-heading">Venue</dt><dd className="mt-1 text-foreground-body">YVS Murthy Auditorium, Andhra University, Vizag</dd></div>
              <div><dt className="font-bold text-foreground-heading">Theme</dt><dd className="mt-1 text-foreground-body">Agritech and agri value-chain innovation</dd></div>
              <div><dt className="font-bold text-foreground-heading">Eligibility</dt><dd className="mt-1 text-foreground-body">Students and start-ups</dd></div>
              <div><dt className="font-bold text-foreground-heading">Registration opens</dt><dd className="mt-1 text-foreground-body"><time dateTime="2026-10-09">9 October 2026</time></dd></div>
              <div><dt className="font-bold text-foreground-heading">Participation fee</dt><dd className="mt-1 text-foreground-body">Free</dd></div>
            </dl>
          </article>
          <article className="rounded-3xl bg-deep p-7 text-deep-foreground sm:p-9">
            <h2 className="font-display text-3xl font-semibold">What participants will work on</h2>
            <p className="mt-5 leading-relaxed text-deep-foreground/80">The hackathon focuses on practical challenges across the agri-food value chain—from pre-production decisions and farm operations to post-harvest quality, processing, compliance, and direct market access.</p>
            <p className="mt-5 leading-relaxed text-deep-foreground/80">Teams should choose one problem, understand the people affected, and develop a practical concept, prototype, or minimum viable product.</p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Problem statements</p>
          <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight text-foreground-heading sm:text-5xl">Ten opportunities to innovate, integrate, and create impact.</h2>
          <p className="mt-5 text-lg leading-relaxed text-foreground-body">Choose a problem where your team can understand the user, test the assumptions, and build a solution that can work beyond a demo.</p>
        </div>
        <div className="mt-14 space-y-12">
          {TRACKS.map((track, trackIndex) => (
            <section key={track.name} aria-labelledby={`track-${trackIndex}`}>
              <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Track {trackIndex + 1}</p><h2 id={`track-${trackIndex}`} className="font-display mt-2 text-3xl font-semibold text-foreground-heading">{track.name}</h2></div>
                <p className="max-w-xl text-sm leading-relaxed text-foreground-muted sm:text-right">{track.description}</p>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {track.problems.map(([title, description], index) => (
                  <details key={title} className="group rounded-3xl border border-border bg-surface-card p-6 transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg sm:p-8">
                    <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex items-start justify-between gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary"><Lightbulb className="h-5 w-5" /></span><span className="font-display text-3xl text-primary/30">{String(index + 1).padStart(2, "0")}</span></div>
                    <h3 className="font-display mt-7 text-xl font-semibold text-foreground-heading sm:text-2xl">{title}</h3>
                    <p className="mt-4 leading-relaxed text-foreground-body">{description}</p>
                    <span className="mt-5 inline-flex text-sm font-semibold text-primary group-open:text-accent">Read the problem brief <span aria-hidden="true" className="ml-1 transition-transform group-open:translate-x-1">→</span></span>
                    </summary>
                    <div className="mt-7 space-y-5 border-t border-border pt-6">
                      <div><h4 className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Context</h4><p className="mt-2 leading-relaxed text-foreground-body">{PROBLEM_BRIEFS[title].context}</p></div>
                      <div><h4 className="text-sm font-bold uppercase tracking-[0.14em] text-primary">What is the real problem?</h4><p className="mt-2 leading-relaxed text-foreground-body">{PROBLEM_BRIEFS[title].realProblem}</p></div>
                      <div className="rounded-2xl bg-primary-soft px-4 py-4"><h4 className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Illustration: a real-world scenario</h4><p className="mt-2 text-sm font-medium leading-relaxed text-foreground-heading">{PROBLEM_BRIEFS[title].illustration}</p></div>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Participation guidelines</p>
            <h2 className="font-display mt-4 text-3xl font-semibold text-foreground-heading sm:text-5xl">Build for a real user, not only for a demo.</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              ["Choose one challenge", "Participating teams should select one problem statement and focus on a clear user, need, and solution."],
              ["Submit a working concept", "Teams should prepare a practical prototype, proof of concept, or minimum viable product."],
              ["Bring original work", "Solutions should be the participating team’s own work and should clearly explain what was built."],
              ["Prepare to demonstrate", "Teams should be ready to explain the problem, approach, evidence, limitations, and next steps."],
              ["Bring what you need", "Participants should plan their own equipment, software, data, and other project materials unless the organisers announce facilities."],
              ["Final rules to follow", "Team size, submission deadlines, judging criteria, prizes, registration process, and final presentation schedule will be announced by AgriMinds."],
            ].map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-border bg-surface-card p-6 sm:p-7"><h3 className="font-display text-xl font-semibold text-foreground-heading">{title}</h3><p className="mt-3 leading-relaxed text-foreground-body">{description}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="rounded-3xl bg-deep p-7 text-deep-foreground sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">For students and start-ups</p>
            <h2 className="font-display mt-4 max-w-3xl text-3xl font-semibold sm:text-4xl">Bring a user-first idea to an agri-food challenge that matters.</h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-deep-foreground/80">Registration, team details, venue, judging criteria, and submission timelines will be announced soon.</p>
            <Link href="/links" className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover">Follow AgriMinds updates <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
