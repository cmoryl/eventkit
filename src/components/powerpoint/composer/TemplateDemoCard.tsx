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
  type LucideIcon,
} from "lucide-react";
import type { DeckTemplate } from "./TemplateGallery";
import { TEMPLATE_THUMBNAILS } from "./templateThumbnails";

/**
 * Per-template demo content. Keeps cards visually distinct & relevant —
 * each preview reads like a real, fully-built mini deck.
 */
export interface DemoCard {
  title: string;
  body: string;
  icon?: LucideIcon;
}

export interface DemoMetric {
  value: string;
  label: string;
  trend?: string; // e.g. "+12%"
  icon?: LucideIcon;
}

export interface DemoAgendaItem {
  step: string; // "01"
  title: string;
  body: string;
}

export interface DemoTimelineItem {
  when: string; // "Q1"
  title: string;
  body: string;
}

export interface DemoCompare {
  heading: string;
  before: { title: string; points: string[] };
  after: { title: string; points: string[] };
}

export interface DemoChart {
  title: string;
  unit?: string;
  series: { label: string; value: number }[]; // bar chart values
  trendline?: number[]; // for sparkline / line chart
}

export interface DemoContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: DemoCard[];
  stat: { value: string; label: string };
  quote: { text: string; by: string };
  // New richer data
  agenda: DemoAgendaItem[];
  metrics: DemoMetric[];
  timeline: DemoTimelineItem[];
  compare: DemoCompare;
  chart: DemoChart;
}

export const DEMO_BY_TEMPLATE: Record<string, DemoContent> = {
  "transperfect-2026": {
    eyebrow: "Global Solutions · 2026",
    title: "Speak every market.",
    subtitle: "Language & AI for the world's biggest brands.",
    cards: [
      { title: "GlobalLink NEXT", body: "AI translation platform", icon: Cpu },
      { title: "200+ languages", body: "Native expert network", icon: Globe2 },
      { title: "24/7 delivery", body: "Always-on localization", icon: Zap },
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
      before: {
        title: "Traditional",
        points: ["6–8 wk turnaround", "Inconsistent voice", "Per-word billing", "Manual QA"],
      },
      after: {
        title: "TransPerfect",
        points: ["48hr turnaround", "Brand-trained AI", "Outcome pricing", "Automated QA"],
      },
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
  },
  "modern-dark": {
    eyebrow: "Product · 2026 Roadmap",
    title: "Build what's next.",
    subtitle: "A high-contrast tech narrative for product teams.",
    cards: [
      { title: "Ship faster", body: "Velocity up 3x", icon: Rocket },
      { title: "Stay aligned", body: "Single source of truth", icon: Target },
      { title: "Scale safely", body: "Enterprise-grade", icon: Shield },
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
      before: {
        title: "Legacy",
        points: ["Weekly deploys", "Tribal knowledge", "Manual QA", "Single region"],
      },
      after: {
        title: "Platform v2",
        points: ["Continuous deploy", "Living docs", "Test automation", "Multi-region"],
      },
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
  },
  "editorial-light": {
    eyebrow: "Issue 04 · Spring",
    title: "A quieter kind of confidence.",
    subtitle: "Magazine-grade typography meets executive storytelling.",
    cards: [
      { title: "The Brief", body: "Why now matters", icon: Lightbulb },
      { title: "The Field", body: "What we observed", icon: Compass },
      { title: "The Take", body: "Where we're going", icon: Megaphone },
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
      before: {
        title: "Noise",
        points: ["Hot takes", "Vanity metrics", "Borrowed voice", "More, more"],
      },
      after: {
        title: "Signal",
        points: ["Considered views", "Reader outcomes", "Original voice", "Less, better"],
      },
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
  },
  "corporate-navy": {
    eyebrow: "Investor Update · Q3",
    title: "Disciplined growth.",
    subtitle: "An investor-ready narrative built for boardrooms.",
    cards: [
      { title: "Revenue", body: "+42% YoY", icon: TrendingUp },
      { title: "Margin", body: "Expanded 380 bps", icon: PieChart },
      { title: "Cash", body: "$120M runway", icon: Building2 },
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
      before: {
        title: "Plan",
        points: ["$1.05B ARR", "75% GM", "118% NRR", "$95M cash"],
      },
      after: {
        title: "Actual",
        points: ["$1.20B ARR", "78% GM", "126% NRR", "$120M cash"],
      },
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
  },
  "vibrant-startup": {
    eyebrow: "Launch Week",
    title: "Hello, world.",
    subtitle: "A bold opening for products people will actually love.",
    cards: [
      { title: "Free to try", body: "No card needed", icon: Sparkles },
      { title: "5-min setup", body: "Onboarding done", icon: Zap },
      { title: "Loved by 10k+", body: "Early customers", icon: Heart },
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
      before: {
        title: "Old way",
        points: ["Hours to set up", "Confusing UI", "Pay to try", "Solo only"],
      },
      after: {
        title: "Our way",
        points: ["5-minute setup", "Delightful UI", "Free forever", "Built for teams"],
      },
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
  },
  "warm-terracotta": {
    eyebrow: "Wellness · Brand Story",
    title: "Slow is the new luxury.",
    subtitle: "Lifestyle storytelling rooted in warmth and craft.",
    cards: [
      { title: "Sourced", body: "Small batch, ethical", icon: Leaf },
      { title: "Made", body: "By hand, locally", icon: Palette },
      { title: "Loved", body: "For generations", icon: Heart },
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
      before: {
        title: "Mass",
        points: ["Synthetic blends", "Anonymous supply", "Single-use plastic", "Discount cycles"],
      },
      after: {
        title: "Ours",
        points: ["100% botanical", "Named growers", "Refillable glass", "Honest pricing"],
      },
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
  },
  "mono-brutalist": {
    eyebrow: "MANIFESTO / 01",
    title: "TYPE. SPACE. NOISE.",
    subtitle: "An unapologetic deck for unapologetic ideas.",
    cards: [
      { title: "RAW", body: "No gradients", icon: Layers },
      { title: "LOUD", body: "Oversized type", icon: Megaphone },
      { title: "CLEAR", body: "One idea per slide", icon: Target },
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
      before: {
        title: "DECORATED",
        points: ["Gradients", "Stock icons", "Soft edges", "Safe words"],
      },
      after: {
        title: "DECISIVE",
        points: ["Black ink", "Custom marks", "Hard edges", "Strong claims"],
      },
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
  },
};

export const FALLBACK_DEMO: DemoContent = {
  eyebrow: "Sample Deck",
  title: "Tell your story.",
  subtitle: "A flexible template for any narrative.",
  cards: [
    { title: "Context", body: "Set the scene", icon: Compass },
    { title: "Insight", body: "Reveal the why", icon: Lightbulb },
    { title: "Action", body: "Drive the next step", icon: Rocket },
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
    before: {
      title: "Before",
      points: ["Slow", "Unclear", "Generic", "Forgettable"],
    },
    after: {
      title: "After",
      points: ["Fast", "Focused", "Specific", "Memorable"],
    },
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

      {/* CONTENT CARDS PREVIEW (mini "card-grid" slide) */}
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
