import React, { useState } from 'react';
import type { EventDetails, LogoAsset } from '../../types';
import { AssetType } from '../../types';
import StepOne from './StepOne';
import StepTwo from './StepTwo';

interface OnboardingFlowProps {
  onComplete: (data: {
    eventDetails: EventDetails;
    logos: LogoAsset[];
    selectedAssets: Set<AssetType>;
    styleDescription: string;
  }) => void;
}

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
    new Set([AssetType.Palette, AssetType.SocialPost, AssetType.Banner, AssetType.NameTag])
  );
  const [styleDescription, setStyleDescription] = useState('');

  const isStep1Valid = eventDetails.name.trim().length > 0;
  const isStep2Valid = selectedAssets.size > 0;

  const handleNext = () => {
    if (step === 1 && isStep1Valid) {
      setStep(2);
    } else if (step === 2 && isStep2Valid) {
      onComplete({ eventDetails, logos, selectedAssets, styleDescription });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Event Design Kit</h1>
          <p className="text-muted-foreground mt-1">Create beautiful branded assets in minutes</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`step-indicator ${step >= 1 ? 'active' : 'pending'}`}>
            {step > 1 ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : '1'}
          </div>
          <div className={`h-0.5 w-16 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
          <div className={`step-indicator ${step >= 2 ? 'active' : 'pending'}`}>2</div>
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
              selectedAssets={selectedAssets}
              setSelectedAssets={setSelectedAssets}
              styleDescription={styleDescription}
              setStyleDescription={setStyleDescription}
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
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              className="btn-primary group"
            >
              {step === 2 ? (
                <>
                  Generate Assets
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
          {step === 1 ? "Enter your event details to get started" : "Select assets to include in your design kit"}
        </p>
      </div>
    </div>
  );
};

export default OnboardingFlow;
