import React from "react";
import {
  Check,
  BarChart3,
  Quote,
  Layers,
  Rocket,
  Target,
  Sparkles,
  Globe2,
  Users,
  Zap,
  Shield,
  TrendingUp,
  Heart,
  Leaf,
  Palette,
  Megaphone,
  Compass,
  LineChart,
  PieChart,
  Activity,
  Award,
  Lightbulb,
  Building2,
  Cpu,
  Crown,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { DeckTemplate } from "./TemplateGallery";
import { TEMPLATE_THUMBNAILS } from "./templateThumbnails";

/**
 * Per-template demo content. Each template reads like a real, fully-built mini deck
 * with industry-specific copy, advanced layouts, and varied imagery.
 */
export interface DemoCard {
  title: string;
  body: string;
  icon?: LucideIcon;
  /** Short tag rendered as a pill badge */
  tag?: string;
  /** Optional bullet sub-points shown beneath the body */
  subPoints?: string[];
  /** Optional footnote / source line */
  footnote?: string;
}

export interface DemoMetric {
  value: string;
  label: string;
  trend?: string;
  icon?: LucideIcon;
  /** Smaller secondary label, e.g. "vs prior period" */
  sublabel?: string;
  /** Direction marker, "up" | "down" | "flat" */
  direction?: "up" | "down" | "flat";
}

export interface DemoAgendaItem {
  step: string;
  title: string;
  body: string;
  /** Estimated time on this section */
  duration?: string;
  /** Person leading this section */
  owner?: string;
}

export interface DemoTimelineItem {
  when: string;
  title: string;
  body: string;
  /** Concrete deliverables shipped at this milestone */
  deliverables?: string[];
  /** Who owns this milestone */
  owner?: string;
}

export interface DemoCompare {
  heading: string;
  before: { title: string; points: string[] };
  after: { title: string; points: string[] };
}

export interface DemoChart {
  title: string;
  unit?: string;
  series: { label: string; value: number }[];
  trendline?: number[];
}

export interface DemoTeamMember {
  name: string;
  role: string;
  initials: string;
  /** City / region label */
  location?: string;
  /** Short pull-quote or focus area */
  focus?: string;
}

export interface DemoPricingTier {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  highlighted?: boolean;
  /** Limits / fine-print line shown under price */
  limit?: string;
  /** Call-to-action label shown at bottom of tier */
  cta?: string;
}

export interface DemoProcessStep {
  step: string;
  title: string;
  body: string;
  icon?: LucideIcon;
  /** Deliverable produced by this step */
  output?: string;
  /** How long the step typically takes */
  duration?: string;
}

export interface DemoBentoTile {
  size: "lg" | "md" | "sm" | "wide" | "tall";
  title: string;
  body?: string;
  metric?: string;
  icon?: LucideIcon;
  imageIndex?: number;
}

export interface DemoKpi {
  headline: string;
  big: string;
  bigLabel: string;
  supporting: { value: string; label: string }[];
}

export interface DemoContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Optional per-template imagery (Unsplash URLs). Slides cycle through these. */
  imagery?: string[];
  cards: DemoCard[];
  stat: { value: string; label: string };
  quote: { text: string; by: string };
  agenda: DemoAgendaItem[];
  metrics: DemoMetric[];
  timeline: DemoTimelineItem[];
  compare: DemoCompare;
  chart: DemoChart;
  // Advanced layouts
  team: DemoTeamMember[];
  pricing: DemoPricingTier[];
  process: DemoProcessStep[];
  bento: DemoBentoTile[];
  kpi: DemoKpi;
}

/* --------- Imagery presets (Unsplash, 800px, crop) ---------- */
const IMG = {
  // global / corporate
  globe: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&auto=format&fit=crop&q=70",
  city: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=900&auto=format&fit=crop&q=70",
  meeting: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&auto=format&fit=crop&q=70",
  servers: "https://images.unsplash.com/photo-1551808525-51a94da548ce?w=900&auto=format&fit=crop&q=70",
  // tech / dark
  code: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&auto=format&fit=crop&q=70",
  abstract: "https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=900&auto=format&fit=crop&q=70",
  neon: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=70",
  workspace: "https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=900&auto=format&fit=crop&q=70",
  // editorial / magazine
  editorial: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=900&auto=format&fit=crop&q=70",
  reading: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=900&auto=format&fit=crop&q=70",
  paper: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=900&auto=format&fit=crop&q=70",
  portrait: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=70",
  // finance / corporate navy
  skyline: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=900&auto=format&fit=crop&q=70",
  charts: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=70",
  boardroom: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=900&auto=format&fit=crop&q=70",
  handshake: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900&auto=format&fit=crop&q=70",
  // startup / vibrant
  team: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&auto=format&fit=crop&q=70",
  rocket: "https://images.unsplash.com/photo-1518306727298-4c17e1bf6942?w=900&auto=format&fit=crop&q=70",
  product: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&auto=format&fit=crop&q=70",
  celebrate: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&auto=format&fit=crop&q=70",
  // wellness / terracotta
  botanical: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=900&auto=format&fit=crop&q=70",
  candle: "https://images.unsplash.com/photo-1602874801006-2bd4f4c61237?w=900&auto=format&fit=crop&q=70",
  ceramic: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=900&auto=format&fit=crop&q=70",
  artisan: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&auto=format&fit=crop&q=70",
  // brutalist / mono
  type: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=900&auto=format&fit=crop&q=70",
  concrete: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&auto=format&fit=crop&q=70",
  print: "https://images.unsplash.com/photo-1503602642458-232111445657?w=900&auto=format&fit=crop&q=70",
  studio: "https://images.unsplash.com/photo-1561070791-2526d30994b8?w=900&auto=format&fit=crop&q=70",
};

const IMAGERY_BY_TEMPLATE: Record<string, string[]> = {
  "transperfect-2026": [IMG.globe, IMG.meeting, IMG.servers, IMG.city],
  "modern-dark": [IMG.code, IMG.neon, IMG.workspace, IMG.abstract],
  "editorial-light": [IMG.editorial, IMG.reading, IMG.paper, IMG.portrait],
  "corporate-navy": [IMG.skyline, IMG.boardroom, IMG.charts, IMG.handshake],
  "vibrant-startup": [IMG.team, IMG.rocket, IMG.product, IMG.celebrate],
  "warm-terracotta": [IMG.botanical, IMG.candle, IMG.ceramic, IMG.artisan],
  "mono-brutalist": [IMG.type, IMG.concrete, IMG.print, IMG.studio],
};

