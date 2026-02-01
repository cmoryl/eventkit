import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventDetails, LogoAsset, VenueVideoAnalysis } from '../../types';
import { AssetType } from '../../types';
import { DEFAULT_QUICK_START_ASSETS, FULL_SUITE_ASSETS } from '../../config/assetConfig';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import { Sparkles, Palette, Layers, ChevronLeft, ChevronRight, Zap, ArrowRight } from 'lucide-react';
import FAQSection from '../FAQSection';
import { cn } from '@/lib/utils';
import { AnimatedGradientBg } from '../animations/GlowingOrb';
import { MagneticButton } from '../animations/InteractiveCard';
import { ThemeToggle } from '../ThemeToggle';

interface OnboardingFlowProps {
  onComplete: (data: {
    eventDetails: EventDetails;
    logos: LogoAsset[];
    selectedAssets: Set<AssetType>;
    styleDescription: string;
    vibeImage: File | null;
    masterPattern: File | null;
    venueImage: File | null;
    venueVideoAnalysis: VenueVideoAnalysis | null;
  }) => void;
  /** Start directly at a specific step (1, 2, or 3) */
  initialStep?: number;
  /** Preserve existing event details when adding more assets */
  initialEventDetails?: EventDetails;
  /** Preserve existing logos when adding more assets */
  initialLogos?: LogoAsset[];
  /** Preserve existing style description when adding more assets */
  initialStyleDescription?: string;
  /** Pre-select a specific asset type (from landing page quick-create) */
  preSelectedAssetType?: AssetType | null;
  /** Optional callback to cancel and return to studio */
  onCancel?: () => void;
}

const STEPS = [
  { number: 1, label: 'Event Details', shortLabel: 'Details', icon: Sparkles, gradient: 'from-violet-500 to-purple-600' },
  { number: 2, label: 'Style & Vibe', shortLabel: 'Style', icon: Palette, gradient: 'from-pink-500 to-rose-500' },
  { number: 3, label: 'Select Assets', shortLabel: 'Assets', icon: Layers, gradient: 'from-cyan-500 to-blue-500' },
];

// Page transition variants
const pageVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95,
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    }
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  })
};

