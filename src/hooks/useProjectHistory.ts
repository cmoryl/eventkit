import { useState, useCallback, useRef } from 'react';
import type { EventDetails, GeneratedAsset, AssetFolder, ColorInfo, LogoAsset } from '../types';

interface ProjectState {
  eventDetails: EventDetails;
  generatedAssets: GeneratedAsset[];
  logos: LogoAsset[];
  styleDescription: string;
  colorPalette: ColorInfo[];
  folders: AssetFolder[];
}

export const useProjectHistory = (
  currentState: ProjectState,
  onRestore: (state: ProjectState) => void
) => {
  const [history, setHistory] = useState<ProjectState[]>([]);
  const [future, setFuture] = useState<ProjectState[]>([]);

  const lastSavedHash = useRef<string>(JSON.stringify({
    ...currentState,
    logos: currentState.logos.map(l => ({ id: l.id, name: l.name }))
  }));

  const pushSnapshot = useCallback(() => {
    const currentHash = JSON.stringify({
      ...currentState,
      logos: currentState.logos.map(l => ({ id: l.id, name: l.name }))
    });

    if (currentHash === lastSavedHash.current) return;

    setHistory(prev => {
      const snapshot = structuredClone(currentState);
      const newHistory = [...prev, snapshot];
      if (newHistory.length > 20) return newHistory.slice(newHistory.length - 20);
      return newHistory;
    });
    setFuture([]);
    lastSavedHash.current = currentHash;
  }, [currentState]);

  const undo = useCallback(() => {
    if (history.length === 0) return;

    const previous = history[history.length - 1];
    const newHistory = history.slice(0, history.length - 1);

    setFuture(prev => [structuredClone(currentState), ...prev]);
    setHistory(newHistory);

    onRestore(previous);

    lastSavedHash.current = JSON.stringify({
      ...previous,
      logos: previous.logos.map(l => ({ id: l.id, name: l.name }))
    });
  }, [history, currentState, onRestore]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setHistory(prev => [...prev, structuredClone(currentState)]);
    setFuture(newFuture);

    onRestore(next);

    lastSavedHash.current = JSON.stringify({
      ...next,
      logos: next.logos.map(l => ({ id: l.id, name: l.name }))
    });
  }, [future, currentState, onRestore]);

  return {
    pushSnapshot,
    undo,
    redo,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
  };
};