/* ------------------------- Per-template content ------------------------- */
export const DEMO_BY_TEMPLATE: Record<string, DemoContent> = {
  "transperfect-2026": {
    eyebrow: "Global Solutions · 2026",
    title: "Speak every market.",
    subtitle: "Language & AI for the world's biggest brands.",
    imagery: IMAGERY_BY_TEMPLATE["transperfect-2026"],
    cards: [
      { title: "GlobalLink NEXT", body: "AI translation platform unifying every content workflow.", icon: Cpu },
      { title: "200+ languages", body: "Native expert network across 140 countries.", icon: Globe2 },
      { title: "24/7 delivery", body: "Always-on localization with global handoff coverage.", icon: Zap },
    ],
    stat: { value: "5B+", label: "words translated yearly" },
    quote: { text: "From content to commerce — in any language.", by: "TransPerfect" },
    agenda: [
      { step: "01", title: "The opportunity", body: "Why global content matters now" },
      { step: "02", title: "Our platform", body: "GlobalLink NEXT in action" },
      { step: "03", title: "Proof points", body: "Customers, scale, results" },
      { step: "04", title: "What's next", body: "Roadmap & partnership" },
    ],
    metrics: [
      { value: "200+", label: "Languages", icon: Globe2, trend: "+12 YoY" },
      { value: "5B", label: "Words / yr", icon: Activity, trend: "+34%" },
      { value: "98%", label: "On-time", icon: Shield, trend: "SLA" },
      { value: "10k+", label: "Linguists", icon: Users, trend: "Vetted" },
    ],
    timeline: [
      { when: "Q1", title: "Pilot", body: "3 markets, 5 content types" },
      { when: "Q2", title: "Scale", body: "12 markets live" },
      { when: "Q3", title: "Automate", body: "AI workflow rollout" },
      { when: "Q4", title: "Optimize", body: "Outcome-based pricing" },
    ],
    compare: {
      heading: "Manual vs. GlobalLink NEXT",
      before: { title: "Traditional", points: ["6–8 wk turnaround", "Inconsistent voice", "Per-word billing", "Manual QA"] },
      after: { title: "TransPerfect", points: ["48hr turnaround", "Brand-trained AI", "Outcome pricing", "Automated QA"] },
    },
    chart: {
      title: "Words translated (B)",
      unit: "B",
      series: [
        { label: "'22", value: 2.1 },
        { label: "'23", value: 3.0 },
        { label: "'24", value: 3.8 },
        { label: "'25", value: 4.6 },
        { label: "'26E", value: 5.4 },
      ],
      trendline: [2.1, 3.0, 3.8, 4.6, 5.4],
    },
    team: [
      { name: "Phil Shawe", role: "Co-Founder & CEO", initials: "PS" },
      { name: "Liz Elting", role: "Founding Partner", initials: "LE" },
      { name: "Jin Park", role: "Chief AI Officer", initials: "JP" },
      { name: "Sara Okafor", role: "President, EMEA", initials: "SO" },
    ],
    pricing: [
      { name: "Connect", price: "Custom", cadence: "per project", tagline: "Single-market pilots", features: ["1 language pair", "Standard SLA", "Email support", "Self-serve portal"] },
      { name: "Scale", price: "$0.08", cadence: "per word", tagline: "Multi-market growth", features: ["10+ language pairs", "48hr SLA", "Dedicated PM", "GlobalLink TMS", "Brand glossary"], highlighted: true },
      { name: "Enterprise", price: "Outcome", cadence: "based pricing", tagline: "Always-on global", features: ["Unlimited locales", "24/7 SLA", "On-site team", "Custom AI models", "SOC 2 + HIPAA"] },
    ],
    process: [
      { step: "01", title: "Source", body: "Connect CMS, code, or design tool", icon: Compass },
      { step: "02", title: "Translate", body: "AI + linguist hybrid pipeline", icon: Cpu },
      { step: "03", title: "Review", body: "In-context preview with brand QA", icon: Shield },
      { step: "04", title: "Publish", body: "Auto-deploy to every locale", icon: Globe2 },
      { step: "05", title: "Optimize", body: "Measure & retrain on outcomes", icon: TrendingUp },
    ],
    bento: [
      { size: "lg", title: "200+ languages, one workflow", body: "From Pashto to Portuguese — managed end-to-end.", imageIndex: 0, icon: Globe2 },
      { size: "md", title: "5B words / yr", metric: "5B", icon: Activity },
      { size: "sm", title: "48hr SLA", metric: "48h", icon: Zap },
      { size: "wide", title: "Trusted by 4 of the top 5 global brands", body: "Apple · LVMH · Pfizer · Toyota", icon: Award },
      { size: "md", title: "98% on-time", metric: "98%", icon: Shield },
    ],
    kpi: {
      headline: "The world's largest privately-held language services company.",
      big: "$1.2B",
      bigLabel: "annual revenue · 2025",
      supporting: [
        { value: "9,000+", label: "Employees globally" },
        { value: "140", label: "Countries served" },
        { value: "300+", label: "Enterprise customers" },
        { value: "30 yrs", label: "Industry leadership" },
      ],
    },
  },
  "modern-dark": {
    eyebrow: "Product · 2026 Roadmap",
    title: "Build what's next.",
    subtitle: "A high-contrast tech narrative for product teams.",
    imagery: IMAGERY_BY_TEMPLATE["modern-dark"],
    cards: [
      { title: "Ship faster", body: "Velocity up 3x with continuous deploys and instant rollbacks.", icon: Rocket },
      { title: "Stay aligned", body: "Single source of truth across product, design, and engineering.", icon: Target },
      { title: "Scale safely", body: "Enterprise-grade reliability, multi-region by default.", icon: Shield },
    ],
    stat: { value: "98%", label: "uptime delivered" },
    quote: { text: "Speed is a feature.", by: "Engineering" },
    agenda: [
      { step: "01", title: "State of the craft", body: "Where we are today" },
      { step: "02", title: "The thesis", body: "Why now, why us" },
      { step: "03", title: "Roadmap", body: "Next 4 quarters" },
      { step: "04", title: "Investment", body: "What we need" },
    ],
    metrics: [
      { value: "3x", label: "Velocity", icon: Rocket, trend: "vs LY" },
      { value: "98%", label: "Uptime", icon: Activity, trend: "SLO met" },
      { value: "42", label: "Releases / mo", icon: Zap, trend: "+19" },
      { value: "<2m", label: "P95 build", icon: Cpu, trend: "−43%" },
    ],
    timeline: [
      { when: "Q1", title: "Foundations", body: "Platform v2 GA" },
      { when: "Q2", title: "AI native", body: "Copilot in every flow" },
      { when: "Q3", title: "Enterprise", body: "SSO, audit, regions" },
      { when: "Q4", title: "Marketplace", body: "Partner extensions" },
    ],
    compare: {
      heading: "Before vs. After Platform v2",
      before: { title: "Legacy", points: ["Weekly deploys", "Tribal knowledge", "Manual QA", "Single region"] },
      after: { title: "Platform v2", points: ["Continuous deploy", "Living docs", "Test automation", "Multi-region"] },
    },
    chart: {
      title: "Monthly active builders",
      series: [
        { label: "Jan", value: 12 },
        { label: "Feb", value: 18 },
        { label: "Mar", value: 22 },
        { label: "Apr", value: 31 },
        { label: "May", value: 44 },
        { label: "Jun", value: 58 },
      ],
      trendline: [12, 18, 22, 31, 44, 58],
    },
    team: [
      { name: "Maya Chen", role: "VP Engineering", initials: "MC" },
      { name: "Diego Ruiz", role: "Head of Platform", initials: "DR" },
      { name: "Ana Patel", role: "Principal Designer", initials: "AP" },
      { name: "Tomás Lin", role: "Staff PM, AI", initials: "TL" },
    ],
    pricing: [
      { name: "Hobby", price: "$0", cadence: "forever", tagline: "Tinker & ship side projects", features: ["1 project", "Community support", "Public deploys", "1GB storage"] },
      { name: "Pro", price: "$24", cadence: "per dev / mo", tagline: "Teams shipping daily", features: ["Unlimited projects", "Preview envs", "Priority CI", "20GB storage", "Audit log"], highlighted: true },
      { name: "Enterprise", price: "Custom", cadence: "annual", tagline: "Regulated & global", features: ["SSO + SCIM", "On-prem option", "SLA 99.99%", "Dedicated CSM", "Custom regions"] },
    ],
    process: [
      { step: "01", title: "Plan", body: "Branch a typed spec from main", icon: Target },
      { step: "02", title: "Build", body: "AI pair-programmer in your IDE", icon: Cpu },
      { step: "03", title: "Preview", body: "Auto-deployed environment per PR", icon: Layers },
      { step: "04", title: "Ship", body: "Progressive rollout with guardrails", icon: Rocket },
      { step: "05", title: "Learn", body: "Telemetry feeds the next branch", icon: Activity },
    ],
    bento: [
      { size: "lg", title: "AI-native dev loop", body: "Copilot, preview, rollout — one keystroke.", imageIndex: 0, icon: Cpu },
      { size: "md", title: "P95 < 2m builds", metric: "<2m", icon: Zap },
      { size: "sm", title: "98% uptime", metric: "98%", icon: Activity },
      { size: "wide", title: "Used by 2,400+ teams shipping daily", body: "From 5-person startups to Fortune 50 platform groups.", icon: Users },
      { size: "md", title: "42 releases / mo", metric: "42", icon: Rocket },
    ],
    kpi: {
      headline: "The platform that makes your product team faster every quarter.",
      big: "3.2×",
      bigLabel: "deploy velocity vs. last year",
      supporting: [
        { value: "98%", label: "Uptime SLO met" },
        { value: "<2m", label: "P95 build time" },
        { value: "42/mo", label: "Releases per team" },
        { value: "−71%", label: "MTTR" },
      ],
    },
  },
  "editorial-light": {
    eyebrow: "Issue 04 · Spring",
    title: "A quieter kind of confidence.",
    subtitle: "Magazine-grade typography meets executive storytelling.",
    imagery: IMAGERY_BY_TEMPLATE["editorial-light"],
    cards: [
      { title: "The Brief", body: "Why this moment matters and what we chose to notice.", icon: Lightbulb },
      { title: "The Field", body: "Voices, places, and patterns from the past quarter.", icon: Compass },
      { title: "The Take", body: "Where we're going — and how to get there with grace.", icon: Megaphone },
    ],
    stat: { value: "12 min", label: "average read time" },
    quote: { text: "Restraint is the loudest design choice.", by: "Editor's Note" },
    agenda: [
      { step: "I", title: "Prologue", body: "The mood of the moment" },
      { step: "II", title: "Dispatches", body: "Voices from the field" },
      { step: "III", title: "Essay", body: "A long view" },
      { step: "IV", title: "Coda", body: "What to take away" },
    ],
    metrics: [
      { value: "12m", label: "Read time", icon: Activity, trend: "Avg" },
      { value: "84%", label: "Finish rate", icon: Award, trend: "+9 pts" },
      { value: "4.8", label: "Reader score", icon: Heart, trend: "/5" },
      { value: "32", label: "Stories", icon: Layers, trend: "This issue" },
    ],
    timeline: [
      { when: "Spring", title: "Slow looking", body: "Reframing the obvious" },
      { when: "Summer", title: "On craft", body: "Hands, tools, time" },
      { when: "Autumn", title: "On scale", body: "When small grows up" },
      { when: "Winter", title: "On rest", body: "The case for pause" },
    ],
    compare: {
      heading: "Noise vs. Signal",
      before: { title: "Noise", points: ["Hot takes", "Vanity metrics", "Borrowed voice", "More, more"] },
      after: { title: "Signal", points: ["Considered views", "Reader outcomes", "Original voice", "Less, better"] },
    },
    chart: {
      title: "Reader engagement (min/issue)",
      series: [
        { label: "01", value: 6.4 },
        { label: "02", value: 8.1 },
        { label: "03", value: 10.2 },
        { label: "04", value: 12.0 },
      ],
      trendline: [6.4, 8.1, 10.2, 12.0],
    },
    team: [
      { name: "Iris Holloway", role: "Editor in Chief", initials: "IH" },
      { name: "Theo Marchetti", role: "Creative Director", initials: "TM" },
      { name: "Noor Saleh", role: "Features Editor", initials: "NS" },
      { name: "Cal Whitford", role: "Photo Editor", initials: "CW" },
    ],
    pricing: [
      { name: "Reader", price: "$8", cadence: "per month", tagline: "Quiet, considered reading", features: ["Quarterly issues", "Web archive", "Newsletter", "Audio essays"] },
      { name: "Member", price: "$18", cadence: "per month", tagline: "The full editorial life", features: ["Everything in Reader", "Print delivery", "Member events", "Limited covers", "Backstage notes"], highlighted: true },
      { name: "Patron", price: "$1,200", cadence: "per year", tagline: "Underwrite the work", features: ["Everything in Member", "Founder credit", "Studio visits", "Annual retreat", "Two gift seats"] },
    ],
    process: [
      { step: "I", title: "Listen", body: "We start with what's quietly true", icon: Compass },
      { step: "II", title: "Look", body: "Field reporting, not screen scrolling", icon: Lightbulb },
      { step: "III", title: "Shape", body: "Edit until it earns the page", icon: Layers },
      { step: "IV", title: "Print", body: "Letterpress when it counts", icon: Award },
      { step: "V", title: "Echo", body: "Conversations long after the issue", icon: Megaphone },
    ],
    bento: [
      { size: "lg", title: "An editorial point of view, not a feed", body: "Long-form reporting, slow looking, and original photography.", imageIndex: 0, icon: Lightbulb },
      { size: "md", title: "12-min average read", metric: "12m", icon: Activity },
      { size: "sm", title: "84% finish rate", metric: "84%", icon: Award },
      { size: "wide", title: "Read in 47 countries · printed in two", body: "A small, devoted readership of executives, founders, and curators.", icon: Globe2 },
      { size: "md", title: "Issue 04 · 32 stories", metric: "32", icon: Layers },
    ],
    kpi: {
      headline: "A magazine for the few who still finish things.",
      big: "84%",
      bigLabel: "issue completion rate",
      supporting: [
        { value: "12 min", label: "Average read" },
        { value: "4.8/5", label: "Reader score" },
        { value: "47", label: "Countries" },
        { value: "+38%", label: "Renewal YoY" },
      ],
    },
  },
  "corporate-navy": {
    eyebrow: "Investor Update · Q3",
    title: "Disciplined growth.",
    subtitle: "An investor-ready narrative built for boardrooms.",
    imagery: IMAGERY_BY_TEMPLATE["corporate-navy"],
    cards: [
      { title: "Revenue", body: "+42% YoY with healthy mix shift toward multi-year deals.", icon: TrendingUp },
      { title: "Margin", body: "Gross margin expanded 380 bps on platform leverage.", icon: PieChart },
      { title: "Cash", body: "$120M cash, 24-month runway with no near-term needs.", icon: Building2 },
    ],
    stat: { value: "$1.2B", label: "ARR exiting Q3" },
    quote: { text: "Compounding execution wins decades.", by: "CEO" },
    agenda: [
      { step: "01", title: "Quarter highlights", body: "Top-line, bottom-line" },
      { step: "02", title: "Operating model", body: "Where leverage compounds" },
      { step: "03", title: "Capital", body: "Allocation framework" },
      { step: "04", title: "Outlook", body: "Guidance & risk" },
    ],
    metrics: [
      { value: "$1.2B", label: "ARR", icon: TrendingUp, trend: "+42% YoY" },
      { value: "78%", label: "Gross margin", icon: PieChart, trend: "+380 bps" },
      { value: "126%", label: "NRR", icon: Activity, trend: "Best-in-class" },
      { value: "$120M", label: "Cash", icon: Shield, trend: "24mo runway" },
    ],
    timeline: [
      { when: "Q1", title: "Re-org", body: "Geo-led GTM" },
      { when: "Q2", title: "Pricing", body: "Value-based tiers" },
      { when: "Q3", title: "Expansion", body: "EMEA scale" },
      { when: "Q4", title: "Platform", body: "Cross-sell flywheel" },
    ],
    compare: {
      heading: "Q3 vs. Plan",
      before: { title: "Plan", points: ["$1.05B ARR", "75% GM", "118% NRR", "$95M cash"] },
      after: { title: "Actual", points: ["$1.20B ARR", "78% GM", "126% NRR", "$120M cash"] },
    },
    chart: {
      title: "ARR ($M) by quarter",
      unit: "M",
      series: [
        { label: "Q3'24", value: 620 },
        { label: "Q4'24", value: 740 },
        { label: "Q1'25", value: 880 },
        { label: "Q2'25", value: 1020 },
        { label: "Q3'25", value: 1200 },
      ],
      trendline: [620, 740, 880, 1020, 1200],
    },
    team: [
      { name: "Margaret Hsu", role: "Chief Executive Officer", initials: "MH" },
      { name: "James Whitford", role: "Chief Financial Officer", initials: "JW" },
      { name: "Priya Bansal", role: "President, Revenue", initials: "PB" },
      { name: "Alex Romano", role: "Chief Technology Officer", initials: "AR" },
    ],
    pricing: [
      { name: "Standard", price: "$24k", cadence: "annual", tagline: "Departmental rollout", features: ["Up to 100 seats", "Standard support", "SOC 2", "API access"] },
      { name: "Business", price: "$96k", cadence: "annual", tagline: "Multi-team operations", features: ["Up to 1,000 seats", "Priority support", "SSO + SCIM", "Audit logs", "Dedicated CSM"], highlighted: true },
      { name: "Enterprise", price: "Custom", cadence: "multi-year", tagline: "Regulated & global", features: ["Unlimited seats", "24/7 SLA", "Private region", "BAA + DPA", "Executive sponsorship"] },
    ],
    process: [
      { step: "01", title: "Diagnose", body: "Joint baseline of revenue model", icon: Compass },
      { step: "02", title: "Design", body: "Operating model & pricing", icon: Layers },
      { step: "03", title: "Deploy", body: "Phased rollout with QBRs", icon: Building2 },
      { step: "04", title: "Defend", body: "Renewal motion + NRR plays", icon: Shield },
      { step: "05", title: "Compound", body: "Cross-sell flywheel", icon: TrendingUp },
    ],
    bento: [
      { size: "lg", title: "$1.2B ARR · 42% YoY", body: "Eight straight quarters of acceleration.", imageIndex: 0, icon: TrendingUp },
      { size: "md", title: "126% NRR", metric: "126%", icon: Activity },
      { size: "sm", title: "78% GM", metric: "78%", icon: PieChart },
      { size: "wide", title: "Now serving 38% of the Fortune 500", body: "Land-and-expand across IT, Finance, and Operations.", icon: Building2 },
      { size: "md", title: "$120M cash", metric: "$120M", icon: Shield },
    ],
    kpi: {
      headline: "Compounding execution. Boring on purpose.",
      big: "$1.20B",
      bigLabel: "ARR · Q3 2025",
      supporting: [
        { value: "+42%", label: "YoY growth" },
        { value: "78%", label: "Gross margin" },
        { value: "126%", label: "Net retention" },
        { value: "Rule of 60", label: "Growth + margin" },
      ],
    },
  },
  "vibrant-startup": {
    eyebrow: "Launch Week",
    title: "Hello, world.",
    subtitle: "A bold opening for products people will actually love.",
    imagery: IMAGERY_BY_TEMPLATE["vibrant-startup"],
    cards: [
      { title: "Free to try", body: "No card needed. Sign in with Google and ship in minutes.", icon: Sparkles },
      { title: "5-min setup", body: "Onboarding is the product. You're live before lunch.", icon: Zap },
      { title: "Loved by 10k+", body: "Indie devs, agencies, and Fortune 500 teams alike.", icon: Heart },
    ],
    stat: { value: "10k", label: "users in week one" },
    quote: { text: "Make it bold or don't ship it.", by: "Founders" },
    agenda: [
      { step: "01", title: "The problem", body: "Why nobody has solved it" },
      { step: "02", title: "Our take", body: "A new kind of tool" },
      { step: "03", title: "Demo", body: "See it in 60 seconds" },
      { step: "04", title: "Get it", body: "Pricing & next steps" },
    ],
    metrics: [
      { value: "10k", label: "Signups wk1", icon: Users, trend: "+312%" },
      { value: "5m", label: "Time to value", icon: Zap, trend: "Median" },
      { value: "4.9", label: "App rating", icon: Heart, trend: "★★★★★" },
      { value: "62", label: "NPS", icon: Award, trend: "World-class" },
    ],
    timeline: [
      { when: "Day 1", title: "Launch", body: "Public beta opens" },
      { when: "Day 7", title: "10k club", body: "First milestone" },
      { when: "Day 30", title: "Pro", body: "Paid tier ships" },
      { when: "Day 90", title: "Teams", body: "Collab & SSO" },
    ],
    compare: {
      heading: "Old way vs. New way",
      before: { title: "Old way", points: ["Hours to set up", "Confusing UI", "Pay to try", "Solo only"] },
      after: { title: "Our way", points: ["5-minute setup", "Delightful UI", "Free forever", "Built for teams"] },
    },
    chart: {
      title: "Daily signups · launch week",
      series: [
        { label: "M", value: 480 },
        { label: "T", value: 920 },
        { label: "W", value: 1450 },
        { label: "T", value: 1890 },
        { label: "F", value: 2310 },
        { label: "S", value: 1650 },
        { label: "S", value: 1300 },
      ],
      trendline: [480, 920, 1450, 1890, 2310, 1650, 1300],
    },
    team: [
      { name: "Jules Park", role: "Co-Founder & CEO", initials: "JP" },
      { name: "Sasha Brooks", role: "Co-Founder & CTO", initials: "SB" },
      { name: "Marco Vega", role: "Head of Design", initials: "MV" },
      { name: "Emi Tanaka", role: "Founding PM", initials: "ET" },
    ],
    pricing: [
      { name: "Free", price: "$0", cadence: "forever", tagline: "Get a feel for it", features: ["3 projects", "Community Discord", "Public sharing", "Mobile + web"] },
      { name: "Pro", price: "$12", cadence: "per mo · billed yearly", tagline: "Indies & power users", features: ["Unlimited projects", "Custom domains", "Priority support", "Versioning"], highlighted: true },
      { name: "Teams", price: "$24", cadence: "per seat / mo", tagline: "Collaborate without chaos", features: ["Shared workspaces", "Roles & permissions", "SSO + audit", "Live cursors", "Admin API"] },
    ],
    process: [
      { step: "01", title: "Sign up", body: "Google, GitHub, or magic link", icon: Sparkles },
      { step: "02", title: "Pick a template", body: "60-second start", icon: Layers },
      { step: "03", title: "Build", body: "Real-time, multiplayer", icon: Rocket },
      { step: "04", title: "Share", body: "Public link · custom domain", icon: Globe2 },
      { step: "05", title: "Grow", body: "Analytics + integrations", icon: TrendingUp },
    ],
    bento: [
      { size: "lg", title: "10k users in week one", body: "The fastest launch in our category — and the friendliest.", imageIndex: 0, icon: Users },
      { size: "md", title: "4.9 ★★★★★", metric: "4.9", icon: Heart },
      { size: "sm", title: "NPS 62", metric: "62", icon: Award },
      { size: "wide", title: "Featured on Product Hunt #1, TechCrunch, and The Verge", body: "Six press hits in launch week.", icon: Megaphone },
      { size: "md", title: "5-min onboarding", metric: "5m", icon: Zap },
    ],
    kpi: {
      headline: "We built the thing we wished existed. Turns out, you did too.",
      big: "10,000",
      bigLabel: "signups in 7 days",
      supporting: [
        { value: "62", label: "NPS" },
        { value: "4.9★", label: "App store rating" },
        { value: "+312%", label: "WoW growth" },
        { value: "$0", label: "Spent on ads" },
      ],
    },
  },
  "warm-terracotta": {
    eyebrow: "Wellness · Brand Story",
    title: "Slow is the new luxury.",
    subtitle: "Lifestyle storytelling rooted in warmth and craft.",
    imagery: IMAGERY_BY_TEMPLATE["warm-terracotta"],
    cards: [
      { title: "Sourced", body: "Small-batch, ethically grown botanicals from named farms.", icon: Leaf },
      { title: "Made", body: "Hand-blended in small studios — never on a production line.", icon: Palette },
      { title: "Loved", body: "Designed to be used daily, kept always, refilled often.", icon: Heart },
    ],
    stat: { value: "100%", label: "natural ingredients" },
    quote: { text: "Care is the original technology.", by: "Founder" },
    agenda: [
      { step: "01", title: "Origin", body: "How it started" },
      { step: "02", title: "Ritual", body: "How it's used" },
      { step: "03", title: "Impact", body: "Who it helps" },
      { step: "04", title: "Future", body: "Where we're going" },
    ],
    metrics: [
      { value: "100%", label: "Natural", icon: Leaf, trend: "Always" },
      { value: "12", label: "Artisans", icon: Users, trend: "Local" },
      { value: "0", label: "Plastic", icon: Shield, trend: "Zero waste" },
      { value: "4.9", label: "Reviews", icon: Heart, trend: "★★★★★" },
    ],
    timeline: [
      { when: "Spring", title: "Harvest", body: "Hand-gathered botanicals" },
      { when: "Summer", title: "Blend", body: "Slow-infused in small batches" },
      { when: "Autumn", title: "Bottle", body: "Refillable amber glass" },
      { when: "Winter", title: "Ritual", body: "Delivered to your door" },
    ],
    compare: {
      heading: "Mass vs. Made-by-hand",
      before: { title: "Mass", points: ["Synthetic blends", "Anonymous supply", "Single-use plastic", "Discount cycles"] },
      after: { title: "Ours", points: ["100% botanical", "Named growers", "Refillable glass", "Honest pricing"] },
    },
    chart: {
      title: "Members reordering (%)",
      series: [
        { label: "'22", value: 41 },
        { label: "'23", value: 54 },
        { label: "'24", value: 67 },
        { label: "'25", value: 78 },
      ],
      trendline: [41, 54, 67, 78],
    },
    team: [
      { name: "Aisha Romero", role: "Founder & Maker", initials: "AR" },
      { name: "Henrik Voss", role: "Master Blender", initials: "HV" },
      { name: "Lila Okonkwo", role: "Sourcing Lead", initials: "LO" },
      { name: "Marco Bianchi", role: "Studio Director", initials: "MB" },
    ],
    pricing: [
      { name: "Discover", price: "$48", cadence: "one time", tagline: "A first ritual", features: ["1 signature blend", "Refill subscription", "Hand-written card", "Free returns"] },
      { name: "Ritual", price: "$32", cadence: "per month", tagline: "The daily practice", features: ["Monthly refill", "Seasonal extras", "Member-only blends", "Studio invitations"], highlighted: true },
      { name: "Atelier", price: "$840", cadence: "annual", tagline: "Bespoke & shared", features: ["Custom blend", "4 deluxe gifts", "Founder visit", "Two-seat membership", "Workshop access"] },
    ],
    process: [
      { step: "01", title: "Gather", body: "Hand-harvest botanicals at peak", icon: Leaf },
      { step: "02", title: "Infuse", body: "Cold-press over six slow weeks", icon: Heart },
      { step: "03", title: "Blend", body: "Master-blender's signature ratio", icon: Palette },
      { step: "04", title: "Bottle", body: "Refillable amber glass", icon: Shield },
      { step: "05", title: "Deliver", body: "Hand-tied, hand-delivered", icon: Award },
    ],
    bento: [
      { size: "lg", title: "Hand-blended in a 12-person studio", body: "Care is the original technology — and the only one we trust.", imageIndex: 0, icon: Heart },
      { size: "md", title: "100% botanical", metric: "100%", icon: Leaf },
      { size: "sm", title: "Zero plastic", metric: "0", icon: Shield },
      { size: "wide", title: "78% of members reorder within 30 days", body: "A small, loyal community built around ritual, not discount.", icon: Users },
      { size: "md", title: "★★★★★ 4.9", metric: "4.9", icon: Heart },
    ],
    kpi: {
      headline: "A house of small things, made slowly, kept always.",
      big: "78%",
      bigLabel: "of members reorder · 2025",
      supporting: [
        { value: "12", label: "Artisan makers" },
        { value: "100%", label: "Botanical" },
        { value: "0", label: "Plastic waste" },
        { value: "47", label: "Named growers" },
      ],
    },
  },
  "mono-brutalist": {
    eyebrow: "MANIFESTO / 01",
    title: "TYPE. SPACE. NOISE.",
    subtitle: "An unapologetic deck for unapologetic ideas.",
    imagery: IMAGERY_BY_TEMPLATE["mono-brutalist"],
    cards: [
      { title: "RAW", body: "No gradients. No drop shadows. Black ink on honest paper.", icon: Layers },
      { title: "LOUD", body: "Oversized type that announces itself across the room.", icon: Megaphone },
      { title: "CLEAR", body: "One idea per slide. The room can carry the rest.", icon: Target },
    ],
    stat: { value: "1", label: "idea per slide" },
    quote: { text: "Less but louder.", by: "Studio" },
    agenda: [
      { step: "01", title: "RULES", body: "Type. Space. Noise." },
      { step: "02", title: "WORK", body: "Case studies" },
      { step: "03", title: "WHY", body: "Our beliefs" },
      { step: "04", title: "HIRE", body: "Work with us" },
    ],
    metrics: [
      { value: "1", label: "Idea / slide", icon: Target, trend: "Always" },
      { value: "0", label: "Gradients", icon: Layers, trend: "Forever" },
      { value: "100%", label: "Black ink", icon: Award, trend: "Press-grade" },
      { value: "∞", label: "Opinions", icon: Megaphone, trend: "Strong" },
    ],
    timeline: [
      { when: "01", title: "BRIEF", body: "One sentence, one north star" },
      { when: "02", title: "DRAFT", body: "Make it ugly. Then loud." },
      { when: "03", title: "EDIT", body: "Cut half. Then half again." },
      { when: "04", title: "SHIP", body: "Sign it. Print it. Mean it." },
    ],
    compare: {
      heading: "DECORATED vs. DECISIVE",
      before: { title: "DECORATED", points: ["Gradients", "Stock icons", "Soft edges", "Safe words"] },
      after: { title: "DECISIVE", points: ["Black ink", "Custom marks", "Hard edges", "Strong claims"] },
    },
    chart: {
      title: "WORDS PER SLIDE",
      series: [
        { label: "01", value: 8 },
        { label: "02", value: 6 },
        { label: "03", value: 4 },
        { label: "04", value: 3 },
        { label: "05", value: 1 },
      ],
      trendline: [8, 6, 4, 3, 1],
    },
    team: [
      { name: "VOX KESTREL", role: "FOUNDER", initials: "VK" },
      { name: "ASA HUNT", role: "DESIGN DIRECTOR", initials: "AH" },
      { name: "RIO STARK", role: "TYPE DESIGNER", initials: "RS" },
      { name: "MAE COLE", role: "STUDIO MANAGER", initials: "MC" },
    ],
    pricing: [
      { name: "BRIEF", price: "$12K", cadence: "FLAT", tagline: "ONE PROJECT. ONE PRICE.", features: ["1 deliverable", "2 rounds", "Press-ready files", "10-day turn"] },
      { name: "BUILD", price: "$48K", cadence: "QUARTER", tagline: "RETAINED CRAFT.", features: ["Up to 6 projects", "Unlimited rounds", "Studio access", "Quarterly review"], highlighted: true },
      { name: "BRAND", price: "BY APPLICATION", cadence: "ANNUAL", tagline: "WE WORK WITH FEW.", features: ["Identity system", "Type system", "Editorial system", "On-site days", "Founder direct line"] },
    ],
    process: [
      { step: "01", title: "BRIEF", body: "ONE PAGE. ONE SENTENCE.", icon: Target },
      { step: "02", title: "DRAFT", body: "MAKE IT UGLY FAST.", icon: Layers },
      { step: "03", title: "EDIT", body: "CUT. CUT. CUT.", icon: Megaphone },
      { step: "04", title: "PROOF", body: "PRESS-CHECK ON PAPER.", icon: Shield },
      { step: "05", title: "SHIP", body: "SIGN IT. MEAN IT.", icon: Award },
    ],
    bento: [
      { size: "lg", title: "ONE IDEA. ONE SLIDE.", body: "WE DESIGN LIKE THE ROOM IS LISTENING.", imageIndex: 0, icon: Target },
      { size: "md", title: "0 GRADIENTS", metric: "0", icon: Layers },
      { size: "sm", title: "100% INK", metric: "100%", icon: Award },
      { size: "wide", title: "WORK FOR: NIKE · A24 · MoMA · DOMINO · MIT", body: "TWENTY-TWO YEARS. NO DECK SOFTWARE.", icon: Star },
      { size: "md", title: "1 IDEA / SLIDE", metric: "1", icon: Target },
    ],
    kpi: {
      headline: "WE SAY LESS. WE MEAN MORE.",
      big: "1",
      bigLabel: "IDEA PER SLIDE · ALWAYS",
      supporting: [
        { value: "22 YRS", label: "STUDIO" },
        { value: "0", label: "STOCK ASSETS" },
        { value: "100%", label: "BESPOKE" },
        { value: "∞", label: "OPINIONS" },
      ],
    },
  },
};

