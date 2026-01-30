import React, { useState, useEffect, useCallback } from 'react';
import type { GeneratedAsset } from '../types';
import { refineText } from '../services/geminiService';
import Spinner from './Spinner';

interface TextListEditorModalProps {
  asset: GeneratedAsset;
  onClose: () => void;
  onOverwrite: (assetId: string, newContent: string[]) => void;
  onSaveAsNew: (assetId: string, newContent: string[]) => void;
}

const TextListEditorModal: React.FC<TextListEditorModalProps> = ({ asset, onClose, onOverwrite, onSaveAsNew }) => {
  const [items, setItems] = useState<string[]>([]);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [refiningIndex, setRefiningIndex] = useState<number | null>(null);

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

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newItems = [...items];
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(dragOverIndex, 0, removed);
      setItems(newItems);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // AI refinement for individual items
  const handleRefineItem = async (index: number, instruction: string) => {
    if (!items[index]?.trim()) return;
    setRefiningIndex(index);
    try {
      const result = await refineText(items[index], instruction);
      const newItems = [...items];
      newItems[index] = result;
      setItems(newItems);
    } catch (e) {
      console.error("Refinement failed", e);
    } finally {
      setRefiningIndex(null);
    }
  };

  // Duplicate item
  const handleDuplicateItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index + 1, 0, items[index]);
    setItems(newItems);
  };

  const handleOverwrite = () => onOverwrite(asset.id, items.filter(item => item.trim()));
  const handleSaveAsNew = () => onSaveAsNew(asset.id, items.filter(item => item.trim()));

  if (!asset) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Edit: {asset.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">Drag items to reorder • {items.length} items</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-grow p-6 overflow-y-auto space-y-3 custom-scrollbar">
          {items.map((item, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group flex items-start gap-3 bg-secondary/30 p-4 rounded-xl border transition-all ${
                draggedIndex === index 
                  ? 'opacity-50 border-primary' 
                  : dragOverIndex === index 
                    ? 'border-primary border-dashed' 
                    : 'border-border hover:border-primary/50'
              }`}
            >
              {/* Drag handle */}
              <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground pt-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>

              {/* Number badge */}
              <span className="flex-shrink-0 w-7 h-7 mt-2 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                {index + 1}
              </span>

              {/* Content area */}
              <div className="flex-1 min-w-0">
                <textarea
                  value={item}
                  onChange={e => handleItemChange(index, e.target.value)}
                  rows={2}
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-3 focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all resize-y"
                  placeholder={`Item ${index + 1}`}
                />

                {/* AI refinement buttons */}
                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {refiningIndex === index ? (
                    <Spinner className="w-4 h-4 text-primary" />
                  ) : (
                    <>
                      <button
                        onClick={() => handleRefineItem(index, 'Make it shorter and more concise')}
                        className="text-xs px-2 py-1 text-muted-foreground hover:text-primary bg-secondary/50 rounded-md transition-colors"
                      >
                        Shorten
                      </button>
                      <button
                        onClick={() => handleRefineItem(index, 'Make the tone more professional')}
                        className="text-xs px-2 py-1 text-muted-foreground hover:text-primary bg-secondary/50 rounded-md transition-colors"
                      >
                        Professional
                      </button>
                      <button
                        onClick={() => handleRefineItem(index, 'Make the tone exciting and energetic')}
                        className="text-xs px-2 py-1 text-muted-foreground hover:text-primary bg-secondary/50 rounded-md transition-colors"
                      >
                        Energetic
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  title="Move up"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === items.length - 1}
                  className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  title="Move down"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDuplicateItem(index)}
                  className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                  title="Duplicate"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
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
            <button onClick={() => setShowSaveOptions(true)} className="btn-primary flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default TextListEditorModal;
