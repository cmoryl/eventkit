import React from 'react';

interface StudioHeaderProps {
  eventName: string;
  assetCount: number;
  onBackToSetup: () => void;
  onDownloadAll: () => void;
  onSave: () => void;
  isExporting?: boolean;
}

const StudioHeader: React.FC<StudioHeaderProps> = ({
  eventName,
  assetCount,
  onBackToSetup,
  onDownloadAll,
  onSave,
  isExporting,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back + Event Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToSetup}
              className="btn-ghost"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Setup
            </button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-lg font-bold text-foreground">{eventName || 'Your Event'}</h1>
              <p className="text-sm text-muted-foreground">
                {assetCount} asset{assetCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onSave}
              disabled={isExporting}
              className="btn-secondary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Project
            </button>
            <button
              onClick={onDownloadAll}
              disabled={assetCount === 0}
              className="btn-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download All
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudioHeader;