export const FALLBACK_DEMO: DemoContent = {
  eyebrow: "Sample Deck",
  title: "Tell your story.",
  subtitle: "A flexible template for any narrative.",
  imagery: [IMG.workspace, IMG.meeting, IMG.team, IMG.charts],
  cards: [
    { title: "Context", body: "Set the scene with a single, clear thesis.", icon: Compass },
    { title: "Insight", body: "Reveal the why with evidence and a point of view.", icon: Lightbulb },
    { title: "Action", body: "Drive the next step with a specific, owned ask.", icon: Rocket },
  ],
  stat: { value: "3x", label: "more memorable" },
  quote: { text: "Great decks earn the next meeting.", by: "Lovable" },
  agenda: [
    { step: "01", title: "Context", body: "Where we are" },
    { step: "02", title: "Insight", body: "What we learned" },
    { step: "03", title: "Action", body: "What we'll do" },
    { step: "04", title: "Next", body: "Decisions needed" },
  ],
  metrics: [
    { value: "3x", label: "Recall", icon: Sparkles, trend: "vs avg" },
    { value: "92%", label: "Approval", icon: Award, trend: "+18 pts" },
    { value: "12", label: "Slides", icon: Layers, trend: "Tight" },
    { value: "1", label: "Big idea", icon: Target, trend: "Always" },
  ],
  timeline: [
    { when: "Now", title: "Today", body: "Where we are" },
    { when: "+30d", title: "Next", body: "Quick wins" },
    { when: "+90d", title: "Soon", body: "Compounding gains" },
    { when: "+1y", title: "Vision", body: "The bigger picture" },
  ],
  compare: {
    heading: "Before vs. After",
    before: { title: "Before", points: ["Slow", "Unclear", "Generic", "Forgettable"] },
    after: { title: "After", points: ["Fast", "Focused", "Specific", "Memorable"] },
  },
  chart: {
    title: "Engagement",
    series: [
      { label: "A", value: 20 },
      { label: "B", value: 35 },
      { label: "C", value: 48 },
      { label: "D", value: 62 },
      { label: "E", value: 80 },
    ],
    trendline: [20, 35, 48, 62, 80],
  },
  team: [
    { name: "Avery Chen", role: "Lead", initials: "AC" },
    { name: "Rohan Patel", role: "Strategist", initials: "RP" },
    { name: "Sloane Kim", role: "Designer", initials: "SK" },
    { name: "Jordan Reyes", role: "Producer", initials: "JR" },
  ],
  pricing: [
    { name: "Starter", price: "$0", cadence: "free", tagline: "Try it now", features: ["1 deck", "Basic export", "Community support"] },
    { name: "Pro", price: "$19", cadence: "per mo", tagline: "Most popular", features: ["Unlimited decks", "Brand kit", "Priority export", "Analytics"], highlighted: true },
    { name: "Team", price: "$49", cadence: "per seat / mo", tagline: "For organizations", features: ["Shared brand", "SSO", "Audit log", "Dedicated CSM"] },
  ],
  process: [
    { step: "01", title: "Define", body: "What's the one thing?", icon: Target },
    { step: "02", title: "Draft", body: "Outline the arc", icon: Layers },
    { step: "03", title: "Design", body: "Apply the system", icon: Palette },
    { step: "04", title: "Deliver", body: "Present with confidence", icon: Rocket },
    { step: "05", title: "Iterate", body: "Refine on feedback", icon: Activity },
  ],
  bento: [
    { size: "lg", title: "Built for the next meeting", body: "Make decks people remember.", imageIndex: 0, icon: Sparkles },
    { size: "md", title: "3× recall", metric: "3×", icon: Sparkles },
    { size: "sm", title: "92% approval", metric: "92%", icon: Award },
    { size: "wide", title: "From outline to boardroom in under an hour", icon: Rocket },
    { size: "md", title: "1 big idea", metric: "1", icon: Target },
  ],
  kpi: {
    headline: "Tell better stories. Win better rooms.",
    big: "3×",
    bigLabel: "more memorable than the average deck",
    supporting: [
      { value: "92%", label: "Approval rate" },
      { value: "12 min", label: "To outline" },
      { value: "+38%", label: "Conversion" },
      { value: "1", label: "Big idea" },
    ],
  },
};

