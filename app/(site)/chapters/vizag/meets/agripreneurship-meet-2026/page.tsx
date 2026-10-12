import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { JsonLd, eventJsonLd } from "@/shared/components/seo/jsonLd";
import Image from "next/image";
import { VIZAG_OCTOBER_MEET_PHOTOS } from "@/shared/data/vizagMeet";

export const metadata: Metadata = {
  title: "Agripreneurship Meet in Vizag | AgriMinds Vizag Chapter",
  description:
    "Read the AgriMinds Agripreneurship Meet 2026 recap from Visakhapatnam: food waste to wealth, market readiness for agri-startups, and practical entrepreneurship challenges.",
  alternates: { canonical: "/chapters/vizag/meets/agripreneurship-meet-2026" },
};

const wasteTechnologies = [
  ["Fermentation", "Bio-enzymes, organic acids and bio-cleaners"],
  ["Extraction", "Essential oils, starch, pectin and antioxidants"],
  ["Pyrolysis", "Biochar, bio-oil and activated carbon"],
  ["Compression moulding", "Biodegradable plates, cups, packaging and boards"],
  ["Biomethanation", "Biogas, compressed biogas and organic manure"],
  ["Biological conversion", "Insect protein, insect oil and organic fertiliser"],
];

const marketStages = [
  ["Idea", "Identify a real customer problem that is important enough to pay to solve."],
  ["Validation", "Test a minimum viable product in real conditions with early customers."],
  ["Traction", "Look for repeat purchases, customer acquisition patterns and positive margins."],
  ["Market fit", "Demonstrate sustained demand, retention, referrals and pricing acceptance."],
  ["Scale", "Expand only when the operating model is repeatable and financially sustainable."],
];

const crisisScenarios = [
  "A bulk order is larger than the startup’s current production capacity.",
  "A key raw-material supplier unexpectedly stops supplying.",
  "A retailer asks for compliance documentation the startup does not yet have.",
  "Product quality deteriorates before the required shelf life.",
  "A competitor launches a similar product at a much lower price.",
  "A major customer asks for extended payment terms, creating a working-capital gap.",
];

