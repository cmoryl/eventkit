import { useEffect, useState, useCallback, useRef } from 'react';

// Track loaded fonts globally to avoid duplicate loads
const loadedFonts = new Set<string>();
const loadingFonts = new Map<string, Promise<void>>();

/**
 * Hook to dynamically load Google Fonts
 */
export const useGoogleFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState<Set<string>>(new Set(loadedFonts));

  const loadFont = useCallback(async (fontName: string, weights: string = '400;600;700'): Promise<void> => {
    if (!fontName) return;
    
    const fontKey = `${fontName}:${weights}`;
    
    // Already loaded
    if (loadedFonts.has(fontKey)) {
      return;
    }
    
    // Currently loading - wait for it
    if (loadingFonts.has(fontKey)) {
      return loadingFonts.get(fontKey);
    }
    
    // Start loading
    const loadPromise = new Promise<void>((resolve, reject) => {
      const linkId = `google-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
      
      // Check if link already exists
      if (document.getElementById(linkId)) {
        loadedFonts.add(fontKey);
        setFontsLoaded(new Set(loadedFonts));
        resolve();
        return;
      }
      
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@${weights}&display=swap`;
      
      link.onload = () => {
        loadedFonts.add(fontKey);
        loadingFonts.delete(fontKey);
        setFontsLoaded(new Set(loadedFonts));
        resolve();
      };
      
      link.onerror = () => {
        loadingFonts.delete(fontKey);
        reject(new Error(`Failed to load font: ${fontName}`));
      };
      
      document.head.appendChild(link);
    });
    
    loadingFonts.set(fontKey, loadPromise);
    return loadPromise;
  }, []);

  const loadFonts = useCallback(async (fonts: string[], weights: string = '400;600;700'): Promise<void> => {
    await Promise.all(fonts.map(font => loadFont(font, weights)));
  }, [loadFont]);

  const isFontLoaded = useCallback((fontName: string): boolean => {
    return Array.from(loadedFonts).some(key => key.startsWith(`${fontName}:`));
  }, [fontsLoaded]);

  return { loadFont, loadFonts, isFontLoaded, fontsLoaded };
};

/**
 * Component that preloads fonts on mount
 */
export const useFontPreloader = (fonts: string[]) => {
  const { loadFonts, isFontLoaded } = useGoogleFonts();
  const [isLoading, setIsLoading] = useState(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || fonts.length === 0) return;
    loadedRef.current = true;
    
    setIsLoading(true);
    loadFonts(fonts)
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [fonts, loadFonts]);

  return { isLoading, isFontLoaded };
};

export default useGoogleFonts;
