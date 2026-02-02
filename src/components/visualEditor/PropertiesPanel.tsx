// Properties Panel - Edit selected element properties
import React, { useState, useEffect } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ChevronDown, Trash2, Copy, Lock, Unlock, Eye, EyeOff,
  MoveUp, MoveDown, ChevronsUp, ChevronsDown, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { CanvasElement, TextStyle } from '@/types/visualEditor.types';

interface PropertiesPanelProps {
  selectedElements: CanvasElement[];
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElements: (ids: string[]) => void;
  onDuplicateElements: (ids: string[]) => void;
  onReorderElement: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
}

const FONT_FAMILIES = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 
  'Playfair Display', 'Merriweather', 'Poppins', 'Raleway'
];

const FONT_WEIGHTS = [
  { value: '100', label: 'Thin' },
  { value: '200', label: 'Extra Light' },
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' }
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElements,
  onUpdateElement,
  onDeleteElements,
  onDuplicateElements,
  onReorderElement
}) => {
  const [openSections, setOpenSections] = useState(['position', 'style', 'text']);
  
  const element = selectedElements.length === 1 ? selectedElements[0] : null;
  const multiSelect = selectedElements.length > 1;

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  if (selectedElements.length === 0) {
    return (
      <div className="w-72 border-l bg-background p-4 flex flex-col items-center justify-center text-center text-muted-foreground">
        <p className="text-sm">Select an element to edit its properties</p>
      </div>
    );
  }

  const updateStyle = (updates: Partial<CanvasElement['style']>) => {
    if (element) {
      onUpdateElement(element.id, { 
        style: { ...element.style, ...updates } 
      });
    }
  };

  const updateTextStyle = (updates: Partial<TextStyle>) => {
    if (element && element.textStyle) {
      onUpdateElement(element.id, { 
        textStyle: { ...element.textStyle, ...updates } 
      });
    }
  };

  const updatePosition = (updates: Partial<CanvasElement['position']>) => {
    if (element) {
      onUpdateElement(element.id, { 
        position: { ...element.position, ...updates } 
      });
    }
  };

  const updateSize = (updates: Partial<CanvasElement['size']>) => {
    if (element) {
      onUpdateElement(element.id, { 
        size: { ...element.size, ...updates } 
      });
    }
  };

  return (
    <div className="w-72 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">
            {multiSelect ? `${selectedElements.length} Elements` : element?.name || 'Properties'}
          </h3>
          <p className="text-xs text-muted-foreground capitalize">{element?.type}</p>
        </div>
        <div className="flex gap-1">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7"
            onClick={() => element && onUpdateElement(element.id, { visible: !element.visible })}
          >
            {element?.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7"
            onClick={() => element && onUpdateElement(element.id, { locked: !element.locked })}
          >
            {element?.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-1 flex-wrap">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onDuplicateElements(selectedElements.map(e => e.id))}>
              <Copy className="h-3 w-3" /> Duplicate
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => onDeleteElements(selectedElements.map(e => e.id))}>
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
          </div>

          {element && (
            <>
              {/* Layer Order */}
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => onReorderElement(element.id, 'top')} title="Bring to front">
                  <ChevronsUp className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => onReorderElement(element.id, 'up')} title="Bring forward">
                  <MoveUp className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => onReorderElement(element.id, 'down')} title="Send backward">
                  <MoveDown className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => onReorderElement(element.id, 'bottom')} title="Send to back">
                  <ChevronsDown className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" className="h-7 w-7 p-0 ml-auto" onClick={() => onUpdateElement(element.id, { transform: { ...element.transform, rotation: 0 } })} title="Reset rotation">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Separator />

              {/* Position & Size */}
              <Collapsible open={openSections.includes('position')} onOpenChange={() => toggleSection('position')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 text-sm font-medium">
                  Position & Size
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.includes('position') && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">X</Label>
                      <Input 
                        type="number" 
                        value={Math.round(element.position.x)} 
                        onChange={(e) => updatePosition({ x: Number(e.target.value) })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Y</Label>
                      <Input 
                        type="number" 
                        value={Math.round(element.position.y)} 
                        onChange={(e) => updatePosition({ y: Number(e.target.value) })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Width</Label>
                      <Input 
                        type="number" 
                        value={Math.round(element.size.width)} 
                        onChange={(e) => updateSize({ width: Number(e.target.value) })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Height</Label>
                      <Input 
                        type="number" 
                        value={Math.round(element.size.height)} 
                        onChange={(e) => updateSize({ height: Number(e.target.value) })}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Rotation: {Math.round(element.transform.rotation)}°</Label>
                    <Slider
                      value={[element.transform.rotation]}
                      onValueChange={([v]) => onUpdateElement(element.id, { transform: { ...element.transform, rotation: v } })}
                      min={-180}
                      max={180}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Style */}
              <Collapsible open={openSections.includes('style')} onOpenChange={() => toggleSection('style')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 text-sm font-medium">
                  Style
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.includes('style') && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-3">
                  {/* Fill Color */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Fill Color</Label>
                    <div className="flex gap-2 mt-1">
                      <input 
                        type="color" 
                        value={element.style.fill || '#000000'} 
                        onChange={(e) => updateStyle({ fill: e.target.value })}
                        className="w-10 h-8 rounded border cursor-pointer"
                      />
                      <Input 
                        value={element.style.fill || ''} 
                        onChange={(e) => updateStyle({ fill: e.target.value })}
                        className="h-8 font-mono text-xs"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  {/* Border */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Border</Label>
                    <div className="flex gap-2 mt-1">
                      <input 
                        type="color" 
                        value={element.style.stroke || '#000000'} 
                        onChange={(e) => updateStyle({ stroke: e.target.value })}
                        className="w-10 h-8 rounded border cursor-pointer"
                      />
                      <Input 
                        type="number" 
                        value={element.style.strokeWidth || 0} 
                        onChange={(e) => updateStyle({ strokeWidth: Number(e.target.value) })}
                        className="h-8 w-16"
                        min={0}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Opacity */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Opacity: {Math.round((element.style.opacity ?? 1) * 100)}%</Label>
                    <Slider
                      value={[(element.style.opacity ?? 1) * 100]}
                      onValueChange={([v]) => updateStyle({ opacity: v / 100 })}
                      min={0}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  {/* Border Radius */}
                  {element.type === 'shape' && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Corner Radius: {element.style.borderRadius || 0}px</Label>
                      <Slider
                        value={[element.style.borderRadius || 0]}
                        onValueChange={([v]) => updateStyle({ borderRadius: v })}
                        min={0}
                        max={100}
                        step={1}
                        className="mt-1"
                      />
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* Text Properties */}
              {element.type === 'text' && element.textStyle && (
                <>
                  <Separator />
                  <Collapsible open={openSections.includes('text')} onOpenChange={() => toggleSection('text')}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 text-sm font-medium">
                      Text
                      <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.includes('text') && "rotate-180")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 space-y-3">
                      {/* Content */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Content</Label>
                        <Input 
                          value={element.content || ''} 
                          onChange={(e) => onUpdateElement(element.id, { content: e.target.value })}
                          className="h-8 mt-1"
                        />
                      </div>

                      {/* Font Family */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Font</Label>
                        <Select 
                          value={element.textStyle.fontFamily} 
                          onValueChange={(v) => updateTextStyle({ fontFamily: v })}
                        >
                          <SelectTrigger className="h-8 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_FAMILIES.map(font => (
                              <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                {font}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Font Size & Weight */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Size</Label>
                          <Input 
                            type="number" 
                            value={element.textStyle.fontSize} 
                            onChange={(e) => updateTextStyle({ fontSize: Number(e.target.value) })}
                            className="h-8"
                            min={8}
                            max={200}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Weight</Label>
                          <Select 
                            value={element.textStyle.fontWeight?.toString()} 
                            onValueChange={(v) => updateTextStyle({ fontWeight: v as TextStyle['fontWeight'] })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FONT_WEIGHTS.map(fw => (
                                <SelectItem key={fw.value} value={fw.value}>
                                  {fw.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Text Styling Buttons */}
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant={element.textStyle.fontWeight === 'bold' ? 'default' : 'outline'} 
                          className="h-8 w-8 p-0"
                          onClick={() => updateTextStyle({ fontWeight: element.textStyle!.fontWeight === 'bold' ? 'normal' : 'bold' })}
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={element.textStyle.fontStyle === 'italic' ? 'default' : 'outline'} 
                          className="h-8 w-8 p-0"
                          onClick={() => updateTextStyle({ fontStyle: element.textStyle!.fontStyle === 'italic' ? 'normal' : 'italic' })}
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={element.textStyle.textDecoration === 'underline' ? 'default' : 'outline'} 
                          className="h-8 w-8 p-0"
                          onClick={() => updateTextStyle({ textDecoration: element.textStyle!.textDecoration === 'underline' ? 'none' : 'underline' })}
                        >
                          <Underline className="h-4 w-4" />
                        </Button>
                        <div className="w-px bg-border mx-1" />
                        <Button 
                          size="sm" 
                          variant={element.textStyle.textAlign === 'left' ? 'default' : 'outline'} 
                          className="h-8 w-8 p-0"
                          onClick={() => updateTextStyle({ textAlign: 'left' })}
                        >
                          <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={element.textStyle.textAlign === 'center' ? 'default' : 'outline'} 
                          className="h-8 w-8 p-0"
                          onClick={() => updateTextStyle({ textAlign: 'center' })}
                        >
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={element.textStyle.textAlign === 'right' ? 'default' : 'outline'} 
                          className="h-8 w-8 p-0"
                          onClick={() => updateTextStyle({ textAlign: 'right' })}
                        >
                          <AlignRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Letter & Line Spacing */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Letter Spacing</Label>
                          <Input 
                            type="number" 
                            value={element.textStyle.letterSpacing} 
                            onChange={(e) => updateTextStyle({ letterSpacing: Number(e.target.value) })}
                            className="h-8"
                            step={0.5}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Line Height</Label>
                          <Input 
                            type="number" 
                            value={element.textStyle.lineHeight} 
                            onChange={(e) => updateTextStyle({ lineHeight: Number(e.target.value) })}
                            className="h-8"
                            step={0.1}
                            min={0.5}
                            max={3}
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
