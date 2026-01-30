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
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-xl flex flex-col items-center justify-center z-[100] animate-fade-in p-8">
      <div className="flex flex-col items-center flex-shrink-0 mb-8">
        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 256 256">
            <circle
              className="text-white/5"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              r="90"
              cx="128"
              cy="128"
            />
            <circle
              className="text-fuchsia-500 transition-all duration-500 ease-out"
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-36 rounded-full bg-fuchsia-500/10 shadow-[0_0_30px_rgba(217,70,239,0.2)] animate-pulse-inner flex items-center justify-center">
              <span className="text-4xl font-bold text-white tracking-tighter">
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Generating your design kit...</h2>
        <p className="text-gray-400">
          {current} of {total} assets completed
        </p>
      </div>

      {assets && assets.length > 0 && (
        <div className="w-full max-w-2xl overflow-y-auto max-h-[30vh] custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {assets.filter(a => a.isLoading || a.content).map((asset) => (
              <div
                key={asset.id}
                className={`p-3 rounded-lg border ${
                  asset.isLoading
                    ? 'border-fuchsia-500/50 bg-fuchsia-500/10 animate-pulse'
                    : 'border-green-500/50 bg-green-500/10'
                }`}
              >
                <p className="text-sm font-medium text-white truncate">{asset.title}</p>
                <p className="text-xs text-gray-400">{asset.isLoading ? 'Generating...' : 'Done'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationLoader;
