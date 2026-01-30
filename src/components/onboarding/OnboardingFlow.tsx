import React, { useState } from 'react';
import type { EventDetails, LogoAsset } from '../../types';
import { AssetType } from '../../types';
import { DEFAULT_QUICK_START_ASSETS, FULL_SUITE_ASSETS } from '../../config/assetConfig';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import { Sparkles, Palette, Layers } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (data: {
    eventDetails: EventDetails;
    logos: LogoAsset[];
    selectedAssets: Set<AssetType>;
    styleDescription: string;
    vibeImage: File | null;
    masterPattern: File | null;
  }) => void;
}

const STEPS = [
  { number: 1, label: 'Event Details', icon: Sparkles },
  { number: 2, label: 'Style & Vibe', icon: Palette },
  { number: 3, label: 'Select Assets', icon: Layers },
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    name: '',
    description: '',
    date: '',
    location: '',
    website: '',
    email: '',
    incorporateLocationStyle: false,
  });
  const [logos, setLogos] = useState<LogoAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Set<AssetType>>(
    new Set(DEFAULT_QUICK_START_ASSETS)
  );
  const [styleDescription, setStyleDescription] = useState('');
  const [vibeImage, setVibeImage] = useState<File | null>(null);
  const [masterPattern, setMasterPattern] = useState<File | null>(null);

  const isStep1Valid = eventDetails.name.trim().length > 0;
  const isStep2Valid = true; // Style is optional
  const isStep3Valid = selectedAssets.size > 0;

  const handleNext = () => {
    if (step === 1 && isStep1Valid) {
      setStep(2);
    } else if (step === 2 && isStep2Valid) {
      setStep(3);
    } else if (step === 3 && isStep3Valid) {
      onComplete({ 
        eventDetails, 
        logos, 
        selectedAssets, 
        styleDescription,
        vibeImage,
        masterPattern,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleToggleAsset = (type: AssetType) => {
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

  const handleSelectQuickStart = () => {
    setSelectedAssets(new Set(DEFAULT_QUICK_START_ASSETS));
  };

  const handleSelectFullSuite = () => {
    setSelectedAssets(new Set(FULL_SUITE_ASSETS));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Event Design Kit Generator</h1>
          <p className="text-muted-foreground mt-2 text-lg">Professional branding assets in minutes, not weeks</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, index) => {
            const Icon = s.icon;
            const isActive = step === s.number;
            const isCompleted = step > s.number;
            
            return (
              <React.Fragment key={s.number}>
                <button
                  onClick={() => isCompleted && setStep(s.number)}
                  disabled={!isCompleted}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : isCompleted
                        ? 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20'
                        : 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                  <span className="text-sm font-medium sm:hidden">{s.number}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={`h-0.5 w-8 rounded-full transition-all duration-500 ${
                    step > s.number ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step content */}
        <div className="glass-card p-8 shadow-xl">
          {step === 1 && (
            <StepOne
              eventDetails={eventDetails}
              setEventDetails={setEventDetails}
              logos={logos}
              setLogos={setLogos}
            />
          )}

          {step === 2 && (
            <StepTwo
              styleDescription={styleDescription}
              setStyleDescription={setStyleDescription}
              vibeImage={vibeImage}
              setVibeImage={setVibeImage}
              masterPattern={masterPattern}
              setMasterPattern={setMasterPattern}
              eventDetails={eventDetails}
            />
          )}

          {step === 3 && (
            <StepThree
              selectedAssets={selectedAssets}
              onToggleAsset={handleToggleAsset}
              onSelectQuickStart={handleSelectQuickStart}
              onSelectFullSuite={handleSelectFullSuite}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={step === 1 ? !isStep1Valid : step === 3 ? !isStep3Valid : false}
              className="btn-primary group"
            >
              {step === 3 ? (
                <>
                  Generate {selectedAssets.size} Assets
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-1 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </>
              ) : (
                <>
                  Continue
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Helper text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {step === 1 && "Enter your event details and upload your logo"}
          {step === 2 && "Define your visual style with references and descriptions"}
          {step === 3 && "Choose which assets to generate for your event"}
        </p>
      </div>
    </div>
  );
};

export default OnboardingFlow;