export default function AgripreneurshipMeet2026Page() {
  const url = "https://agriminds.org/chapters/vizag/meets/agripreneurship-meet-2026";

  return (
    <div className="bg-background">
      <JsonLd
        data={eventJsonLd({
          name: "AgriMinds Agripreneurship Meet in Vizag",
          description: "A Vizag chapter meet on food waste to wealth, agri-startup market readiness and practical entrepreneurship.",
          startDate: "2026-10-10T16:00:00+05:30",
          endDate: "2026-10-10T19:00:00+05:30",
          location: "Visakhapatnam",
          address: "Visakhapatnam, Andhra Pradesh, India",
          url,
        })}
      />
      <section className="bg-deep py-16 text-deep-foreground sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Link href="/chapters/vizag" className="inline-flex items-center gap-2 text-sm text-deep-foreground/80 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Vizag chapter
          </Link>
          <p className="mt-10 text-xs font-semibold tracking-widest text-accent uppercase">Agripreneurship Meet in Vizag · 10 October 2026</p>
          <h1 className="font-display mt-4 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">Turning agricultural challenges into viable enterprises</h1>
          <p className="mt-6 max-w-3xl text-xl leading-relaxed text-deep-foreground/90">A Vizag chapter learning meet on the AgriMinds ecosystem, food waste to wealth, agri-startup market readiness and practical entrepreneurship.</p>
          <p className="mt-7 text-sm text-deep-foreground/80"><time dateTime="2026-10-10">10 October 2026</time> · Visakhapatnam, Andhra Pradesh</p>
          <Image src={VIZAG_OCTOBER_MEET_PHOTOS[0].src} width={VIZAG_OCTOBER_MEET_PHOTOS[0].width} height={VIZAG_OCTOBER_MEET_PHOTOS[0].height} alt="Participants at the AgriMinds Agripreneurship Meet in Vizag" sizes="(max-width: 1024px) 100vw, 720px" unoptimized className="mt-10 h-auto w-full rounded-3xl" priority />
          <a href="#meet-highlights" className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-hover">Explore the meet highlights <ArrowRight className="h-4 w-4" /></a>
        </div>
      </section>

      <section id="meet-highlights" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Vizag chapter recap</p>
        <h2 className="font-display mt-3 max-w-4xl text-3xl font-semibold text-foreground-heading sm:text-4xl">From a real problem to a sustainable agri-business</h2>
        <p className="mt-5 max-w-4xl text-lg leading-relaxed text-foreground-body">The AgriMinds Agripreneurship Meet connected agricultural entrepreneurship with practical business decisions. The sessions explored how farmers, FPOs and founders can identify opportunities, test solutions, find customers, build partnerships and grow responsibly.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["AgriMinds ecosystem", "A collaborative network supporting farmers, FPOs, founders, mentors, investors and market partners."],
            ["Food waste to wealth", "Technologies and enterprise ideas that turn residues, by-products and surplus food into value."],
            ["Market readiness", "A practical view of validation, unit economics, partnerships, compliance and responsible scaling."],
          ].map(([title, text]) => <article key={title} className="rounded-3xl border border-border bg-surface-card p-6"><h3 className="font-display text-xl font-semibold text-foreground-heading">{title}</h3><p className="mt-3 leading-relaxed text-foreground-body">{text}</p></article>)}
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="font-display text-3xl font-semibold text-foreground-heading">The AgriMinds ecosystem</h2>
          <p className="mt-4 max-w-4xl leading-relaxed text-foreground-body">The Vizag chapter is the starting point for AgriMinds’ wider network. The long-term vision presented at the meet is to support 100,000 profitable agri-food enterprises by 2036, improve the livelihoods of one million farming families and help transform more than 1,000 FPOs.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-5">{["Consult", "Connect", "Curate", "Conduct", "Capitalize"].map((item) => <div key={item} className="rounded-2xl border border-border bg-background p-5"><p className="font-semibold text-primary">{item}</p><p className="mt-2 text-sm leading-relaxed text-foreground-body">A pathway from guidance and partnerships to training, finance and investment readiness.</p></div>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Session one</p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-foreground-heading">From waste to wealth</h2>
        <p className="mt-4 max-w-4xl leading-relaxed text-foreground-body">The session distinguished food loss, which happens during production, harvesting, storage, transport and processing, from food waste at retail, food-service and household level. It framed prevention, better infrastructure and responsible conversion as both sustainability interventions and entrepreneurship opportunities.</p>
        <p className="mt-4 max-w-4xl text-sm leading-relaxed text-foreground-muted">The training material cited estimates of 40–45% losses in fruits, 30% in vegetables and approximately ₹92,651 crore in annual post-harvest economic losses. These figures are reproduced as presented in the material and were not independently verified for this recap.</p>
        <div className="mt-8 overflow-hidden rounded-3xl border border-border"><div className="grid grid-cols-[1fr_1.5fr] bg-surface px-5 py-4 text-sm font-semibold text-foreground-heading"><span>Technology</span><span>Potential products</span></div>{wasteTechnologies.map(([technology, products]) => <div key={technology} className="grid grid-cols-[1fr_1.5fr] border-t border-border px-5 py-4 text-sm"><span className="font-medium text-foreground-heading">{technology}</span><span className="text-foreground-body">{products}</span></div>)}</div>
        <p className="mt-6 max-w-4xl leading-relaxed text-foreground-body">Examples discussed included banana peels, mango seeds, citrus peels, rice husks, bagasse, coconut shells, coffee grounds, vegetable trimmings, eggshells and fish scales. Black Soldier Fly conversion was also introduced as a route to insect meal, oil and frass-based organic fertiliser. The practical question is always the same: is the material available reliably, can it be processed safely, and is there a paying customer?</p>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Session two · Presented by Narendra Nerla</p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-foreground-heading">Market readiness of agri-startups</h2>
          <p className="mt-4 max-w-4xl leading-relaxed text-foreground-body">A promising product is not automatically a viable business. The session focused on understanding the customer, testing a minimum viable product, tracking repeat demand, managing cash and building the capability to deliver consistently.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-5">{marketStages.map(([stage, description], i) => <article key={stage} className="rounded-2xl border border-border bg-background p-5"><p className="font-display text-3xl text-primary/50">0{i + 1}</p><h3 className="mt-3 font-semibold text-foreground-heading">{stage}</h3><p className="mt-2 text-sm leading-relaxed text-foreground-body">{description}</p></article>)}</div>
          <div className="mt-8 grid gap-6 md:grid-cols-2"><article className="rounded-3xl border border-border bg-background p-6"><h3 className="font-display text-2xl font-semibold text-foreground-heading">Test before you scale</h3><p className="mt-3 leading-relaxed text-foreground-body">Examples included offering agricultural advice through WhatsApp before building an app, renting machinery before buying it and testing food products in small batches. A useful test defines one customer segment, product, geography and measurable target.</p></article><article className="rounded-3xl border border-border bg-background p-6"><h3 className="font-display text-2xl font-semibold text-foreground-heading">Know your runway</h3><p className="mt-3 leading-relaxed text-foreground-body">Runway = available cash ÷ monthly net burn. For example, ₹60 lakh in cash and ₹5 lakh monthly net burn gives approximately 12 months of runway. Seasonal revenue and working capital must be included in the plan.</p></article></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Practical entrepreneurship challenges</p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-foreground-heading">Learning by making decisions</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-border bg-surface-card p-6 sm:p-8"><h3 className="font-display text-2xl font-semibold text-foreground-heading">100 KG Waste Challenge</h3><p className="mt-4 leading-relaxed text-foreground-body">Teams choose an agricultural or food waste stream and develop a business concept for converting 100 kg of it into a valuable product. They consider sourcing, processing technology, customers, pricing and economics—not just the product idea.</p></article>
          <article className="rounded-3xl border border-border bg-surface-card p-6 sm:p-8"><h3 className="font-display text-2xl font-semibold text-foreground-heading">Startup Survival Game</h3><p className="mt-4 leading-relaxed text-foreground-body">Teams work with simulated ₹100 capital, prioritise resources such as compliance and marketing support, then respond to business crises using what they acquired.</p><ul className="mt-5 space-y-2 text-sm leading-relaxed text-foreground-body">{crisisScenarios.map((scenario) => <li key={scenario} className="flex gap-2"><span className="text-primary">•</span>{scenario}</li>)}</ul></article>
        </div>
        <p className="mt-6 text-sm leading-relaxed text-foreground-muted">These activities describe the proposed learning format. The presentations and planning notes do not independently document which resources teams selected, how teams performed or what outcomes were achieved.</p>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="font-display text-3xl font-semibold text-foreground-heading">Moments from the Vizag meet</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {VIZAG_OCTOBER_MEET_PHOTOS.map((photo, index) => <a key={photo.src} href={photo.src} target="_blank" rel="noopener noreferrer" className="relative aspect-[3/4] overflow-hidden rounded-2xl"><Image src={photo.src} alt={`AgriMinds Agripreneurship Meet in Vizag — photo ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 25vw" unoptimized className="object-cover transition duration-300 hover:scale-105" /></a>)}
          </div>
        </div>
      </section>

      <section className="bg-deep py-16 text-deep-foreground sm:py-20">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8"><h2 className="font-display text-3xl font-semibold sm:text-4xl">The Vizag chapter is where ideas become enterprises</h2><p className="mt-5 leading-relaxed text-deep-foreground/85">Identify a real problem. Find a viable solution. Understand the customer. Build a sustainable business model. Start small, validate and scale responsibly.</p><Link href="/chapters/vizag" className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-hover">Explore the Vizag chapter <ArrowRight className="h-4 w-4" /></Link></div>
      </section>
    </div>
  );
}
