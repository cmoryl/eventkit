import React, { useMemo, useRef } from 'react';
import { AssetType } from '../types';
import type { EventDetails } from '../types';
import Spinner from './Spinner';
import Accordion from './Accordion';
import { v4 as uuidv4 } from 'uuid';
import { ASSET_CATEGORIES } from '../utils';

interface LogoUploaderProps {
  eventDetails: EventDetails;
  setEventDetails: (details: EventDetails | ((prev: EventDetails) => EventDetails)) => void;
  logos: { id: string; file: File; url: string; name: string }[];
  setLogos: (logos: { id: string; file: File; url: string; name: string }[] | ((prev: { id: string; file: File; url: string; name: string }[]) => { id: string; file: File; url: string; name: string }[])) => void;
  styleImage: { file: File; url: string } | null;
  setStyleImage: (image: { file: File; url: string } | null) => void;
  selectedAssets: Set<AssetType>;
  setSelectedAssets: (assets: Set<AssetType> | ((prev: Set<AssetType>) => Set<AssetType>)) => void;
  onGenerate: () => void;
  isLoading: boolean;
  assetGenerators: { type: AssetType; title: string }[];
  step: number;
  setStep: (step: number) => void;
  onOpenLogoGenerator: () => void;
  onOpenQRCodeGenerator: () => void;
  onGenerateVariations: (id: string) => void;
  setMasterPatternImage: (file: File | null) => void;
}

const eventSizePresets = {
  small: new Set([AssetType.Slogans, AssetType.SocialPost, AssetType.NameTag, AssetType.WifiSign, AssetType.EmailHeader]),
  medium: new Set([AssetType.Slogans, AssetType.SocialPost, AssetType.NameTag, AssetType.WifiSign, AssetType.EmailHeader, AssetType.Banner, AssetType.Tshirt, AssetType.SwagBag, AssetType.AgendaHighlights, AssetType.Lanyard]),
  large: new Set([AssetType.Slogans, AssetType.SocialPost, AssetType.NameTag, AssetType.WifiSign, AssetType.EmailHeader, AssetType.Banner, AssetType.Tshirt, AssetType.SwagBag, AssetType.AgendaHighlights, AssetType.Lanyard, AssetType.HangingSignage, AssetType.OutdoorSignage, AssetType.BackWall, AssetType.Stairs, AssetType.PresentationSlide, AssetType.RoomSignage, AssetType.RegistrationCounter, AssetType.RegistrationBackWall, AssetType.TechnologyCounter, AssetType.Kiosk, AssetType.AppIcon, AssetType.Favicon, AssetType.SocialProfile, AssetType.LogoMonochrome]),
};

