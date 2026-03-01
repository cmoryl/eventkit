import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Copy, Check, Plus, Trash2, RotateCcw, Download, Shuffle,
  Pipette, ArrowLeft, Palette, Sparkles, Lock, Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Brand } from '@/types/studio.types';
import { toast } from 'sonner';

// ─── Color Math Utilities ───────────────────────────────────────────

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function luminance(hex: string): number {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ─── Harmony Generators ─────────────────────────────────────────────

type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'tetradic' | 'monochromatic';

function generateHarmony(baseHex: string, type: HarmonyType): string[] {
  const [h, s, l] = hexToHsl(baseHex);
  const wrap = (deg: number) => ((deg % 360) + 360) % 360;

  switch (type) {
    case 'complementary':
      return [baseHex, hslToHex(wrap(h + 180), s, l)];
    case 'analogous':
      return [hslToHex(wrap(h - 30), s, l), baseHex, hslToHex(wrap(h + 30), s, l)];
    case 'triadic':
      return [baseHex, hslToHex(wrap(h + 120), s, l), hslToHex(wrap(h + 240), s, l)];
    case 'split-complementary':
      return [baseHex, hslToHex(wrap(h + 150), s, l), hslToHex(wrap(h + 210), s, l)];
    case 'tetradic':
      return [baseHex, hslToHex(wrap(h + 90), s, l), hslToHex(wrap(h + 180), s, l), hslToHex(wrap(h + 270), s, l)];
    case 'monochromatic':
      return [
        hslToHex(h, s, Math.max(l - 30, 10)),
        hslToHex(h, s, Math.max(l - 15, 15)),
        baseHex,
        hslToHex(h, s, Math.min(l + 15, 85)),
        hslToHex(h, s, Math.min(l + 30, 95)),
      ];
    default:
      return [baseHex];
  }
}

const HARMONY_INFO: Record<HarmonyType, { label: string; icon: string; description: string }> = {
  complementary: { label: 'Complementary', icon: '◐', description: 'Opposite on color wheel — high contrast' },
  analogous: { label: 'Analogous', icon: '◔', description: 'Adjacent hues — harmonious & cohesive' },
  triadic: { label: 'Triadic', icon: '△', description: 'Three equidistant hues — vibrant balance' },
  'split-complementary': { label: 'Split Comp.', icon: '⋔', description: 'Complement\'s neighbors — softer contrast' },
  tetradic: { label: 'Tetradic', icon: '◇', description: 'Four equidistant — rich & complex' },
  monochromatic: { label: 'Mono', icon: '▬', description: 'Single hue, varying lightness' },
};

// ─── Swatch Type ────────────────────────────────────────────────────

interface PaletteSwatch {
  id: string;
  hex: string;
  locked: boolean;
  name?: string;
}

// ─── Props ──────────────────────────────────────────────────────────

interface ColorPaletteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand | null;
  onSavePalette?: (colors: { hex: string; name: string }[]) => void;
}

// ─── Component ──────────────────────────────────────────────────────

