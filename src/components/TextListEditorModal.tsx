import React, { useState, useEffect } from 'react';
import type { GeneratedAsset } from '../types';

interface TextListEditorModalProps {
  asset: GeneratedAsset;
  onClose: () => void;
  onOverwrite: (assetId: string, newContent: string[]) => void;
  onSaveAsNew: (assetId: string, newContent: string[]) => void;
}

const TextListEditorModal: React.FC<TextListEditorModalProps> = ({ asset, onClose, onOverwrite, onSaveAsNew }) => {
  const [items, setItems] = useState<string[]>([]);
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  useEffect(() => {
    if (asset && Array.isArray(asset.content)) {
      setItems([...asset.content] as string[]);
    }
  }, [asset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleAddItem = () => setItems([...items, '']);

  const handleRemoveItem = (indexToRemove: number) => {
    setItems(items.filter((_, index) => index !== indexToRemove));
  };

  const handleOverwrite = () => onOverwrite(asset.id, items.filter(item => item.trim()));
  const handleSaveAsNew = () => onSaveAsNew(asset.id, items.filter(item => item.trim()));

  if (!asset) return null;

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
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 mt-3 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <textarea
                value={item}
                onChange={e => handleItemChange(index, e.target.value)}
                rows={2}
                className="flex-1 bg-secondary/50 border border-border text-foreground rounded-lg p-3 focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all resize-y"
                placeholder={`Item ${index + 1}`}
              />
              <button onClick={() => handleRemoveItem(index)} className="p-2 mt-2 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={handleAddItem}
            className="w-full flex items-center justify-center gap-2 p-4 text-sm font-medium text-primary bg-primary/10 border border-dashed border-primary/30 rounded-xl hover:bg-primary/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Item
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
            <button onClick={() => setShowSaveOptions(true)} className="btn-primary">Save Changes</button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default TextListEditorModal;
