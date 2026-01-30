import React, { useState, useCallback, useMemo, useRef } from 'react';
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
  onOpenQRCodeGenerator,
  onGenerateVariations,
  setMasterPatternImage
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
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s ? 'bg-fuchsia-600 text-white' : 'bg-white/10 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 3 && <div className={`w-16 h-1 mx-2 rounded ${step > s ? 'bg-fuchsia-600' : 'bg-white/10'}`}></div>}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Event Details */}
      {step === 1 && (
        <div className="card-style p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Tell us about your event</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Event Name *</label>
              <input
                type="text"
                value={eventDetails.name}
                onChange={(e) => setEventDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Tech Summit 2025"
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={eventDetails.description}
                onChange={(e) => setEventDetails(prev => ({ ...prev, description: e.target.value }))}
                placeholder="A premier technology conference..."
                rows={3}
                className="glass-input resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  value={eventDetails.date}
                  onChange={(e) => setEventDetails(prev => ({ ...prev, date: e.target.value }))}
                  className="glass-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={eventDetails.location}
                  onChange={(e) => setEventDetails(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="San Francisco, CA"
                  className="glass-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                <input
                  type="url"
                  value={eventDetails.website}
                  onChange={(e) => setEventDetails(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                  className="glass-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
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
        <div className="card-style p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Upload your logo</h2>
          
          <input
            type="file"
            ref={logoInputRef}
            accept="image/*"
            multiple
            onChange={handleLogoUpload}
            className="hidden"
          />
          
          <div
            onClick={() => logoInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-fuchsia-500/50 hover:bg-white/5 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-300 mb-2">Click to upload or drag and drop</p>
            <p className="text-gray-500 text-sm">PNG, JPG, SVG up to 10MB</p>
          </div>

          {logos.length > 0 && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {logos.map(logo => (
                <div key={logo.id} className="relative group">
                  <img src={logo.url} alt={logo.name} className="w-full h-32 object-contain bg-white/5 rounded-lg p-2" />
                  <button
                    onClick={() => handleRemoveLogo(logo.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <button onClick={onOpenLogoGenerator} className="btn-secondary flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Logo with AI
            </button>
          </div>

          {/* Style Reference */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Style Reference (Optional)</h3>
            <input
              type="file"
              ref={styleInputRef}
              accept="image/*"
              onChange={handleStyleUpload}
              className="hidden"
            />
            {styleImage ? (
              <div className="relative inline-block">
                <img src={styleImage.url} alt="Style reference" className="h-32 rounded-lg" />
                <button
                  onClick={() => setStyleImage(null)}
                  className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="card-style p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Select assets to generate</h2>
          
          {/* Presets */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => handlePresetSelect('small')} className="btn-secondary text-sm">Small Event</button>
            <button onClick={() => handlePresetSelect('medium')} className="btn-secondary text-sm">Medium Event</button>
            <button onClick={() => handlePresetSelect('large')} className="btn-secondary text-sm">Large Event</button>
            <button onClick={() => setSelectedAssets(new Set())} className="btn-tertiary text-sm">Clear All</button>
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
                        className={`p-2 rounded-lg text-sm text-left transition-all ${
                          selectedAssets.has(type)
                            ? 'bg-fuchsia-600 text-white'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
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

          <p className="text-gray-400 text-sm mt-4">{selectedAssets.size} assets selected</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={onGenerate}
            disabled={!canProceed || isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? <Spinner className="mr-2" /> : null}
            Generate Design Kit
          </button>
        )}
      </div>
    </div>
  );
};

export default LogoUploader;
