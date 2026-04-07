import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { MasterStyleDirection } from '@/services/masterStyleDirector';

interface StyleAnchorState {
  /** URL of the anchor image used as visual reference for consistency */
  anchorImageUrl: string | null;
  /** The asset type that was used as anchor */
  anchorAssetType: string | null;
  /** Cached master style direction for the current session */
  masterDirection: MasterStyleDirection | null;
  /** Whether the master direction has been generated this session */
  hasMasterDirection: boolean;
}

interface StyleAnchorContextValue extends StyleAnchorState {
  setAnchorImage: (url: string, assetType: string) => void;
  clearAnchor: () => void;
  setMasterDirection: (direction: MasterStyleDirection) => void;
  clearAll: () => void;
}

const StyleAnchorContext = createContext<StyleAnchorContextValue | null>(null);

export const StyleAnchorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StyleAnchorState>({
    anchorImageUrl: null,
    anchorAssetType: null,
    masterDirection: null,
    hasMasterDirection: false,
  });

  const setAnchorImage = useCallback((url: string, assetType: string) => {
    setState(prev => ({ ...prev, anchorImageUrl: url, anchorAssetType: assetType }));
  }, []);

  const clearAnchor = useCallback(() => {
    setState(prev => ({ ...prev, anchorImageUrl: null, anchorAssetType: null }));
  }, []);

  const setMasterDirection = useCallback((direction: MasterStyleDirection) => {
    setState(prev => ({ ...prev, masterDirection: direction, hasMasterDirection: true }));
  }, []);

  const clearAll = useCallback(() => {
    setState({
      anchorImageUrl: null,
      anchorAssetType: null,
      masterDirection: null,
      hasMasterDirection: false,
    });
  }, []);

  return (
    <StyleAnchorContext.Provider value={{ ...state, setAnchorImage, clearAnchor, setMasterDirection, clearAll }}>
      {children}
    </StyleAnchorContext.Provider>
  );
};

export const useStyleAnchor = () => {
  const ctx = useContext(StyleAnchorContext);
  if (!ctx) {
    // Return a no-op fallback so components work outside the provider
    return {
      anchorImageUrl: null,
      anchorAssetType: null,
      masterDirection: null,
      hasMasterDirection: false,
      setAnchorImage: () => {},
      clearAnchor: () => {},
      setMasterDirection: () => {},
      clearAll: () => {},
    } as StyleAnchorContextValue;
  }
  return ctx;
};
