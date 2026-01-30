import React from 'react';
import type { AssetFolder } from '../types';

interface FolderTabsProps {
  folders: AssetFolder[];
  activeView: string;
  onSelectView: (viewId: string) => void;
  onCreateFolder: () => void;
}

const FolderTabs: React.FC<FolderTabsProps> = ({ folders, activeView, onSelectView, onCreateFolder }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar">
      <button
        onClick={() => onSelectView('all')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
          activeView === 'all' 
            ? 'bg-foreground text-background shadow-lg' 
            : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
        }`}
      >
        All Assets
      </button>
      
      <button
        onClick={() => onSelectView('favorites')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
          activeView === 'favorites' 
            ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' 
            : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
        Favorites
      </button>

      {folders.length > 0 && (
        <div className="w-px h-6 bg-border mx-1 flex-shrink-0" />
      )}

      {folders.map(folder => (
        <button
          key={folder.id}
          onClick={() => onSelectView(folder.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
            activeView === folder.id 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          {folder.name}
        </button>
      ))}

      <button
        onClick={onCreateFolder}
        className="px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground border border-dashed border-border"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Folder
      </button>
    </div>
  );
};

export default FolderTabs;
