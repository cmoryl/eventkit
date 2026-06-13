import React, { useMemo, useState } from 'react';
import { Command, Search, Zap } from 'lucide-react';
import { routePresentationCommand } from '@/services/presentationCommandRouterService';
import { cn } from '@/lib/utils';

export interface EditorCommandPaletteProps {
  open?: boolean;
  onCommand?: (command: string) => void;
  className?: string;
}

const commandExamples = [
  'Replace the image on this slide',
  'Make this slide more executive',
  'Run brand repair on this deck',
  'Convert this into a timeline',
  'Check export readiness',
  'Duplicate this slide and make it darker',
];

export const EditorCommandPalette: React.FC<EditorCommandPaletteProps> = ({ open = true, onCommand, className }) => {
  const [command, setCommand] = useState('Make this slide more executive');
  const route = useMemo(() => routePresentationCommand(command), [command]);

  if (!open) return null;

  return (
    <div className={cn('rounded-2xl border border-border bg-card p-3 text-xs shadow-xl', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-black text-primary"><Command className="h-4 w-4" /> Editor Command</div>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{Math.round(route.confidence * 100)}%</span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onCommand?.(command);
          }}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          placeholder="Tell the editor what to do..."
        />
      </div>
      <div className="mt-3 rounded-xl bg-muted p-3">
        <div className="font-black">{route.recommendedAction}</div>
        <p className="mt-1 text-muted-foreground">{route.assistantInstruction}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {commandExamples.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCommand(item)}
            className="rounded-full border border-border bg-background px-2 py-1 text-[10px] font-bold text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Zap className="mr-1 inline h-3 w-3" /> {item}
          </button>
        ))}
      </div>
    </div>
  );
};