export const ColorPaletteEditor: React.FC<ColorPaletteEditorProps> = ({
  isOpen, onClose, brand, onSavePalette
}) => {
  // Seed from brand colors or defaults
  const seedColors = useCallback((): PaletteSwatch[] => {
    const brandColors = brand?.styles?.color_palette as any[] | undefined;
    if (brandColors?.length) {
      return brandColors.slice(0, 8).map((c: any, i: number) => ({
        id: `swatch-${i}`,
        hex: (c.hex || c).toUpperCase(),
        locked: false,
        name: c.name || '',
      }));
    }
    return [
      { id: 'swatch-0', hex: '#6D28D9', locked: false, name: 'Primary' },
      { id: 'swatch-1', hex: '#EC4899', locked: false, name: 'Accent' },
      { id: 'swatch-2', hex: '#F59E0B', locked: false, name: 'Warm' },
      { id: 'swatch-3', hex: '#10B981', locked: false, name: 'Success' },
      { id: 'swatch-4', hex: '#1E293B', locked: false, name: 'Dark' },
    ];
  }, [brand]);

  const [swatches, setSwatches] = useState<PaletteSwatch[]>(seedColors);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [harmonyType, setHarmonyType] = useState<HarmonyType>('complementary');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingHex, setEditingHex] = useState('');
  const wheelRef = useRef<HTMLCanvasElement>(null);

  // Keep editingHex in sync
  useEffect(() => {
    if (swatches[selectedIndex]) {
      setEditingHex(swatches[selectedIndex].hex);
    }
  }, [selectedIndex, swatches]);

  // Draw color wheel
  useEffect(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width;
    const cx = size / 2, cy = size / 2, radius = size / 2 - 4;

    ctx.clearRect(0, 0, size, size);

    // Hue ring
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = (angle + 1) * Math.PI / 180;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.arc(cx, cy, radius * 0.65, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = `hsl(${angle}, 85%, 55%)`;
      ctx.fill();
    }

    // Inner gradient (saturation/lightness)
    const innerRadius = radius * 0.6;
    const [h] = hexToHsl(swatches[selectedIndex]?.hex || '#6D28D9');
    
    // Draw inner circle with gradient
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerRadius);
    gradient.addColorStop(0, `hsl(${h}, 0%, 100%)`);
    gradient.addColorStop(0.5, `hsl(${h}, 50%, 50%)`);
    gradient.addColorStop(1, `hsl(${h}, 100%, 25%)`);
    
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw harmony markers
    const harmony = generateHarmony(swatches[selectedIndex]?.hex || '#6D28D9', harmonyType);
    harmony.forEach((hex, i) => {
      const [hh] = hexToHsl(hex);
      const markerAngle = (hh - 90) * Math.PI / 180;
      const markerRadius = radius * 0.825;
      const mx = cx + Math.cos(markerAngle) * markerRadius;
      const my = cy + Math.sin(markerAngle) * markerRadius;

      ctx.beginPath();
      ctx.arc(mx, my, i === 0 ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle = hex;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [swatches, selectedIndex, harmonyType]);

  // Wheel click to pick hue
  const handleWheelClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const dist = Math.sqrt(x * x + y * y);
    const maxRadius = rect.width / 2;
    
    if (dist > maxRadius * 0.65 && dist < maxRadius) {
      // Hue ring click
      let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
      if (angle < 0) angle += 360;
      const [, s, l] = hexToHsl(swatches[selectedIndex].hex);
      updateSwatch(selectedIndex, hslToHex(Math.round(angle), s, l));
    } else if (dist <= maxRadius * 0.6) {
      // Inner area — map to saturation/lightness
      const normX = (x / (maxRadius * 0.6) + 1) / 2; // 0-1
      const normY = (y / (maxRadius * 0.6) + 1) / 2; // 0-1
      const [h] = hexToHsl(swatches[selectedIndex].hex);
      const sat = Math.round(normX * 100);
      const light = Math.round((1 - normY) * 100);
      updateSwatch(selectedIndex, hslToHex(h, Math.min(sat, 100), Math.max(Math.min(light, 95), 5)));
    }
  };

  const updateSwatch = (index: number, hex: string) => {
    setSwatches(prev => prev.map((s, i) => i === index ? { ...s, hex: hex.toUpperCase() } : s));
  };

  const handleHexInput = (value: string) => {
    setEditingHex(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      updateSwatch(selectedIndex, value);
    }
  };

  const applyHarmony = () => {
    const base = swatches[selectedIndex]?.hex || '#6D28D9';
    const harmony = generateHarmony(base, harmonyType);
    
    const newSwatches: PaletteSwatch[] = harmony.map((hex, i) => ({
      id: `harmony-${Date.now()}-${i}`,
      hex: hex.toUpperCase(),
      locked: false,
      name: i === 0 ? 'Base' : `${HARMONY_INFO[harmonyType].label} ${i}`,
    }));
    
    // Keep locked swatches, replace unlocked
    const locked = swatches.filter(s => s.locked);
    setSwatches([...locked, ...newSwatches].slice(0, 10));
    setSelectedIndex(locked.length);
    toast.success(`${HARMONY_INFO[harmonyType].label} palette generated`);
  };

  const addSwatch = () => {
    if (swatches.length >= 10) return;
    const [h] = hexToHsl(swatches[selectedIndex]?.hex || '#6D28D9');
    const newHex = hslToHex((h + 45) % 360, 70, 55);
    setSwatches(prev => [...prev, {
      id: `swatch-${Date.now()}`,
      hex: newHex.toUpperCase(),
      locked: false,
    }]);
    setSelectedIndex(swatches.length);
  };

  const removeSwatch = (index: number) => {
    if (swatches.length <= 2) return;
    setSwatches(prev => prev.filter((_, i) => i !== index));
    if (selectedIndex >= swatches.length - 1) setSelectedIndex(Math.max(0, swatches.length - 2));
  };

  const toggleLock = (index: number) => {
    setSwatches(prev => prev.map((s, i) => i === index ? { ...s, locked: !s.locked } : s));
  };

  const shuffleUnlocked = () => {
    setSwatches(prev => prev.map(s => s.locked ? s : {
      ...s,
      hex: hslToHex(Math.floor(Math.random() * 360), 50 + Math.floor(Math.random() * 40), 35 + Math.floor(Math.random() * 40)).toUpperCase()
    }));
  };

  const copyHex = (id: string, hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    toast.success(`Copied ${hex}`);
  };

  const handleSave = () => {
    const palette = swatches.map(s => ({ hex: s.hex, name: s.name || '' }));
    onSavePalette?.(palette);
    toast.success('Palette saved to brand');
    onClose();
  };

  const exportCSS = () => {
    const css = swatches.map((s, i) => `  --color-${i + 1}: ${s.hex};`).join('\n');
    navigator.clipboard.writeText(`:root {\n${css}\n}`);
    toast.success('CSS variables copied to clipboard');
  };

  const selected = swatches[selectedIndex];
  const [selH, selS, selL] = selected ? hexToHsl(selected.hex) : [0, 0, 0];
  const contrastWhite = selected ? contrastRatio(selected.hex, '#FFFFFF') : 0;
  const contrastBlack = selected ? contrastRatio(selected.hex, '#000000') : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background flex flex-col"
      >
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 sm:px-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Palette className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-sm sm:text-base">Color Palette Editor</h1>
            {brand && (
              <span className="text-xs text-muted-foreground hidden sm:inline">— {brand.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSS} className="hidden sm:flex gap-1 h-8 text-xs">
              <Copy className="h-3 w-3" />
              CSS
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-gradient-to-r from-violet-500 to-purple-600 h-8 text-xs gap-1">
              <Download className="h-3 w-3" />
              Save Palette
            </Button>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            
            {/* Left: Swatches + Wheel */}
            <div className="space-y-6">
              
              {/* Palette Strip */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-foreground">Your Palette</h2>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={shuffleUnlocked} title="Shuffle unlocked">
                      <Shuffle className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={addSwatch} title="Add color" disabled={swatches.length >= 10}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                {/* Large swatch cards */}
                <div className="flex gap-2 flex-wrap">
                  {swatches.map((swatch, i) => (
                    <motion.div
                      key={swatch.id}
                      layout
                      className={cn(
                        "relative group/swatch rounded-xl overflow-hidden cursor-pointer transition-all",
                        i === selectedIndex
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "hover:ring-1 hover:ring-border"
                      )}
                      style={{ width: 'calc(min(80px, (100% - 40px) / 5))' }}
                      onClick={() => setSelectedIndex(i)}
                    >
                      <div
                        className="aspect-square"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      
                      {/* Hex label */}
                      <div className="px-1.5 py-1 bg-card text-center">
                        <span className="text-[9px] font-mono text-muted-foreground">{swatch.hex}</span>
                      </div>

                      {/* Lock indicator */}
                      {swatch.locked && (
                        <div className="absolute top-1 left-1 p-0.5 rounded bg-background/70">
                          <Lock className="w-2.5 h-2.5 text-foreground" />
                        </div>
                      )}

                      {/* Hover actions */}
                      <div className="absolute top-1 right-1 flex flex-col gap-0.5 opacity-0 group-hover/swatch:opacity-100 transition-opacity">
                        <button
                          className="p-0.5 rounded bg-background/70 hover:bg-background text-foreground"
                          onClick={(e) => { e.stopPropagation(); copyHex(swatch.id, swatch.hex); }}
                          title="Copy hex"
                        >
                          {copiedId === swatch.id ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                        </button>
                        <button
                          className="p-0.5 rounded bg-background/70 hover:bg-background text-foreground"
                          onClick={(e) => { e.stopPropagation(); toggleLock(i); }}
                          title={swatch.locked ? 'Unlock' : 'Lock'}
                        >
                          {swatch.locked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                        </button>
                        {swatches.length > 2 && !swatch.locked && (
                          <button
                            className="p-0.5 rounded bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                            onClick={(e) => { e.stopPropagation(); removeSwatch(i); }}
                            title="Remove"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Full-width palette preview bar */}
                <div className="flex h-12 rounded-xl overflow-hidden shadow-sm border border-border">
                  {swatches.map(swatch => (
                    <div
                      key={swatch.id}
                      className="flex-1 transition-all"
                      style={{ backgroundColor: swatch.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Color Wheel + HSL Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Wheel */}
                <div className="flex flex-col items-center gap-3">
                  <canvas
                    ref={wheelRef}
                    width={240}
                    height={240}
                    className="rounded-full cursor-crosshair border border-border shadow-inner"
                    onClick={handleWheelClick}
                  />
                  <p className="text-[10px] text-muted-foreground">Click ring for hue, center for saturation/lightness</p>
                </div>

                {/* HSL Sliders + Hex Input */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Hex</label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg border border-border shadow-inner" style={{ backgroundColor: selected?.hex }} />
                      <Input
                        value={editingHex}
                        onChange={(e) => handleHexInput(e.target.value)}
                        className="font-mono text-sm h-8"
                        maxLength={7}
                      />
                    </div>
                  </div>
                  
                  {/* Hue */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 flex justify-between">
                      <span>Hue</span><span className="font-mono">{selH}°</span>
                    </label>
                    <input
                      type="range" min={0} max={359} value={selH}
                      onChange={(e) => updateSwatch(selectedIndex, hslToHex(+e.target.value, selS, selL))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, 
                          hsl(0,85%,55%), hsl(60,85%,55%), hsl(120,85%,55%), 
                          hsl(180,85%,55%), hsl(240,85%,55%), hsl(300,85%,55%), hsl(360,85%,55%))`
                      }}
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 flex justify-between">
                      <span>Saturation</span><span className="font-mono">{selS}%</span>
                    </label>
                    <input
                      type="range" min={0} max={100} value={selS}
                      onChange={(e) => updateSwatch(selectedIndex, hslToHex(selH, +e.target.value, selL))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, hsl(${selH},0%,${selL}%), hsl(${selH},100%,${selL}%))`
                      }}
                    />
                  </div>

                  {/* Lightness */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 flex justify-between">
                      <span>Lightness</span><span className="font-mono">{selL}%</span>
                    </label>
                    <input
                      type="range" min={5} max={95} value={selL}
                      onChange={(e) => updateSwatch(selectedIndex, hslToHex(selH, selS, +e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, hsl(${selH},${selS}%,5%), hsl(${selH},${selS}%,50%), hsl(${selH},${selS}%,95%))`
                      }}
                    />
                  </div>

                  {/* Contrast Info */}
                  <div className="border border-border rounded-lg p-3 space-y-2">
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Contrast Ratio</h4>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-white border border-border flex items-center justify-center text-[8px] font-bold" style={{ color: selected?.hex }}>Aa</div>
                        <div>
                          <div className="text-xs font-mono">{contrastWhite.toFixed(1)}:1</div>
                          <div className={cn("text-[9px]", contrastWhite >= 4.5 ? "text-green-500" : contrastWhite >= 3 ? "text-yellow-500" : "text-red-500")}>
                            {contrastWhite >= 7 ? 'AAA' : contrastWhite >= 4.5 ? 'AA' : contrastWhite >= 3 ? 'AA Large' : 'Fail'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-black border border-border flex items-center justify-center text-[8px] font-bold" style={{ color: selected?.hex }}>Aa</div>
                        <div>
                          <div className="text-xs font-mono">{contrastBlack.toFixed(1)}:1</div>
                          <div className={cn("text-[9px]", contrastBlack >= 4.5 ? "text-green-500" : contrastBlack >= 3 ? "text-yellow-500" : "text-red-500")}>
                            {contrastBlack >= 7 ? 'AAA' : contrastBlack >= 4.5 ? 'AA' : contrastBlack >= 3 ? 'AA Large' : 'Fail'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Harmony Tools */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Color Harmony
              </h2>

              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(HARMONY_INFO) as [HarmonyType, typeof HARMONY_INFO[HarmonyType]][]).map(([type, info]) => {
                  const preview = generateHarmony(selected?.hex || '#6D28D9', type);
                  return (
                    <button
                      key={type}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-all hover:border-primary/50",
                        harmonyType === type
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-card"
                      )}
                      onClick={() => setHarmonyType(type)}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-sm">{info.icon}</span>
                        <span className="text-xs font-medium">{info.label}</span>
                      </div>
                      <div className="flex h-4 rounded overflow-hidden">
                        {preview.map((hex, i) => (
                          <div key={i} className="flex-1" style={{ backgroundColor: hex }} />
                        ))}
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-1.5 leading-tight">{info.description}</p>
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={applyHarmony}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 gap-2"
                size="sm"
              >
                <Palette className="h-3.5 w-3.5" />
                Apply {HARMONY_INFO[harmonyType].label}
              </Button>

              {/* Quick Preview */}
              <div className="border border-border rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground">Live Preview</h3>
                
                {/* Card mockup */}
                <div className="rounded-lg overflow-hidden border border-border" style={{ backgroundColor: swatches[swatches.length - 1]?.hex || '#fff' }}>
                  <div className="h-12" style={{ backgroundColor: swatches[0]?.hex }} />
                  <div className="p-3 space-y-1.5">
                    <div className="h-3 rounded-full w-3/4" style={{ backgroundColor: swatches[1]?.hex || swatches[0]?.hex, opacity: 0.8 }} />
                    <div className="h-2 rounded-full w-1/2" style={{ backgroundColor: swatches[2]?.hex || swatches[0]?.hex, opacity: 0.4 }} />
                    <div className="flex gap-2 mt-2">
                      <div className="h-6 px-3 rounded-md flex items-center" style={{ backgroundColor: swatches[0]?.hex }}>
                        <span className="text-[8px] font-medium" style={{ color: contrastWhite > contrastBlack ? '#fff' : '#000' }}>Button</span>
                      </div>
                      <div className="h-6 px-3 rounded-md flex items-center border" style={{ borderColor: swatches[1]?.hex || swatches[0]?.hex }}>
                        <span className="text-[8px] font-medium" style={{ color: swatches[1]?.hex || swatches[0]?.hex }}>Outline</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text preview */}
                <div className="space-y-1">
                  {swatches.slice(0, 3).map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.hex }} />
                      <span className="text-[10px]" style={{ color: s.hex }}>
                        {i === 0 ? 'Heading Text' : i === 1 ? 'Accent Text' : 'Body Text'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs"
                onClick={() => { setSwatches(seedColors()); setSelectedIndex(0); }}
              >
                <RotateCcw className="h-3 w-3" />
                Reset to Brand Colors
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
