import React from "react";
import { Sparkles, FileText, LayoutTemplate } from "lucide-react";

type Mode = "prompt" | "paste" | "blank";

interface Props {
  active: Mode;
  onChange: (m: Mode) => void;
  disabled?: boolean;
}

const MODES: { id: Mode; icon: React.ElementType; title: string; subtitle: string }[] = [
  { id: "prompt", icon: Sparkles, title: "Generate", subtitle: "Describe a topic — AI drafts the outline" },
  { id: "paste", icon: FileText, title: "Paste / Upload", subtitle: "Use a doc, PDF or notes as source" },
  { id: "blank", icon: LayoutTemplate, title: "Start from template", subtitle: "Pick a look & build manually" },
];

export const ModeCards: React.FC<Props> = ({ active, onChange, disabled }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
    {MODES.map((m) => {
      const Icon = m.icon;
      const isActive = active === m.id;
      return (
        <button
          key={m.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(m.id)}
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
          <div className="font-semibold text-sm">{m.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{m.subtitle}</div>
        </button>
      );
    })}
  </div>
);

export type { Mode };
