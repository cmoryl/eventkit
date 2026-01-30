import React, { useState, useEffect } from 'react';
import type { GeneratedAsset } from '../types';
import { refineText } from '../services/geminiService';
import Spinner from './Spinner';

interface TextEditorModalProps {
  asset: GeneratedAsset;
  onClose: () => void;
  onOverwrite: (assetId: string, newContent: string) => void;
  onSaveAsNew: (assetId: string, newContent: string) => void;
}

const TextEditorModal: React.FC<TextEditorModalProps> = ({ asset, onClose, onOverwrite, onSaveAsNew }) => {
  const [textContent, setTextContent] = useState('');
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    if (asset && typeof asset.content === 'string') {
      setTextContent(asset.content);
    }
  }, [asset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleOverwrite = () => onOverwrite(asset.id, textContent);
  const handleSaveAsNew = () => onSaveAsNew(asset.id, textContent);

  const handleSmartRefine = async (instruction: string) => {
    if (!textContent.trim()) return;
    setIsRefining(true);
    try {
      const result = await refineText(textContent, instruction);
      setTextContent(result);
    } catch (e) {
      console.error("Text refinement failed", e);
      alert("Could not refine text. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };

  if (!asset) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Edit: {asset.title}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`p-2 rounded-lg hover:bg-secondary transition-colors ${isPreviewMode ? 'text-primary' : 'text-muted-foreground'}`} title={isPreviewMode ? "Edit Mode" : "Preview Mode"}>
              {isPreviewMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {/* AI Tools Toolbar */}
        {!isPreviewMode && (
          <div className="flex items-center gap-2 p-3 bg-secondary/30 border-b border-border overflow-x-auto custom-scrollbar">
            <span className="text-xs font-bold text-primary uppercase mr-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI:
            </span>
            <button onClick={() => handleSmartRefine("Make it shorter and more concise")} disabled={isRefining} className="btn-tertiary text-xs py-1.5 px-3 whitespace-nowrap bg-secondary/50 rounded-lg hover:bg-secondary">Shorten</button>
            <button onClick={() => handleSmartRefine("Expand on this with more detail")} disabled={isRefining} className="btn-tertiary text-xs py-1.5 px-3 whitespace-nowrap bg-secondary/50 rounded-lg hover:bg-secondary">Expand</button>
            <button onClick={() => handleSmartRefine("Make the tone more professional and corporate")} disabled={isRefining} className="btn-tertiary text-xs py-1.5 px-3 whitespace-nowrap bg-secondary/50 rounded-lg hover:bg-secondary">Professional</button>
            <button onClick={() => handleSmartRefine("Make the tone exciting and energetic")} disabled={isRefining} className="btn-tertiary text-xs py-1.5 px-3 whitespace-nowrap bg-secondary/50 rounded-lg hover:bg-secondary">Exciting</button>
            <button onClick={() => handleSmartRefine("Fix grammar and spelling errors")} disabled={isRefining} className="btn-tertiary text-xs py-1.5 px-3 whitespace-nowrap bg-secondary/50 rounded-lg hover:bg-secondary">Fix Grammar</button>
            {isRefining && <Spinner className="w-4 h-4 text-primary ml-auto" />}
          </div>
        )}

        <div className="flex-grow p-0 overflow-hidden flex flex-col">
          {isPreviewMode ? (
            <div className="w-full h-full p-6 overflow-y-auto bg-secondary/20 text-foreground custom-scrollbar">
              {textContent.split('\n').map((line, i) => (
                <p key={i} className="mb-2 min-h-[1.5em] leading-relaxed">{line || '\u00A0'}</p>
              ))}
            </div>
          ) : (
            <textarea
              value={textContent}
              onChange={e => setTextContent(e.target.value)}
              className="w-full h-full bg-transparent text-foreground font-mono text-sm p-6 focus:ring-0 outline-none resize-none leading-relaxed custom-scrollbar"
              placeholder="Enter text here..."
              spellCheck={false}
            />
          )}
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

export default TextEditorModal;
