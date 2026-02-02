// Brand Theme Service - Dynamically applies brand colors to CSS variables
// when a brand is linked from BrandHub

import { toast } from 'sonner';

interface ColorInfo {
  hex: string;
  name?: string;
  usage?: string;
}

interface BrandThemeColors {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  color_palette?: ColorInfo[];
}

// Convert hex color to HSL format for CSS variables
export const hexToHSL = (hex: string): string => {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  const hDeg = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);
  
  return `${hDeg} ${sPercent}% ${lPercent}%`;
};

// Generate a darker variant of an HSL color
const darkenHSL = (hsl: string, amount: number): string => {
  const parts = hsl.split(' ');
  const h = parts[0];
  const s = parts[1];
  const l = parseInt(parts[2]);
  const newL = Math.max(0, l - amount);
  return `${h} ${s} ${newL}%`;
};

// Generate a lighter variant of an HSL color
const lightenHSL = (hsl: string, amount: number): string => {
  const parts = hsl.split(' ');
  const h = parts[0];
  const s = parts[1];
  const l = parseInt(parts[2]);
  const newL = Math.min(100, l + amount);
  return `${h} ${s} ${newL}%`;
};

// Check if color is dark (needs light foreground)
const isColorDark = (hsl: string): boolean => {
  const parts = hsl.split(' ');
  const l = parseInt(parts[2]);
  return l < 50;
};

// Apply brand theme colors to CSS variables
export const applyBrandTheme = (colors: BrandThemeColors, notify = true): void => {
  const root = document.documentElement;
  
  if (!colors.primary_color && !colors.secondary_color && !colors.accent_color) {
    console.log('No brand colors to apply');
    return;
  }
  
  // Store original values for potential reset
  const originalValues = {
    primary: getComputedStyle(root).getPropertyValue('--primary').trim(),
    secondary: getComputedStyle(root).getPropertyValue('--secondary').trim(),
    accent: getComputedStyle(root).getPropertyValue('--accent').trim(),
    ring: getComputedStyle(root).getPropertyValue('--ring').trim(),
  };
  
  // Save originals to sessionStorage for reset capability
  if (!sessionStorage.getItem('original-theme')) {
    sessionStorage.setItem('original-theme', JSON.stringify(originalValues));
  }
  
  // Apply primary color
  if (colors.primary_color) {
    const primaryHSL = hexToHSL(colors.primary_color);
    root.style.setProperty('--primary', primaryHSL);
    root.style.setProperty('--ring', primaryHSL);
    root.style.setProperty('--sidebar-primary', primaryHSL);
    root.style.setProperty('--sidebar-ring', primaryHSL);
    
    // Set foreground based on brightness
    const foreground = isColorDark(primaryHSL) ? '0 0% 100%' : '0 0% 0%';
    root.style.setProperty('--primary-foreground', foreground);
    root.style.setProperty('--sidebar-primary-foreground', foreground);
    
    console.log('Applied primary color:', colors.primary_color, '→', primaryHSL);
  }
  
  // Apply secondary color (or derive from primary)
  if (colors.secondary_color) {
    const secondaryHSL = hexToHSL(colors.secondary_color);
    // For secondary, we adjust for a subtler background use
    const parts = secondaryHSL.split(' ');
    const h = parts[0];
    // Reduce saturation and increase lightness for background use
    const adjustedSecondary = `${h} 14% 96%`;
    root.style.setProperty('--secondary', adjustedSecondary);
    root.style.setProperty('--sidebar-accent', adjustedSecondary);
    
    console.log('Applied secondary color:', colors.secondary_color, '→', adjustedSecondary);
  }
  
  // Apply accent color
  if (colors.accent_color) {
    const accentHSL = hexToHSL(colors.accent_color);
    root.style.setProperty('--accent', accentHSL);
    
    // Set foreground based on brightness
    const foreground = isColorDark(accentHSL) ? '0 0% 100%' : '0 0% 0%';
    root.style.setProperty('--accent-foreground', foreground);
    root.style.setProperty('--sidebar-accent-foreground', foreground);
    
    console.log('Applied accent color:', colors.accent_color, '→', accentHSL);
  }
  
  // Apply gradient backgrounds from palette
  if (colors.color_palette && colors.color_palette.length >= 2) {
    const gradientColors = colors.color_palette.slice(0, 3).map(c => c.hex);
    applyBrandGradients(gradientColors);
  } else if (colors.primary_color && colors.accent_color) {
    applyBrandGradients([colors.primary_color, colors.accent_color]);
  }
  
  // Store applied brand theme in sessionStorage
  sessionStorage.setItem('applied-brand-theme', JSON.stringify(colors));
  
  if (notify) {
    toast.success('Brand theme applied!', {
      description: 'UI colors updated to match your brand palette'
    });
  }
};

