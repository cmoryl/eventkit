import React from 'react';
import { AssetType } from '../../types';

interface StepTwoProps {
  selectedAssets: Set<AssetType>;
  setSelectedAssets: React.Dispatch<React.SetStateAction<Set<AssetType>>>;
  styleDescription: string;
  setStyleDescription: React.Dispatch<React.SetStateAction<string>>;
}

const assetCategories = [
  {
    name: 'Essentials',
    description: 'Core branding elements',
    icon: '✨',
    assets: [
      { type: AssetType.Palette, label: 'Color Palette', icon: '🎨' },
      { type: AssetType.Slogans, label: 'Slogans', icon: '💬' },
      { type: AssetType.MarketingCopy, label: 'Marketing Copy', icon: '📝' },
    ],
  },
  {
    name: 'Social Media',
    description: 'Digital marketing assets',
    icon: '📱',
    assets: [
      { type: AssetType.SocialPost, label: 'Social Post', icon: '📱' },
      { type: AssetType.SocialStory, label: 'Story', icon: '📲' },
      { type: AssetType.EmailHeader, label: 'Email Header', icon: '✉️' },
    ],
  },
  {
    name: 'Print & Signage',
    description: 'Physical event materials',
    icon: '🖼️',
    assets: [
      { type: AssetType.Banner, label: 'Banner', icon: '🏷️' },
      { type: AssetType.NameTag, label: 'Name Tag', icon: '📛' },
      { type: AssetType.EventSignage, label: 'Signage', icon: '🪧' },
      { type: AssetType.WifiSign, label: 'Wi-Fi Sign', icon: '📶' },
    ],
  },
  {
    name: 'Merchandise',
    description: 'Branded swag items',
    icon: '👕',
    assets: [
      { type: AssetType.Tshirt, label: 'T-Shirt', icon: '👕' },
      { type: AssetType.Lanyard, label: 'Lanyard', icon: '🎫' },
      { type: AssetType.SwagBag, label: 'Swag Bag', icon: '👜' },
    ],
  },
  {
    name: 'Planning',
    description: 'Event organization',
    icon: '📋',
    assets: [
      { type: AssetType.RunOfShow, label: 'Run of Show', icon: '📋' },
      { type: AssetType.AgendaHighlights, label: 'Agenda', icon: '📅' },
    ],
  },
];

const StepTwo: React.FC<StepTwoProps> = ({
  selectedAssets,
  setSelectedAssets,
  styleDescription,
  setStyleDescription,
}) => {
  const toggleAsset = (type: AssetType) => {
    setSelectedAssets(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const selectAll = () => {
    const allAssets = assetCategories.flatMap(c => c.assets.map(a => a.type));
    setSelectedAssets(new Set(allAssets));
  };

  const clearAll = () => {
    setSelectedAssets(new Set());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">Choose Your Assets</h2>
        <p className="text-sm text-muted-foreground">Select what to include in your design kit</p>
      </div>

      {/* Quick actions */}
      <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-secondary/50">
        <span className="text-sm font-medium text-foreground">
          {selectedAssets.size} asset{selectedAssets.size !== 1 ? 's' : ''} selected
        </span>
        <div className="flex gap-3">
          <button onClick={selectAll} className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            Select all
          </button>
          <span className="text-border">|</span>
          <button onClick={clearAll} className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* Asset categories */}
      <div className="space-y-3 max-h-[35vh] overflow-y-auto custom-scrollbar pr-2">
        {assetCategories.map(category => (
          <div key={category.name} className="category-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{category.icon}</span>
                <div>
                  <h3 className="font-medium text-foreground">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const categoryTypes = category.assets.map(a => a.type);
                  const allSelected = categoryTypes.every(t => selectedAssets.has(t));
                  setSelectedAssets(prev => {
                    const next = new Set(prev);
                    categoryTypes.forEach(t => {
                      if (allSelected) next.delete(t);
                      else next.add(t);
                    });
                    return next;
                  });
                }}
                className="text-xs text-primary hover:text-primary/80 font-medium px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
              >
                {category.assets.every(a => selectedAssets.has(a.type)) ? 'Deselect' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {category.assets.map(asset => (
                <button
                  key={asset.type}
                  onClick={() => toggleAsset(asset.type)}
                  className={`asset-chip ${selectedAssets.has(asset.type) ? 'selected' : ''}`}
                >
                  <span className="text-sm">{asset.icon}</span>
                  <span>{asset.label}</span>
                  {selectedAssets.has(asset.type) && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Style description */}
      <div className="pt-4 border-t border-border/50">
        <label className="block text-sm font-medium text-foreground mb-2">
          Style Notes <span className="text-muted-foreground font-normal text-xs">(optional)</span>
        </label>
        <textarea
          value={styleDescription}
          onChange={e => setStyleDescription(e.target.value)}
          placeholder="e.g., Modern and minimalist, use blue tones, tech-focused..."
          rows={2}
          className="input-field resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Describe the visual style you want for your assets
        </p>
      </div>
    </div>
  );
};

export default StepTwo;
