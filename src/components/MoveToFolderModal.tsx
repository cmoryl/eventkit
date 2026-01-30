import React, { useState, useEffect } from 'react';
import type { AssetFolder } from '../types';

interface MoveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: AssetFolder[];
  onMove: (folderId?: string) => void;
  onCreateFolder: (name: string) => void;
}

const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({ isOpen, onClose, folders, onMove, onCreateFolder }) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewFolderName('');
      setIsCreating(false);
    }
  }, [isOpen]);

  const handleCreate = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Move to Folder</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2 custom-scrollbar">
          <button onClick={() => onMove(undefined)} className="w-full text-left p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 text-muted-foreground flex items-center transition-colors">
            <span className="mr-3 text-lg">⊘</span> No Folder (General)
          </button>

          {folders.map(folder => (
            <button key={folder.id} onClick={() => onMove(folder.id)} className="w-full text-left p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 text-foreground flex items-center transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {folder.name}
            </button>
          ))}

          {isCreating ? (
            <div className="mt-4 p-4 bg-secondary/30 rounded-xl border border-border">
              <input
                type="text"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="Folder Name"
                className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground mb-3 focus:outline-none focus:border-primary"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsCreating(false)} className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5">Cancel</button>
                <button onClick={handleCreate} disabled={!newFolderName.trim()} className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">Create</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsCreating(true)} className="w-full text-left p-3 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground flex items-center justify-center mt-3 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Folder
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoveToFolderModal;
