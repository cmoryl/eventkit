import React, { useState } from 'react';
import type { EventDetails, LogoAsset } from '../../types';
import { AssetType } from '../../types';
import { DEFAULT_QUICK_START_ASSETS, FULL_SUITE_ASSETS } from '../../config/assetConfig';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import { Sparkles, Palette, Layers, ChevronLeft, ChevronRight, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  { number: 1, label: 'Event Details', shortLabel: 'Details', icon: Sparkles, gradient: 'from-violet-500 to-purple-600' },
  { number: 2, label: 'Style & Vibe', shortLabel: 'Style', icon: Palette, gradient: 'from-pink-500 to-rose-500' },
  { number: 3, label: 'Select Assets', shortLabel: 'Assets', icon: Layers, gradient: 'from-cyan-500 to-blue-500' },
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
  const isStep2Valid = true;
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

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-4xl animate-fade-in">
        {/* Hero Header */}
        <div className="text-center mb-8">
          {/* Animated Logo */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-primary to-cyan-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 via-primary to-cyan-500 flex items-center justify-center shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Event Design Kit{' '}
            <span className="bg-gradient-to-r from-violet-500 via-primary to-cyan-500 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-md mx-auto">
            Professional branding assets in minutes, not weeks
          </p>
        </div>

        {/* Progress Bar & Steps */}
        <div className="mb-8">
          {/* Progress track */}
          <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-6">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 via-primary to-cyan-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.number;
              const isCompleted = step > s.number;
              
              return (
                <React.Fragment key={s.number}>
                  <button
                    onClick={() => isCompleted && setStep(s.number)}
                    disabled={!isCompleted && !isActive}
                    className={cn(
                      "group relative flex flex-col sm:flex-row items-center gap-2 sm:gap-3 transition-all duration-300",
                      isCompleted && "cursor-pointer"
                    )}
                  >
                    {/* Step circle */}
                    <div className={cn(
                      "relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                      isActive && `bg-gradient-to-br ${s.gradient} text-white shadow-lg scale-110`,
                      isCompleted && "bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg",
                      !isActive && !isCompleted && "bg-secondary text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                      
                      {/* Pulse ring for active */}
                      {isActive && (
                        <div className={cn(
                          "absolute inset-0 rounded-2xl bg-gradient-to-br animate-ping opacity-30",
                          s.gradient
                        )} style={{ animationDuration: '2s' }} />
                      )}
                    </div>

                    {/* Step label */}
                    <div className="text-center sm:text-left">
                      <span className={cn(
                        "block text-xs font-medium transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        Step {s.number}
                      </span>
                      <span className={cn(
                        "block text-sm font-bold transition-colors hidden sm:block",
                        isActive ? `bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent` : 
                        isCompleted ? "text-emerald-500" : "text-muted-foreground"
                      )}>
                        {s.label}
                      </span>
                      <span className={cn(
                        "block text-xs font-semibold transition-colors sm:hidden",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {s.shortLabel}
                      </span>
                    </div>
                  </button>

                  {/* Connector line */}
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 mx-2 sm:mx-4">
                      <div className={cn(
                        "h-0.5 rounded-full transition-all duration-500",
                        step > s.number 
                          ? "bg-gradient-to-r from-emerald-500 to-green-500" 
                          : "bg-border"
                      )} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Main Card */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-primary/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50" />
          
          {/* Card */}
          <div className="relative rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Gradient top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-primary to-cyan-500" />

            {/* Content */}
            <div className="p-6 sm:p-8">
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
            </div>

            {/* Navigation Footer */}
            <div className="px-6 sm:px-8 py-5 border-t border-border/50 bg-secondary/20 flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300",
                  step === 1
                    ? "opacity-30 cursor-not-allowed text-muted-foreground"
                    : "text-foreground hover:bg-secondary hover:scale-105"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={step === 1 ? !isStep1Valid : step === 3 ? !isStep3Valid : false}
                className={cn(
                  "group relative flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300",
                  "bg-gradient-to-r from-violet-500 via-primary to-cyan-500 text-white",
                  "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                )}
              >
                {step === 3 ? (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate {selectedAssets.size} Assets
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Helper text */}
        <p className="text-center text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
          {step === 1 && (
            <>
              <Sparkles className="w-4 h-4 text-violet-500" />
              Enter your event details and upload your logo
            </>
          )}
          {step === 2 && (
            <>
              <Palette className="w-4 h-4 text-pink-500" />
              Define your visual style with references and descriptions
            </>
          )}
          {step === 3 && (
            <>
              <Layers className="w-4 h-4 text-cyan-500" />
              Choose which assets to generate for your event
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default OnboardingFlow;
