import React, { useRef } from 'react';
import Spinner from './Spinner';

interface AppHeaderProps {
  onNewProject: () => void;
  onLoadProject: (file: File) => void;
  onSaveProject: () => void;
  isSaveDisabled: boolean;
  isExporting: boolean;
  showDashboardControls: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  onNewProject,
  onLoadProject,
  onSaveProject,
  isSaveDisabled,
  isExporting,
  showDashboardControls,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  const loadProjectInputRef = useRef<HTMLInputElement>(null);

  const handleLoadClick = () => {
    loadProjectInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onLoadProject(e.target.files[0]);
    }
    e.target.value = '';
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-lg border-b border-white/10 z-50 p-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white hidden sm:block">Event Design Kit Generator</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {showDashboardControls && (
          <>
            <button onClick={onUndo} disabled={!canUndo} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Undo (Ctrl+Z)">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8A5 5 0 009 5H7" />
              </svg>
            </button>
            <button onClick={onRedo} disabled={!canRedo} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Redo (Ctrl+Y)">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8a5 5 0 015-5h2" />
              </svg>
            </button>
            <div className="w-px h-6 bg-white/10 hidden sm:block"></div>
          </>
        )}
        <input
          type="file"
          ref={loadProjectInputRef}
          accept=".zip"
          onChange={handleFileChange}
          className="hidden"
        />
        <button onClick={handleLoadClick} className="btn-secondary text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span className="hidden sm:inline">Load</span>
        </button>
        <button onClick={onSaveProject} disabled={isSaveDisabled} className="btn-primary text-sm flex items-center">
          {isExporting ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span className="hidden sm:inline">Save</span>
            </>
          )}
        </button>
        <button onClick={onNewProject} className="btn-tertiary text-sm hidden sm:block">New</button>
      </div>
    </header>
  );
};

export default AppHeader;
