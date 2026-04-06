import React, { useEffect } from 'react';
import { Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import type { GoogleFontSelection } from './AssetBriefModal';

interface FontPreviewPanelProps {
  selectedFonts: GoogleFontSelection | null;
  eventName: string;
  eventDate?: string;
  className?: string;
}

export const FontPreviewPanel: React.FC<FontPreviewPanelProps> = ({
  selectedFonts,
  eventName,
  eventDate,
  className,
}) => {
  const { loadFont, isFontLoaded } = useGoogleFonts();

  useEffect(() => {
    if (selectedFonts) {
      loadFont(selectedFonts.heading).catch(() => {});
      loadFont(selectedFonts.body).catch(() => {});
    }
  }, [selectedFonts, loadFont]);

  if (!selectedFonts) return null;

  const headingFamily = `'${selectedFonts.heading}', sans-serif`;
  const bodyFamily = `'${selectedFonts.body}', sans-serif`;

  return (
    <div className={cn(
      "flex items-center gap-4 px-4 py-2.5 bg-muted/40 border-b border-border",
      className
    )}>
      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
        <Type className="h-3.5 w-3.5" />
        <span className="text-[10px] font-medium uppercase tracking-wider">Font Preview</span>
      </div>

      <div className="flex items-center gap-6 overflow-hidden min-w-0">
        {/* Heading preview */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Heading</span>
          <span
            className="text-lg font-bold truncate text-foreground leading-tight"
            style={{ fontFamily: headingFamily }}
          >
            {eventName}
          </span>
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-border shrink-0" />

        {/* Body preview */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Body</span>
          <span
            className="text-sm truncate text-foreground/80 leading-tight"
            style={{ fontFamily: bodyFamily }}
          >
            {eventDate || `Welcome to ${eventName}`}
          </span>
        </div>

        {/* Font names */}
        <div className="ml-auto shrink-0">
          <span className="text-[10px] text-muted-foreground">
            {selectedFonts.heading} / {selectedFonts.body}
          </span>
        </div>
      </div>
    </div>
  );
};
