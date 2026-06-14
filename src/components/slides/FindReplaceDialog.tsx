// FindReplaceDialog — deck-wide search & replace surface.
// Opens via ⌘F. Lists all matching slides, lets the user jump to one,
// and supports Replace All across every text field on every slide.

import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, ArrowRight } from 'lucide-react';
import { findInDeck, replaceInDeck, type FindMatch } from './findReplace';
import type { SlideData } from './slideTypes';

interface Props {
  open: boolean;
  onClose: () => void;
  slides: SlideData[];
  onJumpTo: (slideIndex: number) => void;
  onReplaceAll: (next: SlideData[], replacedCount: number, affectedSlides: number) => void;
}

export const FindReplaceDialog: React.FC<Props> = ({
  open,
  onClose,
  slides,
  onJumpTo,
  onReplaceAll,
}) => {
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);

  // Reset transient input when dialog reopens.
  useEffect(() => {
    if (!open) return;
    // Keep query so reopening continues a previous search.
  }, [open]);

  const matches: FindMatch[] = useMemo(() => {
    if (!query) return [];
    return findInDeck(slides, query, { caseSensitive, wholeWord });
  }, [slides, query, caseSensitive, wholeWord]);

  const totalOccurrences = matches.reduce((acc, m) => acc + m.count, 0);

  const handleReplaceAll = () => {
    if (!query) return;
    const result = replaceInDeck(slides, query, replacement, { caseSensitive, wholeWord });
    onReplaceAll(result.slides, result.replacedCount, result.affectedSlides);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Search className="h-4 w-4" /> Find & Replace
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Find</label>
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all slides…"
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Replace with</label>
            <Input
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder="Replacement text"
              className="h-9"
            />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={caseSensitive}
                onCheckedChange={(v) => setCaseSensitive(!!v)}
              />
              Match case
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={wholeWord}
                onCheckedChange={(v) => setWholeWord(!!v)}
              />
              Whole word
            </label>
            <span className="ml-auto text-[11px] text-muted-foreground">
              {query
                ? `${totalOccurrences} match${totalOccurrences === 1 ? '' : 'es'} in ${matches.length} field${matches.length === 1 ? '' : 's'}`
                : 'Type to search'}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto rounded border border-border bg-muted/30">
            {matches.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                {query ? 'No matches' : 'Results will appear here'}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {matches.map((m, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => {
                        onJumpTo(m.slideIndex);
                        onClose();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-muted/60 flex items-center gap-2"
                    >
                      <span className="text-[10px] font-mono font-semibold text-primary shrink-0">
                        S{m.slideIndex + 1}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
                        {m.field}
                      </span>
                      <span className="text-xs text-foreground truncate flex-1">{m.snippet}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">×{m.count}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={handleReplaceAll}
              disabled={!query || totalOccurrences === 0}
            >
              Replace all
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
