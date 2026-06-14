// DeckBulkActionsMenu — toolbar dropdown surfacing the deck-level bulk
// transforms (reverse, clear images, sync background, etc.). Lives next to the
// Brand Lock controls in SlideEditor.

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wand2 } from 'lucide-react';
import { DECK_BULK_ACTIONS, type DeckBulkActionId } from './deckBulkActions';

interface Props {
  onRun: (id: DeckBulkActionId) => void;
}

export const DeckBulkActionsMenu: React.FC<Props> = ({ onRun }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 px-2 text-xs"
          title="Deck-wide bulk actions"
        >
          <Wand2 className="h-3.5 w-3.5" />
          Bulk
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Apply across every slide
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DECK_BULK_ACTIONS.map((a) => (
          <DropdownMenuItem
            key={a.id}
            onClick={() => onRun(a.id)}
            className="flex flex-col items-start gap-0.5 py-2"
          >
            <span className="text-xs font-medium">{a.label}</span>
            <span className="text-[10px] text-muted-foreground">{a.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
