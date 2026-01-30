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
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`step-indicator ${step >= 1 ? 'active' : 'pending'}`}>1</div>
          <div className={`h-0.5 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
          <div className={`step-indicator ${step >= 2 ? 'active' : 'pending'}`}>2</div>
        </div>

        {/* Step content */}
        <div className="glass-card p-8">
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
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              className="btn-primary"
            >
              {step === 2 ? (
                <>
                  Generate Assets
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </>
              ) : (
                <>
                  Continue
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Helper text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {step === 1 ? "Tell us about your event to get started" : "Choose what assets to create for your event"}
        </p>
      </div>
    </div>
  );
};

export default OnboardingFlow;
