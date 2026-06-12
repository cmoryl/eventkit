import React from "react";
import { Bot, FileText, Globe2, LayoutTemplate, Sparkles } from "lucide-react";
import { gammaCreationPresets } from "@/services/gammaPresentationResearchService";

type Mode = "prompt" | "paste" | "import" | "blank" | "agent";

interface Props {
  active: Mode;
  onChange: (m: Mode) => void;
  disabled?: boolean;
}

const modeMeta: Record<Mode, { gammaMode: string; icon: React.ElementType; title: string; subtitle: string }> = {
  prompt: {
    gammaMode: "generate",
    icon: Sparkles,
    title: "Generate",
    subtitle: "Describe a topic — AI drafts the outline",
  },
  paste: {
    gammaMode: "paste",
    icon: FileText,
    title: "Paste",
    subtitle: "Turn notes, docs, or raw copy into cards",
  },
  import: {
    gammaMode: "import",
    icon: Globe2,
    title: "Import",
    subtitle: "Use PDF, PPTX, URL, or BrandHub source material",
  },
  blank: {
    gammaMode: "template",
    icon: LayoutTemplate,
    title: "Template",
    subtitle: "Start from a look, structure, or saved deck system",
  },
  agent: {
    gammaMode: "agent",
    icon: Bot,
    title: "Agent",
    subtitle: "Multi-source guided outline, style, and QA flow",
  },
};

const MODES: Mode[] = ["prompt", "paste", "import", "blank", "agent"];

const gammaDescription = (gammaMode: string) => gammaCreationPresets.find((preset) => preset.mode === gammaMode)?.description;

export const ModeCards: React.FC<Props> = ({ active, onChange, disabled }) => (
  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 max-w-5xl mx-auto">
    {MODES.map((id) => {
      const meta = modeMeta[id];
      const Icon = meta.icon;
      const isActive = active === id;
      return (
        <button
          key={id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(id)}
          title={gammaDescription(meta.gammaMode)}
          className={`group text-left rounded-2xl border p-4 transition-all ${
            isActive
              ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
              : "border-border bg-card/60 hover:border-primary/50 hover:bg-accent/20"
          }`}
        >
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-2 ${
            isActive ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70 group-hover:bg-primary/10 group-hover:text-primary"
          }`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-wide text-primary/80 mb-1">{meta.gammaMode}</div>
          <div className="font-semibold text-sm">{meta.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{meta.subtitle}</div>
        </button>
      );
    })}
  </div>
);

export type { Mode };