// Apply brand-based gradient backgrounds
const applyBrandGradients = (hexColors: string[]): void => {
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  
  if (hexColors.length < 2) return;
  
  // Convert to rgba for gradient use
  const hexToRgba = (hex: string, alpha: number): string => {
    hex = hex.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  // Build gradient CSS for soft-bg
  const color1 = hexToRgba(hexColors[0], isDark ? 0.15 : 0.08);
  const color2 = hexToRgba(hexColors[1], isDark ? 0.1 : 0.06);
  const color3 = hexColors[2] ? hexToRgba(hexColors[2], isDark ? 0.08 : 0.04) : color1;
  
  const baseGradient = isDark 
    ? `linear-gradient(180deg, hsl(240 15% 6%) 0%, hsl(240 15% 4%) 100%)`
    : `linear-gradient(180deg, hsl(210 20% 99%) 0%, hsl(220 20% 96%) 100%)`;
  
  const gradient = `
    radial-gradient(ellipse 100% 100% at 0% 0%, ${color1}, transparent 50%),
    radial-gradient(ellipse 80% 80% at 100% 0%, ${color2}, transparent 50%),
    radial-gradient(ellipse 60% 60% at 50% 100%, ${color3}, transparent 50%),
    ${baseGradient}
  `;
  
  // Find and update soft-bg elements
  const softBgElements = document.querySelectorAll('.soft-bg');
  softBgElements.forEach(el => {
    (el as HTMLElement).style.background = gradient;
  });
  
  // Also set CSS custom property for future elements
  root.style.setProperty('--brand-gradient-1', color1);
  root.style.setProperty('--brand-gradient-2', color2);
  root.style.setProperty('--brand-gradient-3', color3);
  
  console.log('Applied brand gradients');
};

// Reset theme to original values
export const resetBrandTheme = (notify = true): void => {
  const root = document.documentElement;
  const originalTheme = sessionStorage.getItem('original-theme');
  
  if (originalTheme) {
    try {
      const values = JSON.parse(originalTheme);
      
      // Reset CSS variables
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-foreground');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--sidebar-primary');
      root.style.removeProperty('--sidebar-primary-foreground');
      root.style.removeProperty('--sidebar-accent');
      root.style.removeProperty('--sidebar-accent-foreground');
      root.style.removeProperty('--sidebar-ring');
      root.style.removeProperty('--brand-gradient-1');
      root.style.removeProperty('--brand-gradient-2');
      root.style.removeProperty('--brand-gradient-3');
      
      // Reset soft-bg elements
      const softBgElements = document.querySelectorAll('.soft-bg');
      softBgElements.forEach(el => {
        (el as HTMLElement).style.background = '';
      });
      
      sessionStorage.removeItem('applied-brand-theme');
      
      if (notify) {
        toast.success('Theme reset to defaults');
      }
      
      console.log('Theme reset to original values');
    } catch (error) {
      console.error('Error resetting theme:', error);
    }
  }
};

// Check if a brand theme is currently applied
export const isBrandThemeApplied = (): boolean => {
  return sessionStorage.getItem('applied-brand-theme') !== null;
};

// Get the currently applied brand theme
export const getAppliedBrandTheme = (): BrandThemeColors | null => {
  const theme = sessionStorage.getItem('applied-brand-theme');
  if (theme) {
    try {
      return JSON.parse(theme);
    } catch {
      return null;
    }
  }
  return null;
};

// Initialize brand theme on page load (restores previously applied theme)
export const initializeBrandTheme = (): void => {
  const savedTheme = getAppliedBrandTheme();
  if (savedTheme) {
    // Re-apply without notification
    applyBrandTheme(savedTheme, false);
    console.log('Restored brand theme from session');
  }
};
