import {
  Sprout,
  Rocket,
  Building2,
  HandCoins,
  BookOpen,
  Handshake,
  Ticket,
  ScrollText,
  Briefcase,
  Mic2,
  type LucideIcon,
} from "lucide-react";

/**
 * Curated, verified Unsplash photos — real agricultural imagery, no stock-icon look.
 */
export const IMAGES = {
  hero: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
  heroGlow: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab",
  mission: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449",
  pillarFeatured: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2",
  chapterModel: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854",
  market: "https://images.unsplash.com/photo-1464226184884-fa280b87c399",
  community: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e",
  join: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf",
};

export const SITE = {
  name: "AgriMinds",
  tagline: "Agripreneur Club · From Idea to Impact · Founded in Vizag",
  description:
    "Nurturing the next generation of entrepreneurs transforming Indian agriculture & food systems.",
};

export const NAV_LINKS = [
  { label: "Pillars", href: "#pillars" },
  { label: "Chapter Model", href: "#chapter-model" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Impact", href: "#impact" },
  { label: "Join Us", href: "#join" },
];

export interface IStat {
  value: string;
  label: string;
  sublabel: string;
}

export const STATS: IStat[] = [
  { value: "6", label: "Months Running", sublabel: "Consistent agripreneur meets in Vizag" },
  { value: "3–4", label: "Ideas Progressing", sublabel: "Advanced to Prototype / early MVP stage" },
  { value: "1", label: "Founding Chapter", sublabel: "Vizag — the blueprint for every city after" },
  { value: "∞", label: "Potential Ahead", sublabel: "Scaling city by city across India" },
];

export interface IPillar {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const PILLARS: IPillar[] = [
  {
    icon: Sprout,
    title: "Idea to MVP",
    description:
      "Nurture agri entrepreneurs from raw idea through structured validation, prototyping, and MVP launch.",
  },
  {
    icon: Rocket,
    title: "Startup Mentoring",
    description:
      "Hands-on mentoring for existing agri & food startups — strategy, product, market & fundraising.",
  },
  {
    icon: Building2,
    title: "Chapter Model",
    description:
      "City-by-city expansion — each chapter self-runs all activities with a local chapter lead & board.",
  },
  {
    icon: HandCoins,
    title: "Investor Network",
    description:
      "Curate a dedicated investor community aligned to agri, food-tech, rural & impact investing themes.",
  },
  {
    icon: BookOpen,
    title: "Training Programs",
    description:
      "Curated skill programs: agri-business, technology, rural markets, supply chains & sustainability.",
  },
  {
    icon: Handshake,
    title: "Implementation Partner",
    description:
      "Partner with govt & NGOs on agri schemes, building micro-entrepreneurs at the grassroots level.",
  },
];

export const CHAPTER_MODEL_POINTS: string[] = [
  "Chapter Lead + Advisory Board drawn from local agri ecosystem",
  "Runs all 6 pillars locally — mentoring, training, partnerships & investor events",
  "Contributes to a national deal flow & investor network",
  "Connects to other chapters for cross-city collaboration",
  "Earns sustainability through training fees, partnership retainers & event revenue",
];

export interface IRoadmapPhase {
  phase: string;
  status: "done" | "active" | "upcoming";
  milestone: string;
  timeline: string;
  activities: string[];
}

export const ROADMAP_PHASES: IRoadmapPhase[] = [
  {
    phase: "Phase 1",
    status: "done",
    milestone: "Vizag — Founding Chapter",
    timeline: "Done (6 Months)",
    activities: [
      "6 months of Agripreneur Meets running",
      "3–4 ideas at Prototype / early MVP stage",
      "Built from ground up, local ecosystem partnership",
    ],
  },
  {
    phase: "Phase 2",
    status: "active",
    milestone: "Validate & Scale Vizag",
    timeline: "6–12 Months",
    activities: [
      "Launch 3–4 MVPs from current cohort",
      "Partner with 2 govt / NGO schemes",
      "Structured training & mentoring programs",
    ],
  },
  {
    phase: "Phase 3",
    status: "upcoming",
    milestone: "Chapter Expansion",
    timeline: "12–36 Months",
    activities: [
      "Launch 5 new city chapters",
      "Cross-chapter deal flow",
      "Onboard 10–15 investors to deal flow",
      "100+ entrepreneurs impacted",
    ],
  },
];

export interface IRevenueStream {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const REVENUE_STREAMS: IRevenueStream[] = [
  { icon: Ticket, title: "Membership Fee", description: "Startup & investor membership tiers with tiered benefits" },
  { icon: ScrollText, title: "Partnership Retainers", description: "Implementation fees from govt schemes & NGO projects" },
  { icon: Briefcase, title: "Training Fees", description: "Cohort-based programs for agripreneurs & agri professionals" },
  { icon: Mic2, title: "Events & Summits", description: "Demo days, investor meets, agri innovation summits — sponsorships" },
];

export interface ISuccessMetric {
  metric: string;
  target: string;
}

export const SUCCESS_METRICS: ISuccessMetric[] = [
  { metric: "Entrepreneurs Nurtured", target: "50+ / city / year" },
  { metric: "MVPs Launched", target: "10+ / city / year" },
  { metric: "Training Cohorts", target: "2 per year per chapter" },
  { metric: "Investor Partners", target: "15+ nationally" },
  { metric: "Govt / NGO Partnerships", target: "2+ per city" },
  { metric: "City Chapters (Year 3)", target: "5+ cities" },
];

export interface IJoinRole {
  title: string;
  description: string;
}

export const JOIN_ROLES: IJoinRole[] = [
  { title: "Aspiring Agripreneur", description: "You have an agri or food-systems idea and want to take it from concept to MVP." },
  { title: "Agri Startup", description: "You're already building and want mentoring, market access, or fundraising support." },
  { title: "Corporate / NGO Partner", description: "You want to co-run implementation programs or grassroots entrepreneurship schemes." },
  { title: "Investor", description: "You're looking to back agri, food-tech, rural, or impact-driven ventures." },
  { title: "City Chapter Lead", description: "You want to bring the AgriMinds chapter model to your own city." },
];

export const CONTACT_EMAIL = "hello@agriminds.in";