// Stagger children animation
const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25
    }
  }
};

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ 
  onComplete,
  initialStep = 1,
  initialEventDetails,
  initialLogos,
  initialStyleDescription,
  preSelectedAssetType,
  onCancel,
}) => {
  const [step, setStep] = useState(initialStep);
  const [direction, setDirection] = useState(1);
  const [eventDetails, setEventDetails] = useState<EventDetails>(
    initialEventDetails ?? {
      name: '',
      description: '',
      date: '',
      location: '',
      website: '',
      email: '',
      incorporateLocationStyle: false,
    }
  );
  const [logos, setLogos] = useState<LogoAsset[]>(initialLogos ?? []);
  const [selectedAssets, setSelectedAssets] = useState<Set<AssetType>>(() => {
    // If a pre-selected asset type is provided, start with just that asset
    if (preSelectedAssetType) {
      return new Set([preSelectedAssetType]);
    }
    return new Set(DEFAULT_QUICK_START_ASSETS);
  });
  const [styleDescription, setStyleDescription] = useState(initialStyleDescription ?? '');
  const [vibeImage, setVibeImage] = useState<File | null>(null);
  const [masterPattern, setMasterPattern] = useState<File | null>(null);
  const [venueImage, setVenueImage] = useState<File | null>(null);
  const [venueVideoAnalysis, setVenueVideoAnalysis] = useState<VenueVideoAnalysis | null>(null);
  
  // Determine if we're in "add more" mode (started at step 3 with existing data)
  const isAddMoreMode = initialStep === 3 && !!initialEventDetails;

  const isStep1Valid = eventDetails.name.trim().length > 0;
  const isStep2Valid = true;
  const isStep3Valid = selectedAssets.size > 0;

  const handleNext = () => {
    setDirection(1);
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
        venueImage,
        venueVideoAnalysis,
      });
    }
  };

  const handleBack = () => {
    setDirection(-1);
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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 overflow-hidden relative">
      <AnimatedGradientBg />
      
      {/* Theme Toggle - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <motion.div 
        className="w-full max-w-4xl"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Landing Hero Header */}
        <motion.div variants={itemVariants} className="mb-8">
          {/* Step Badge */}
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-6">
            <div className="flex items-center gap-1.5">
              {STEPS.map((s, index) => (
                <React.Fragment key={s.number}>
                  <button
                    onClick={() => {
                      if (step > s.number) {
                        setDirection(s.number < step ? -1 : 1);
                        setStep(s.number);
                      }
                    }}
                    disabled={step < s.number}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                      step === s.number && "bg-primary text-primary-foreground",
                      step > s.number && "bg-success text-success-foreground cursor-pointer hover:opacity-80",
                      step < s.number && "bg-secondary text-muted-foreground"
                    )}
                  >
                    {step > s.number ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s.number
                    )}
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      "w-6 h-0.5 rounded-full transition-colors",
                      step > s.number ? "bg-success" : "bg-border"
                    )} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Step {step} of {STEPS.length}
            </span>
          </div>

          {/* Dynamic Hero Title based on step */}
          <div className="text-center sm:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight mb-3">
                  {step === 1 && "Tell us about your event"}
                  {step === 2 && "Define your style"}
                  {step === 3 && "Choose your assets"}
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  {step === 1 && "Start with the basics — name, date, and any logos you want to include."}
                  {step === 2 && "Upload inspiration images and describe the vibe you're going for."}
                  {step === 3 && "Select which design assets you need for your event."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants} className="relative">
          {/* Glow effect */}
          <motion.div 
            className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-primary/20 to-cyan-500/20 rounded-3xl blur-xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          {/* Card */}
          <div className="relative rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Gradient top border */}
            <motion.div 
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-primary to-cyan-500"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: '200% 200%' }}
            />

            {/* Content with AnimatePresence for page transitions */}
            <div className="p-6 sm:p-8 min-h-[500px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
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
                      venueImage={venueImage}
                      setVenueImage={setVenueImage}
                      venueVideoAnalysis={venueVideoAnalysis}
                      setVenueVideoAnalysis={setVenueVideoAnalysis}
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
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <motion.div 
              className="px-6 sm:px-8 py-5 border-t border-border/50 bg-secondary/20 flex items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {isAddMoreMode && onCancel ? (
                <motion.button
                  onClick={onCancel}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 text-foreground hover:bg-secondary"
                  whileHover={{ x: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Cancel
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleBack}
                  disabled={step === 1}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300",
                    step === 1
                      ? "opacity-30 cursor-not-allowed text-muted-foreground"
                      : "text-foreground hover:bg-secondary"
                  )}
                  whileHover={step !== 1 ? { x: -4 } : undefined}
                  whileTap={step !== 1 ? { scale: 0.95 } : undefined}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </motion.button>
              )}

              <MagneticButton
                onClick={handleNext}
                disabled={step === 1 ? !isStep1Valid : step === 3 ? !isStep3Valid : false}
                className={cn(
                  "group relative flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300",
                  "bg-gradient-to-r from-violet-500 via-primary to-cyan-500 text-white",
                  "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                strength={0.2}
              >
                {step === 3 ? (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate {selectedAssets.size} Assets
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </>
                ) : (
                  <>
                    Continue
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </>
                )}
              </MagneticButton>
            </motion.div>
          </div>
        </motion.div>

        {/* Helper text */}
        <motion.p 
          className="text-center text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2"
          variants={itemVariants}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
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
            </motion.span>
          </AnimatePresence>
        </motion.p>

        {/* FAQ Section - Only show on step 1 */}
        {step === 1 && (
          <FAQSection 
            className="mt-16" 
            showCategories={true}
            showSearch={true}
          />
        )}
      </motion.div>
    </div>
  );
};

export default OnboardingFlow;
