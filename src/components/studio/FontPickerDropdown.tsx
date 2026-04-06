import React, { useState, useEffect } from 'react';
import { Type, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { GOOGLE_FONTS, FONT_PAIRINGS, type GoogleFontSelection } from './AssetBriefModal';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FontPickerDropdownProps {
  selectedFonts: GoogleFontSelection | null;
  onFontsChange: (fonts: GoogleFontSelection | null) => void;
  compact?: boolean;
}

type TabId = 'pairings' | 'heading' | 'body';

export const FontPickerDropdown: React.FC<FontPickerDropdownProps> = ({
  selectedFonts,
  onFontsChange,
  compact = true,
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('pairings');
  const { loadFont } = useGoogleFonts();

  // Preload selected fonts
  useEffect(() => {
    if (selectedFonts) {
      loadFont(selectedFonts.heading).catch(() => {});
      loadFont(selectedFonts.body).catch(() => {});
    }
  }, [selectedFonts, loadFont]);

  const handlePairingSelect = (pairing: typeof FONT_PAIRINGS[0]) => {
    const fonts: GoogleFontSelection = { heading: pairing.heading, body: pairing.body };
    onFontsChange(fonts);
    loadFont(pairing.heading).catch(() => {});
    loadFont(pairing.body).catch(() => {});
  };

  const handleFontSelect = (fontName: string, role: 'heading' | 'body') => {
    const current = selectedFonts || { heading: 'Montserrat', body: 'Open Sans' };
    const updated = { ...current, [role]: fontName };
    onFontsChange(updated);
    loadFont(fontName).catch(() => {});
  };

  const handleClear = () => {
    onFontsChange(null);
  };

  const allFonts = [
    ...GOOGLE_FONTS.display,
    ...GOOGLE_FONTS.body,
    ...GOOGLE_FONTS.elegant,
    ...GOOGLE_FONTS.modern,
    ...GOOGLE_FONTS.script,
  ];

  const label = selectedFonts
    ? `${selectedFonts.heading} / ${selectedFonts.body}`
    : 'Fonts';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-1.5 text-xs h-8",
            selectedFonts && "border-primary/40 text-primary"
          )}
        >
          <Type className="h-3.5 w-3.5" />
          {compact ? (selectedFonts ? selectedFonts.heading : 'Fonts') : label}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Tabs */}
        <div className="flex border-b border-border">
          {(['pairings', 'heading', 'body'] as TabId[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium transition-colors",
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === 'pairings' ? 'Pairings' : tab === 'heading' ? 'Heading' : 'Body'}
            </button>
          ))}
        </div>

        <ScrollArea className="h-64">
          <div className="p-2 space-y-1">
            {activeTab === 'pairings' && (
              <>
                {/* Clear option */}
                <button
                  onClick={handleClear}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm hover:bg-muted/50 transition-colors",
                    !selectedFonts && "bg-muted"
                  )}
                >
                  <div className="flex-1">
                    <span className="font-medium text-xs text-muted-foreground">Default (Brand fonts)</span>
                  </div>
                  {!selectedFonts && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>

                {FONT_PAIRINGS.map(pairing => {
                  const isSelected = selectedFonts?.heading === pairing.heading && selectedFonts?.body === pairing.body;
                  return (
                    <button
                      key={pairing.id}
                      onClick={() => handlePairingSelect(pairing)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left hover:bg-muted/50 transition-colors",
                        isSelected && "bg-primary/5 border border-primary/20"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span
                            className="font-semibold text-sm truncate"
                            style={{ fontFamily: `'${pairing.heading}', sans-serif` }}
                          >
                            {pairing.name}
                          </span>
                        </div>
                        <p
                          className="text-xs text-muted-foreground truncate"
                          style={{ fontFamily: `'${pairing.body}', sans-serif` }}
                        >
                          {pairing.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {pairing.heading} + {pairing.body}
                        </p>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </>
            )}

            {(activeTab === 'heading' || activeTab === 'body') && (
              <>
                {Object.entries(GOOGLE_FONTS).map(([category, fonts]) => (
                  <div key={category}>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1.5">
                      {category}
                    </p>
                    {fonts.map(font => {
                      const isSelected = activeTab === 'heading'
                        ? selectedFonts?.heading === font.name
                        : selectedFonts?.body === font.name;
                      return (
                        <button
                          key={font.name}
                          onClick={() => handleFontSelect(font.name, activeTab)}
                          onMouseEnter={() => loadFont(font.name).catch(() => {})}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-md text-left hover:bg-muted/50 transition-colors",
                            isSelected && "bg-primary/5"
                          )}
                        >
                          <span
                            className="text-sm"
                            style={{ fontFamily: `'${font.name}', ${font.category}` }}
                          >
                            {font.name}
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer showing current selection */}
        {selectedFonts && (
          <div className="border-t border-border px-3 py-2 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-muted-foreground">
                <span style={{ fontFamily: `'${selectedFonts.heading}', sans-serif` }} className="font-semibold">
                  {selectedFonts.heading}
                </span>
                {' / '}
                <span style={{ fontFamily: `'${selectedFonts.body}', sans-serif` }}>
                  {selectedFonts.body}
                </span>
              </div>
              <button
                onClick={handleClear}
                className="text-[10px] text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