const LogoUploader: React.FC<LogoUploaderProps> = ({
  eventDetails,
  setEventDetails,
  logos,
  setLogos,
  styleImage,
  setStyleImage,
  selectedAssets,
  setSelectedAssets,
  onGenerate,
  isLoading,
  assetGenerators,
  step,
  setStep,
  onOpenLogoGenerator,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const styleInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newLogos = Array.from(e.target.files).map(file => ({
        id: uuidv4(),
        file,
        url: URL.createObjectURL(file),
        name: file.name
      }));
      setLogos(prev => [...prev, ...newLogos]);
    }
  };

  const handleStyleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStyleImage({ file, url: URL.createObjectURL(file) });
    }
  };

  const handleRemoveLogo = (id: string) => {
    setLogos(prev => prev.filter(l => l.id !== id));
  };

  const handleAssetSelect = (type: AssetType) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handlePresetSelect = (preset: 'small' | 'medium' | 'large') => {
    setSelectedAssets(new Set(eventSizePresets[preset]));
  };

  const canProceed = useMemo(() => {
    if (step === 1) return eventDetails.name.trim() !== '';
    if (step === 2) return logos.length > 0;
    if (step === 3) return selectedAssets.size > 0;
    return false;
  }, [step, eventDetails.name, logos.length, selectedAssets.size]);

  return (
    <div className="container mx-auto px-4 max-w-4xl animate-fade-in">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-10">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all shadow-lg ${
                step >= s 
                  ? 'bg-primary text-primary-foreground shadow-primary/30' 
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`w-20 h-1 mx-3 rounded-full transition-colors ${
                step > s ? 'bg-primary' : 'bg-secondary'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Event Details */}
      {step === 1 && (
        <div className="card-style p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Tell us about your event</h2>
          <p className="text-muted-foreground mb-8">We'll use this information to generate your design assets</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Event Name *</label>
              <input
                type="text"
                value={eventDetails.name}
                onChange={(e) => setEventDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Tech Summit 2025"
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={eventDetails.description}
                onChange={(e) => setEventDetails(prev => ({ ...prev, description: e.target.value }))}
                placeholder="A premier technology conference bringing together innovators and thought leaders..."
                rows={3}
                className="glass-input resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                <input
                  type="date"
                  value={eventDetails.date}
                  onChange={(e) => setEventDetails(prev => ({ ...prev, date: e.target.value }))}
                  className="glass-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                <input
                  type="text"
                  value={eventDetails.location}
                  onChange={(e) => setEventDetails(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="San Francisco, CA"
                  className="glass-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Website</label>
                <input
                  type="url"
                  value={eventDetails.website}
                  onChange={(e) => setEventDetails(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                  className="glass-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={eventDetails.email}
                  onChange={(e) => setEventDetails(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@event.com"
                  className="glass-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Upload Logo */}
      {step === 2 && (
        <div className="card-style p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Upload your logo</h2>
          <p className="text-muted-foreground mb-8">Your logo will be used across all generated assets</p>
          
          <input
            type="file"
            ref={logoInputRef}
            accept="image/*,.svg,image/svg+xml"
            multiple
            onChange={handleLogoUpload}
            className="hidden"
          />
          
          <div
            onClick={() => logoInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-foreground font-medium mb-2">Click to upload or drag and drop</p>
            <p className="text-muted-foreground text-sm">PNG, JPG, SVG up to 10MB</p>
          </div>

          {logos.length > 0 && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {logos.map(logo => (
                <div key={logo.id} className="relative group rounded-xl overflow-hidden bg-secondary/50 p-4">
                  <img src={logo.url} alt={logo.name} className="w-full h-28 object-contain" />
                  <button
                    onClick={() => handleRemoveLogo(logo.id)}
                    className="absolute top-2 right-2 p-1.5 bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-destructive-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <p className="text-xs text-muted-foreground mt-2 truncate text-center">{logo.name}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <button onClick={onOpenLogoGenerator} className="btn-secondary flex-1 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Logo with AI
            </button>
          </div>

          {/* Style Reference */}
          <div className="mt-10 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Style Reference</h3>
            <p className="text-muted-foreground text-sm mb-4">Upload an image to influence the visual style (optional)</p>
            
            <input
              type="file"
              ref={styleInputRef}
              accept="image/*,.svg,image/svg+xml"
              onChange={handleStyleUpload}
              className="hidden"
            />
            {styleImage ? (
              <div className="relative inline-block rounded-xl overflow-hidden">
                <img src={styleImage.url} alt="Style reference" className="h-32 rounded-xl" />
                <button
                  onClick={() => setStyleImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-destructive rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-destructive-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => styleInputRef.current?.click()}
                className="btn-secondary"
              >
                Upload Style Image
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Select Assets */}
      {step === 3 && (
        <div className="card-style p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Select assets to generate</h2>
          <p className="text-muted-foreground mb-8">Choose presets or pick individual items</p>
          
          {/* Presets */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button onClick={() => handlePresetSelect('small')} className="btn-secondary text-sm">
              🎯 Small Event
            </button>
            <button onClick={() => handlePresetSelect('medium')} className="btn-secondary text-sm">
              🎪 Medium Event
            </button>
            <button onClick={() => handlePresetSelect('large')} className="btn-secondary text-sm">
              🏟️ Large Event
            </button>
            <button onClick={() => setSelectedAssets(new Set())} className="btn-tertiary text-sm">
              Clear All
            </button>
          </div>

          {/* Asset Categories */}
          <div className="space-y-4">
            {Object.entries(ASSET_CATEGORIES).map(([category, types]) => (
              <Accordion key={category} title={`${category} (${types.filter(t => selectedAssets.has(t)).length}/${types.length})`}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {types.map(type => {
                    const gen = assetGenerators.find(g => g.type === type);
                    return (
                      <button
                        key={type}
                        onClick={() => handleAssetSelect(type)}
                        className={`p-3 rounded-lg text-sm text-left transition-all ${
                          selectedAssets.has(type)
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                            : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                      >
                        {gen?.title || type}
                      </button>
                    );
                  })}
                </div>
              </Accordion>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-foreground font-medium">{selectedAssets.size} assets selected</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={onGenerate}
            disabled={!canProceed || isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading && <Spinner className="mr-2 h-5 w-5" />}
            Generate Design Kit
          </button>
        )}
      </div>
    </div>
  );
};

export default LogoUploader;
