import React from 'react';
import type { GeneratedAsset } from '../types';

interface GenerationLoaderProps {
  current: number;
  total: number;
  assets?: GeneratedAsset[];
}

const GenerationLoader: React.FC<GenerationLoaderProps> = ({ current, total, assets }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="fixed inset-0 bg-background/98 backdrop-blur-2xl flex flex-col items-center justify-center z-[100] animate-fade-in p-8">
      <div className="flex flex-col items-center flex-shrink-0 mb-10">
        {/* Progress Ring */}
        <div className="relative w-52 h-52 flex items-center justify-center mb-8">
          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 256 256">
            {/* Background ring */}
            <circle
              className="text-secondary"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              r="90"
              cx="128"
              cy="128"
            />
            {/* Progress ring */}
            <circle
              className="text-primary transition-all duration-500 ease-out"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              fill="transparent"
              r="90"
              cx="128"
              cy="128"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset,
              }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-36 rounded-full bg-primary/10 shadow-[0_0_40px_rgba(var(--primary),0.2)] animate-pulse-inner flex items-center justify-center">
              <span className="text-5xl font-bold text-foreground tracking-tight">
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2">Generating your design kit</h2>
        <p className="text-muted-foreground">
          {current} of {total} assets completed
        </p>
      </div>

      {/* Asset status grid */}
      {assets && assets.length > 0 && (
        <div className="w-full max-w-3xl overflow-y-auto max-h-[35vh] custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {assets.filter(a => a.isLoading || a.content).map((asset) => (
              <div
                key={asset.id}
                className={`p-3 rounded-xl border transition-all ${
                  asset.isLoading
                    ? 'border-primary/50 bg-primary/10 animate-pulse'
                    : 'border-green-500/50 bg-green-500/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {asset.isLoading ? (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <p className="text-sm font-medium text-foreground truncate flex-1">{asset.title}</p>
                </div>
                <p className="text-xs text-muted-foreground pl-4">
                  {asset.isLoading ? 'Generating...' : 'Complete'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationLoader;
