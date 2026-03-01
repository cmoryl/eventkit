import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Copy, Check, Plus, Trash2, RotateCcw, Download, Shuffle,
  Pipette, ArrowLeft, Palette, Sparkles, Lock, Unlock, Upload, ImageIcon
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
  const eyedropperCanvasRef = useRef<HTMLCanvasElement>(null);
  const eyedropperImgRef = useRef<HTMLImageElement | null>(null);
  const [eyedropperImage, setEyedropperImage] = useState<string | null>(null);
  const [eyedropperActive, setEyedropperActive] = useState(false);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [sampledColors, setSampledColors] = useState<string[]>([]);
  const [dominantColors, setDominantColors] = useState<{ hex: string; pct: number }[]>([]);
  const [extracting, setExtracting] = useState(false);

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

  const exportTailwind = () => {
    const colors: Record<string, string> = {};
    swatches.forEach((s, i) => {
      const key = s.name?.toLowerCase().replace(/\s+/g, '-') || `color-${i + 1}`;
      colors[key] = s.hex;
    });
    const config = `// tailwind.config colors\ncolors: ${JSON.stringify(colors, null, 2)}`;
    navigator.clipboard.writeText(config);
    toast.success('Tailwind config copied to clipboard');
  };

  const exportASE = () => {
    // Build a minimal ASE (Adobe Swatch Exchange) binary file
    const hexToRgbFloat = (hex: string) => {
      const h = hex.replace('#', '');
      return [
        parseInt(h.substring(0, 2), 16) / 255,
        parseInt(h.substring(2, 4), 16) / 255,
        parseInt(h.substring(4, 6), 16) / 255,
      ];
    };

    const entries: ArrayBuffer[] = [];
    for (const s of swatches) {
      const name = s.name || s.hex;
      // Encode name as UTF-16BE with null terminator
      const nameLen = name.length + 1;
      const nameBytes = new ArrayBuffer(nameLen * 2);
      const nameView = new DataView(nameBytes);
      for (let i = 0; i < name.length; i++) nameView.setUint16(i * 2, name.charCodeAt(i));
      nameView.setUint16((nameLen - 1) * 2, 0);

      const rgb = hexToRgbFloat(s.hex);
      // Block: type(2) + blockLen(4) + nameLen(2) + nameBytes + colorModel(4) + 3 floats(12) + colorType(2)
      const blockDataLen = 2 + nameLen * 2 + 4 + 12 + 2;
      const block = new ArrayBuffer(6 + blockDataLen);
      const bv = new DataView(block);
      bv.setUint16(0, 0x0001); // color entry
      bv.setUint32(2, blockDataLen);
      bv.setUint16(6, nameLen);
      const blockU8 = new Uint8Array(block);
      blockU8.set(new Uint8Array(nameBytes), 8);
      const colorOff = 8 + nameLen * 2;
      // "RGB " as 4 ASCII chars
      bv.setUint8(colorOff, 82); bv.setUint8(colorOff + 1, 71);
      bv.setUint8(colorOff + 2, 66); bv.setUint8(colorOff + 3, 32);
      // Write floats
      const dv = new DataView(block);
      dv.setFloat32(colorOff + 4, rgb[0]);
      dv.setFloat32(colorOff + 8, rgb[1]);
      dv.setFloat32(colorOff + 12, rgb[2]);
      dv.setUint16(colorOff + 16, 0); // global color type
      entries.push(block);
    }

    // Header: ASEF(4) + version(4) + numBlocks(4)
    const totalSize = 12 + entries.reduce((sum, e) => sum + e.byteLength, 0);
    const ase = new ArrayBuffer(totalSize);
    const av = new DataView(ase);
    // "ASEF"
    av.setUint8(0, 65); av.setUint8(1, 83); av.setUint8(2, 69); av.setUint8(3, 70);
    av.setUint32(4, 0x00010000); // version 1.0
    av.setUint32(8, swatches.length);
    const au8 = new Uint8Array(ase);
    let offset = 12;
    for (const entry of entries) {
      au8.set(new Uint8Array(entry), offset);
      offset += entry.byteLength;
    }

    const blob = new Blob([ase], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'palette.ase';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('ASE swatch file downloaded');
  };

  // ─── Eyedropper Logic ───────────────────────────────────────────

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setEyedropperImage(dataUrl);
      setSampledColors([]);
      setDominantColors([]);
    };
    reader.readAsDataURL(file);
  };

  // ─── Dominant Color Extraction (quantized k-means) ──────────────
  const extractDominantColors = useCallback((canvas: HTMLCanvasElement, count = 5) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    setExtracting(true);

    // Sample pixels on a smaller grid for speed
    const step = Math.max(1, Math.floor(Math.sqrt((canvas.width * canvas.height) / 10000)));
    const pixels: [number, number, number][] = [];
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const d = ctx.getImageData(x, y, 1, 1).data;
        if (d[3] < 128) continue; // skip transparent
        pixels.push([d[0], d[1], d[2]]);
      }
    }

    if (pixels.length === 0) { setExtracting(false); return; }

    // Simple k-means
    let centroids: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
    }

    const dist = (a: number[], b: number[]) =>
      (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

    for (let iter = 0; iter < 15; iter++) {
      const clusters: [number, number, number][][] = centroids.map(() => []);
      for (const p of pixels) {
        let minD = Infinity, minI = 0;
        for (let c = 0; c < centroids.length; c++) {
          const d = dist(p, centroids[c]);
          if (d < minD) { minD = d; minI = c; }
        }
        clusters[minI].push(p);
      }
      for (let c = 0; c < centroids.length; c++) {
        const cl = clusters[c];
        if (cl.length === 0) continue;
        centroids[c] = [
          Math.round(cl.reduce((s, p) => s + p[0], 0) / cl.length),
          Math.round(cl.reduce((s, p) => s + p[1], 0) / cl.length),
          Math.round(cl.reduce((s, p) => s + p[2], 0) / cl.length),
        ];
      }
    }

    // Count pixels per centroid for percentages
    const counts = new Array(count).fill(0);
    for (const p of pixels) {
      let minD = Infinity, minI = 0;
      for (let c = 0; c < centroids.length; c++) {
        const d = dist(p, centroids[c]);
        if (d < minD) { minD = d; minI = c; }
      }
      counts[minI]++;
    }

    const toHex = (rgb: number[]) =>
      `#${rgb.map(v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

    const results = centroids
      .map((c, i) => ({ hex: toHex(c), pct: Math.round((counts[i] / pixels.length) * 100) }))
      .filter(r => r.pct > 0)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, count);

    setDominantColors(results);
    setExtracting(false);
  }, []);

  // Draw uploaded image onto hidden canvas for pixel sampling
  useEffect(() => {
    if (!eyedropperImage) return;
    const canvas = eyedropperCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      eyedropperImgRef.current = img;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      extractDominantColors(canvas, 5);
    };
    img.src = eyedropperImage;
  }, [eyedropperImage, extractDominantColors]);

  const sampleColorAt = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = eyedropperCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`.toUpperCase();
    return hex;
  };

  const handleEyedropperHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!eyedropperActive) return;
    const hex = sampleColorAt(e);
    if (hex) setHoveredColor(hex);
  };

  const handleEyedropperClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const hex = sampleColorAt(e);
    if (!hex) return;

    if (eyedropperActive) {
      // Add sampled color to the sampled list
      setSampledColors(prev => prev.includes(hex) ? prev : [...prev.slice(-9), hex]);
      // Also update the selected swatch
      updateSwatch(selectedIndex, hex);
      toast.success(`Sampled ${hex}`);
    }
  };

  const addSampledToSwatches = (hex: string) => {
    if (swatches.length >= 10) {
      toast.error('Maximum 10 swatches');
      return;
    }
    setSwatches(prev => [...prev, {
      id: `sampled-${Date.now()}`,
      hex,
      locked: false,
      name: 'Sampled',
    }]);
    setSelectedIndex(swatches.length);
    toast.success(`Added ${hex} to palette`);
  };

  const addAllSampled = () => {
    const available = 10 - swatches.length;
    if (available <= 0) { toast.error('Palette is full'); return; }
    const toAdd = sampledColors.slice(0, available);
    setSwatches(prev => [
      ...prev,
      ...toAdd.map((hex, i) => ({
        id: `sampled-${Date.now()}-${i}`,
        hex,
        locked: false,
        name: 'Sampled',
      })),
    ]);
    toast.success(`Added ${toAdd.length} colors`);
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
            <div className="hidden sm:flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={exportCSS} className="gap-1 h-8 text-xs rounded-r-none border-r-0">
                <Copy className="h-3 w-3" />
                CSS
              </Button>
              <Button variant="outline" size="sm" onClick={exportTailwind} className="gap-1 h-8 text-xs rounded-none border-r-0">
                Tailwind
              </Button>
              <Button variant="outline" size="sm" onClick={exportASE} className="gap-1 h-8 text-xs rounded-l-none">
                <Download className="h-3 w-3" />
                ASE
              </Button>
            </div>
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

                {/* Eyedropper / Image Sampler */}
                <div className="sm:col-span-2 border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-foreground flex items-center gap-2">
                      <Pipette className="h-3.5 w-3.5 text-primary" />
                      Eyedropper — Sample from Image
                    </h3>
                    <div className="flex items-center gap-2">
                      {eyedropperImage && (
                        <Button
                          variant={eyedropperActive ? 'default' : 'outline'}
                          size="sm"
                          className={cn("h-7 text-[10px] gap-1", eyedropperActive && "bg-primary")}
                          onClick={() => setEyedropperActive(!eyedropperActive)}
                        >
                          <Pipette className="h-3 w-3" />
                          {eyedropperActive ? 'Sampling…' : 'Pick Color'}
                        </Button>
                      )}
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <Upload className="h-3 w-3" />
                          {eyedropperImage ? 'Change' : 'Upload Image'}
                        </div>
                      </label>
                    </div>
                  </div>

                  {!eyedropperImage ? (
                    <label className="cursor-pointer block">
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-2 hover:border-primary/50 transition-colors">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                        <span className="text-xs text-muted-foreground">Drop a brand image or click to upload</span>
                        <span className="text-[10px] text-muted-foreground/60">PNG, JPG, SVG supported</span>
                      </div>
                    </label>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30">
                        <canvas
                          ref={eyedropperCanvasRef}
                          className={cn(
                            "w-full max-h-[200px] object-contain",
                            eyedropperActive ? "cursor-crosshair" : "cursor-default"
                          )}
                          style={{ imageRendering: 'auto' }}
                          onMouseMove={handleEyedropperHover}
                          onClick={handleEyedropperClick}
                        />
                        {/* Hovered color indicator */}
                        {eyedropperActive && hoveredColor && (
                          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1 border border-border shadow-sm">
                            <div className="w-5 h-5 rounded border border-border" style={{ backgroundColor: hoveredColor }} />
                            <span className="text-[10px] font-mono text-foreground">{hoveredColor}</span>
                          </div>
                        )}
                      </div>

                      {/* Dominant Colors */}
                      {(dominantColors.length > 0 || extracting) && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3 text-primary" />
                              {extracting ? 'Analyzing image…' : `Dominant Colors (${dominantColors.length})`}
                            </span>
                            {dominantColors.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px] px-2"
                                onClick={() => {
                                  const available = 10 - swatches.length;
                                  if (available <= 0) { toast.error('Palette is full'); return; }
                                  const toAdd = dominantColors.slice(0, available);
                                  setSwatches(prev => [
                                    ...prev,
                                    ...toAdd.map((c, i) => ({
                                      id: `dominant-${Date.now()}-${i}`,
                                      hex: c.hex,
                                      locked: false,
                                      name: `Dominant ${i + 1}`,
                                    })),
                                  ]);
                                  toast.success(`Added ${toAdd.length} dominant colors`);
                                }}
                              >
                                <Plus className="h-2.5 w-2.5 mr-0.5" />
                                Add All
                              </Button>
                            )}
                          </div>
                          {extracting ? (
                            <div className="flex gap-1.5">
                              {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
                              ))}
                            </div>
                          ) : (
                            <div className="flex gap-1.5">
                              {dominantColors.map((c, i) => (
                                <button
                                  key={`${c.hex}-${i}`}
                                  className="group/dom relative flex flex-col items-center gap-1"
                                  onClick={() => addSampledToSwatches(c.hex)}
                                  title={`${c.hex} (${c.pct}%) — click to add`}
                                >
                                  <div
                                    className="w-10 h-10 rounded-lg border border-border shadow-sm hover:ring-2 hover:ring-primary/50 transition-all"
                                    style={{ backgroundColor: c.hex }}
                                  >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/dom:opacity-100 transition-opacity bg-background/40 rounded-lg">
                                      <Plus className="h-3 w-3 text-foreground" />
                                    </div>
                                  </div>
                                  <span className="text-[8px] text-muted-foreground font-mono">{c.pct}%</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sampled Colors */}
                      {sampledColors.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground font-medium">Sampled Colors ({sampledColors.length})</span>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={addAllSampled}>
                                <Plus className="h-2.5 w-2.5 mr-0.5" />
                                Add All
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => setSampledColors([])}>
                                <Trash2 className="h-2.5 w-2.5 mr-0.5" />
                                Clear
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {sampledColors.map((hex, i) => (
                              <button
                                key={`${hex}-${i}`}
                                className="group/sample relative w-8 h-8 rounded-lg border border-border shadow-sm hover:ring-2 hover:ring-primary/50 transition-all"
                                style={{ backgroundColor: hex }}
                                onClick={() => addSampledToSwatches(hex)}
                                title={`${hex} — click to add to palette`}
                              >
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/sample:opacity-100 transition-opacity bg-background/40 rounded-lg">
                                  <Plus className="h-3 w-3 text-foreground" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