interface Props {
  template: DeckTemplate;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/** Lightweight inline bar+line micro-chart used in the gallery card. */
const MicroChart: React.FC<{
  values: number[];
  accent: string;
  secondary: string;
  muted: string;
}> = ({ values, accent, secondary, muted }) => {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const w = 100;
  const h = 28;
  const stepX = w / Math.max(values.length - 1, 1);
  const points = values
    .map((v, i) => `${(i * stepX).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-7 w-full" aria-hidden>
      {values.map((v, i) => {
        const bw = (w / values.length) * 0.55;
        const bx = i * (w / values.length) + (w / values.length - bw) / 2;
        const bh = (v / max) * h * 0.85;
        return (
          <rect
            key={i}
            x={bx}
            y={h - bh}
            width={bw}
            height={bh}
            fill={secondary}
            opacity={0.45}
            rx={0.6}
          />
        );
      })}
      <polyline points={points} fill="none" stroke={accent} strokeWidth={1.2} />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={(i * stepX).toFixed(1)}
          cy={(h - (v / max) * h).toFixed(1)}
          r={0.9}
          fill={accent}
        />
      ))}
    </svg>
  );
};

export const TemplateDemoCard: React.FC<Props> = ({ template: t, selected, disabled, onClick }) => {
  const demo = DEMO_BY_TEMPLATE[t.id] || FALLBACK_DEMO;
  const isLight = isLightColor(t.palette.bg);
  const muted = isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.65)";
  const subtleBorder = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.12)";
  const cardBg = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)";
  const thumb = TEMPLATE_THUMBNAILS[t.id];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group relative rounded-2xl border overflow-hidden text-left transition-all bg-card ${
        selected
          ? "border-primary ring-2 ring-primary/40 shadow-lg"
          : "border-border hover:border-primary/50 hover:shadow-md"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {/* HERO TITLE SLIDE */}
      <div
        className="aspect-[16/9] p-5 flex flex-col justify-between relative overflow-hidden"
        style={{ background: t.palette.bg, color: t.palette.text }}
      >
        {thumb && (
          <>
            <img
              src={thumb}
              alt={`${t.name} cover`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${t.palette.bg}F2 0%, ${t.palette.bg}B8 45%, ${t.palette.bg}55 100%)`,
              }}
            />
          </>
        )}
        <div
          className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
          style={{ background: t.palette.accent }}
        />
        <div
          className="absolute -bottom-12 -left-10 h-32 w-32 rounded-full opacity-20 blur-2xl"
          style={{ background: t.palette.secondary }}
        />

        <div className="relative">
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: t.palette.accent }}
          >
            {demo.eyebrow}
          </div>
          <div
            className="mt-2 text-base sm:text-lg font-bold leading-tight tracking-tight"
            style={{ color: t.palette.text }}
          >
            {demo.title}
          </div>
          <div className="mt-1 text-[10px] leading-snug line-clamp-2" style={{ color: muted }}>
            {demo.subtitle}
          </div>
        </div>

        <div className="relative flex items-center gap-1.5">
          <div className="h-1 w-8 rounded-full" style={{ background: t.palette.accent }} />
          <div className="h-1 w-4 rounded-full opacity-60" style={{ background: t.palette.secondary }} />
          <div className="h-1 w-2 rounded-full opacity-30" style={{ background: t.palette.text }} />
        </div>
      </div>

      {/* CONTENT CARDS PREVIEW */}
      <div
        className="px-3 pt-3 pb-2 border-t"
        style={{ borderColor: subtleBorder, background: t.palette.bg, color: t.palette.text }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Layers className="h-3 w-3" style={{ color: t.palette.accent }} />
          <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
            Card layout
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {demo.cards.map((c, i) => {
            const Ic = c.icon;
            return (
              <div
                key={i}
                className="rounded-md p-1.5"
                style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}
              >
                <div className="flex items-center gap-1 mb-1">
                  {Ic ? (
                    <Ic className="h-2.5 w-2.5" style={{ color: t.palette.accent }} />
                  ) : (
                    <div
                      className="h-0.5 w-3 rounded-full"
                      style={{ background: i === 0 ? t.palette.accent : t.palette.secondary }}
                    />
                  )}
                </div>
                <div className="text-[8px] font-bold leading-tight truncate" style={{ color: t.palette.text }}>
                  {c.title}
                </div>
                <div className="text-[7px] leading-tight truncate" style={{ color: muted }}>
                  {c.body}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MINI METRICS + CHART STRIP */}
      <div
        className="grid grid-cols-5 gap-px"
        style={{ background: subtleBorder }}
      >
        {demo.metrics.slice(0, 4).map((m, i) => {
          const Ic = m.icon;
          return (
            <div
              key={i}
              className="px-2 py-2 flex flex-col"
              style={{ background: t.palette.bg, color: t.palette.text }}
            >
              <div className="flex items-center gap-1">
                {Ic && <Ic className="h-2.5 w-2.5" style={{ color: t.palette.accent }} />}
                <div
                  className="text-[10px] font-extrabold leading-none tracking-tight"
                  style={{ color: t.palette.accent }}
                >
                  {m.value}
                </div>
              </div>
              <div className="text-[7px] truncate leading-tight mt-0.5" style={{ color: muted }}>
                {m.label}
              </div>
            </div>
          );
        })}
        <div
          className="px-2 py-1.5 flex flex-col justify-center"
          style={{ background: t.palette.bg }}
        >
          <MicroChart
            values={demo.chart.trendline || demo.chart.series.map((s) => s.value)}
            accent={t.palette.accent}
            secondary={t.palette.secondary}
            muted={muted}
          />
        </div>
      </div>

      {/* QUOTE STRIP */}
      <div
        className="px-3 py-2 flex items-start gap-1.5 border-t"
        style={{ background: t.palette.bg, color: t.palette.text, borderColor: subtleBorder }}
      >
        <Quote className="h-3 w-3 shrink-0 mt-0.5" style={{ color: t.palette.secondary }} />
        <div className="min-w-0">
          <div className="text-[9px] italic leading-snug line-clamp-2" style={{ color: t.palette.text }}>
            "{demo.quote.text}"
          </div>
          <div className="text-[8px] mt-0.5 truncate" style={{ color: muted }}>
            — {demo.quote.by}
          </div>
        </div>
      </div>

      {/* META FOOTER */}
      <div className="px-3 py-2 bg-card border-t flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate">{t.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{t.description || "Template"}</p>
        </div>
        <div className="flex gap-0.5 shrink-0">
          <span
            className="h-3 w-3 rounded-full border border-border"
            style={{ background: t.palette.accent }}
            title="Accent"
          />
          <span
            className="h-3 w-3 rounded-full border border-border"
            style={{ background: t.palette.secondary }}
            title="Secondary"
          />
          <span
            className="h-3 w-3 rounded-full border border-border"
            style={{ background: t.palette.bg }}
            title="Background"
          />
        </div>
      </div>

      {selected && (
        <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
          <Check className="h-3.5 w-3.5" />
        </div>
      )}
    </button>
  );
};

export function isLightColor(input: string): boolean {
  if (!input || !input.startsWith("#")) return false;
  const hex = input.replace("#", "");
  if (hex.length !== 6 && hex.length !== 3) return false;
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
