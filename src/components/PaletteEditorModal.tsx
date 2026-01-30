import React, { useState, useEffect } from 'react';
import type { GeneratedAsset, ColorInfo } from '../types';
import { getColorDetails } from '../services/geminiService';
import Spinner from './Spinner';

interface PaletteEditorModalProps {
  asset: GeneratedAsset;
  onClose: () => void;
  onOverwrite: (assetId: string, newContent: ColorInfo[]) => void;
  onSaveAsNew: (assetId: string, newContent: ColorInfo[]) => void;
}

const BLANK_COLOR: ColorInfo = { hex: '#FFFFFF', rgb: '', cmyk: '', hsv: '', pantone: '', name: 'New Color' };

const PaletteEditorModal: React.FC<PaletteEditorModalProps> = ({ asset, onClose, onOverwrite, onSaveAsNew }) => {
  const [localColors, setLocalColors] = useState<ColorInfo[]>([]);
  const [updatingColorIndex, setUpdatingColorIndex] = useState<number | null>(null);
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  useEffect(() => {
    setLocalColors(JSON.parse(JSON.stringify(asset.content as ColorInfo[] || [])));
  }, [asset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleHexChange = (index: number, newHex: string) => {
    const newColors = [...localColors];
    newColors[index].hex = newHex;
    setLocalColors(newColors);
  };

  const handleUpdateFromAI = async (index: number) => {
    setUpdatingColorIndex(index);
    const colorToUpdate = localColors[index];
    try {
      const details = await getColorDetails(colorToUpdate.hex);
      const newColors = [...localColors];
      newColors[index] = details;
      setLocalColors(newColors);
    } catch (e) {
      console.error("Failed to update color details", e);
      alert(`Could not fetch details for ${colorToUpdate.hex}`);
    } finally {
      setUpdatingColorIndex(null);
    }
  };

  const handleAddColor = () => {
    setLocalColors([...localColors, { ...BLANK_COLOR, hex: '#CCCCCC' }]);
  };

  const handleRemoveColor = (indexToRemove: number) => {
    setLocalColors(localColors.filter((_, index) => index !== indexToRemove));
  };

  const handleOverwrite = () => onOverwrite(asset.id, localColors);
  const handleSaveAsNew = () => onSaveAsNew(asset.id, localColors);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Edit: {asset.title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-grow p-6 overflow-y-auto space-y-4 custom-scrollbar">
          {localColors.map((color, index) => (
            <div key={index} className="flex items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-border">
              <div className="relative w-14 h-14 rounded-lg border border-border flex-shrink-0 shadow-inner" style={{ backgroundColor: color.hex }}>
                <input
                  type="color"
                  value={color.hex}
                  onChange={e => handleHexChange(index, e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-baseline gap-3 mb-1">
                  <input
                    type="text"
                    value={color.hex.toUpperCase()}
                    onChange={e => handleHexChange(index, e.target.value)}
                    className="bg-transparent font-mono text-lg text-foreground outline-none w-24 uppercase focus:border-b focus:border-primary"
                  />
                  <span className="text-xs text-muted-foreground font-mono truncate" title={color.cmyk}>{color.cmyk}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{color.name}</p>
              </div>
              <button
                onClick={() => handleUpdateFromAI(index)}
                disabled={updatingColorIndex === index}
                className="px-3 py-2 text-xs font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {updatingColorIndex === index ? <Spinner className="w-4 h-4" /> : 'Update Info'}
              </button>
              <button onClick={() => handleRemoveColor(index)} className="p-2 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={handleAddColor}
            className="w-full flex items-center justify-center gap-2 p-4 text-sm font-medium text-primary bg-primary/10 border border-dashed border-primary/30 rounded-xl hover:bg-primary/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Color
          </button>
        </div>

        <footer className="p-4 border-t border-border flex justify-end items-center gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          {showSaveOptions ? (
            <>
              <button onClick={() => setShowSaveOptions(false)} className="btn-secondary">Back</button>
              <button onClick={handleOverwrite} className="btn-secondary">Overwrite</button>
              <button onClick={handleSaveAsNew} className="btn-primary">Save as Copy</button>
            </>
          ) : (
            <button onClick={() => setShowSaveOptions(true)} className="btn-primary">Save Palette</button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default PaletteEditorModal;
