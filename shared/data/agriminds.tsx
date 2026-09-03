import {
  Sprout,
  Rocket,
  Building2,
  HandCoins,
  Handshake,
  Ticket,
  ScrollText,
  Briefcase,
  Mic2,
  Factory,
  Store,
  Cpu,
  Users,
  Zap,
  Globe,
  type LucideIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import { LinkedinIcon, XIcon, InstagramIcon } from "@/shared/components/icons/socialIcons";

/**
 * Curated, verified Unsplash photos — real agricultural imagery, no stock-icon look.
 * mission, chapterModel & join are candid photos of Indian farmers/agripreneurs as
 * active decision-makers (not staged handshake/brochure shots) — verified by viewing
 * the actual image, not just the Unsplash listing text.
 */
export const IMAGES = {
  hero: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
  heroGlow: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab",
  mission: "https://images.unsplash.com/photo-1620901433789-1d2f85a93653",
  chapterModel: "https://images.unsplash.com/photo-1600150806193-cf869bcfee05",
  market: "https://images.unsplash.com/photo-1464226184884-fa280b87c399",
  community: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e",
  join: "https://images.unsplash.com/photo-1633410195091-bd66114cef5f",
};

export const SITE = {
  name: "AgriMinds",
  tagline: "From Farm to Enterprise",
  description:
    "Nurturing Indian agriculture's next generation of entrepreneurs — from a single Vizag chapter to a nationwide network built by the Agriminds Ecosystem Foundation.",
};

export const NORTH_STAR = "Every Farmer an Entrepreneur. Every FPO a Thriving Enterprise.";

export interface ISocialLink {
  label: string;
  handle: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export const SOCIAL_LINKS: ISocialLink[] = [
  {
    label: "LinkedIn",
    handle: "AgriMinds Foundation",
    href: "https://www.linkedin.com/company/agrimindsfoundation/",
    icon: LinkedinIcon,
  },
  {
    label: "X",
    handle: "@agrimindsglobal",
    href: "https://x.com/agrimindsglobal/",
    icon: XIcon,
  },
  {
    label: "Instagram",
    handle: "@agrimindsfoundation",
    href: "https://www.instagram.com/agrimindsfoundation/",
    icon: InstagramIcon,
  },
  {
    label: "Website",
    handle: "agriminds.org",
    href: "https://agriminds.org/",
    icon: Globe,
  },
];

export const NAV_LINKS = [
  { label: "Pillars", href: "#pillars" },
  { label: "Programmes", href: "#programmes" },
  { label: "Chapter Model", href: "#chapter-model" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Impact", href: "#impact" },
  { label: "Chapters", href: "/chapters" },
  { label: "Blogs", href: "/blog/launch-event" },
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
  { value: "∞", label: "Potential Ahead", sublabel: "Scaling toward a 10-year national ecosystem" },
];

export interface IPillar {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const PILLARS: IPillar[] = [
  {
    icon: Sprout,
    title: "Entrepreneur Discovery & Enterprise Development",
    description:
      "Identify and nurture entrepreneurs from farmers, FPOs, SHGs, youth, and MSMEs — from ideation and diagnostics through mentorship, incubation, and acceleration.",
  },
  {
    icon: Factory,
    title: "Value Addition & Processing",
    description:
      "Local processing hubs, solar drying, and shared facilities — turning raw produce into market-ready products.",
  },
  {
    icon: Store,
    title: "Market Access",
    description:
      "Market-driven enterprises across domestic retail, institutional procurement, digital commerce, and export channels.",
  },
  {
    icon: HandCoins,
    title: "Finance & Investment",
    description:
      "DPR preparation, loan facilitation, credit guarantees, and investment-readiness support with NABARD, banks & impact investors.",
  },
  {
    icon: Cpu,
    title: "Technology & AI",
    description:
      "The Agri Enterprise Digital Platform — an AI Business Advisor, market intelligence, demand forecasting, and traceability tools.",
  },
  {
    icon: Handshake,
    title: "Ecosystem Building",
    description:
      "Government, universities, industry, and global partners, working as one network — so no enterprise falls through the cracks.",
  },
];

export const CHAPTER_MODEL_POINTS: string[] = [
  "Chapter Lead + Advisory Board drawn from the local agri ecosystem",
  "Runs all 6 pillars locally — discovery, processing, market access, finance, tech & ecosystem building",
  "Feeds into the Agriminds Ecosystem Foundation's national deal flow, investor network, and digital platform",
  "Connects to other chapters as the Foundation expands from Andhra Pradesh into new states",
  "Earns sustainability through training fees, partnership retainers, and platform & transaction revenue",
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
    phase: "Foundation",
    status: "done",
    milestone: "Vizag — Founding Chapter",
    timeline: "Months 1–6, 2026",
    activities: [
      "6 months of Agripreneur Meets running",
      "3–4 ideas at Prototype / early MVP stage",
      "Built from the ground up on local ecosystem partnerships",
    ],
  },
  {
    phase: "Year 1",
    status: "active",
    milestone: "Prove the Model",
    timeline: "2026–27",
    activities: [
      "Launch field operations across Phase 1 states — Karnataka, Tamil Nadu, and Telangana",
      "Recruit and train the mentor network; run first enterprise diagnostics",
      "Sign NABARD partnership; facilitate the first DPRs and loans",
    ],
  },
  {
    phase: "Year 2",
    status: "upcoming",
    milestone: "Build Infrastructure & Reach",
    timeline: "2027–28",
    activities: [
      "Launch first Common Facility Centres and processing hubs",
      "Launch the Women AgriPreneur Initiative and Youth Agri Startup Mission",
      "Scale to 10,000 enterprises and 150 FPOs; expand enterprise-finance facilitation",
      "Publish the first State of Agri Entrepreneurship Report",
    ],
  },
  {
    phase: "Year 3",
    status: "upcoming",
    milestone: "Open New Geographies, Move to Export",
    timeline: "2028–29",
    activities: [
      "Launch the Agri Export Accelerator and first certification cohorts",
      "Release the AI Business Advisor publicly",
      "Reach 25,000 enterprises and 350 FPOs; deepen domestic and export market linkages",
    ],
  },
  {
    phase: "Year 4–5",
    status: "upcoming",
    milestone: "First Graduations, National Rollout",
    timeline: "2029–31",
    activities: [
      "First FPO cohorts graduate to self-sustaining status",
      "Reach 75,000 enterprises, 800 FPOs, and 250+ export-ready enterprises",
      "Begin Phase 3 pan-India expansion",
      "Independent mid-term evaluation recalibrates Years 6–10 targets",
    ],
  },
  {
    phase: "Years 6–10",
    status: "upcoming",
    milestone: "Consolidate & Shift to Sustainability",
    timeline: "2031–36",
    activities: [
      "Complete pan-India presence; scale the digital platform to full ESG, CRM & traceability",
      "Shift revenue mix toward platform subscriptions, transaction fees & training income",
      "Reach 100,000 enterprises, 1,000 FPOs, and 1 million families with improved livelihoods",
      "Publish the ten-year impact report",
    ],
  },
];

export interface IRevenueStream {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const REVENUE_STREAMS: IRevenueStream[] = [
  {
    icon: Ticket,
    title: "Platform Subscriptions",
    description: "Enterprise & FPO subscriptions to the Agriminds Digital Platform — business tools, market intelligence & the AI Business Advisor",
  },
  {
    icon: ScrollText,
    title: "Market Facilitation Fees",
    description: "Transaction-linked fees on market linkages brokered across retail, digital commerce & export channels",
  },
  {
    icon: Briefcase,
    title: "Certification & Training Fees",
    description: "Cohort-based training, quality certification & DPR / loan-readiness programs for entrepreneurs and FPOs",
  },
  {
    icon: Mic2,
    title: "Partnerships & Grants",
    description: "Government contracts, CSR & blended-finance partnerships that fund core institution-building and infrastructure",
  },
];

export interface ISuccessMetric {
  metric: string;
  target: string;
}

export const SUCCESS_METRICS: ISuccessMetric[] = [
  { metric: "Agri-Food Enterprises Enabled", target: "100,000+" },
  { metric: "FPOs Transformed", target: "1,000+" },
  { metric: "Farming Families Impacted", target: "1,000,000+" },
  { metric: "Export-Ready Enterprises", target: "500+" },
  { metric: "Women-Led Enterprises", target: "25,000+" },
  { metric: "Youth Entrepreneurs Supported", target: "50,000+" },
  { metric: "Rural Jobs Created", target: "500,000+" },
];

export interface IFlagshipProgram {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FLAGSHIP_PROGRAMS: IFlagshipProgram[] = [
  {
    icon: Rocket,
    title: "Agriminds Enterprise Accelerator",
    description: "A 12-month programme for growth-stage enterprises — structured mentorship, working-capital facilitation, and market linkage sprints.",
  },
  {
    icon: Building2,
    title: "FPO Business Transformation Programme",
    description: "Turns producer organizations into professionally managed enterprises through governance reform, financial systems, and commercial contract support.",
  },
  {
    icon: Users,
    title: "Women AgriPreneur Initiative",
    description: "Women-owned rural businesses built through targeted incubation, dedicated financing windows, and peer mentor networks.",
  },
  {
    icon: Zap,
    title: "Youth Agri Startup Mission",
    description: "Young rural entrepreneurs backed with seed capital linkages, digital-first business models, and technology adoption support.",
  },
  {
    icon: Globe,
    title: "Agri Export Accelerator",
    description: "Certification support, buyer discovery, and trade facilitation to prepare enterprises for export markets.",
  },
  {
    icon: Factory,
    title: "Rural Food Processing Mission",
    description: "Village-level value addition through shared processing infrastructure and quality systems.",
  },
  {
    icon: Cpu,
    title: "AI for Agriculture Programme",
    description: "Practical AI tools for MSMEs and FPOs, including the AI Business Advisor and demand-forecasting modules.",
  },
];

export interface IJoinRole {
  title: string;
  description: string;
}

export const JOIN_ROLES: IJoinRole[] = [
  { title: "Aspiring Agripreneur", description: "You have an agri or food-systems idea and want to take it from concept to MVP." },
  { title: "Agri Startup", description: "You're already building and want mentoring, market access, or fundraising support." },
  { title: "FPO / Producer Organization", description: "You lead a producer group and want governance, financial systems & market-access support to become a thriving enterprise." },
  { title: "Corporate / NGO Partner", description: "You want to co-run implementation programs or grassroots entrepreneurship schemes." },
  { title: "Investor", description: "You're looking to back agri, food-tech, rural, or impact-driven ventures." },
  { title: "Government / Policy Partner", description: "You represent a government body or scheme and want to co-implement FPO or enterprise programs." },
  { title: "City Chapter Lead", description: "You want to bring the AgriMinds chapter model to your own city." },
];

export const CONTACT_EMAIL = "contact@agriminds.org";
