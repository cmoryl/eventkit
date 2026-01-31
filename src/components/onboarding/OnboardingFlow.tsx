import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventDetails, LogoAsset } from '../../types';
import { AssetType } from '../../types';
import { DEFAULT_QUICK_START_ASSETS, FULL_SUITE_ASSETS } from '../../config/assetConfig';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import { Sparkles, Palette, Layers, ChevronLeft, ChevronRight, Zap, ArrowRight } from 'lucide-react';
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
  }) => void;
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

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
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
        {/* Hero Header - Clean Minimal Design */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* Logo Mark */}
            <motion.div 
              className="relative flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
            </motion.div>
            
            {/* Title & Description */}
            <div className="text-center sm:text-left flex-1">
              <motion.h1 
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-tight"
                variants={itemVariants}
              >
                Event Design Kit
              </motion.h1>
              <motion.p 
                className="text-muted-foreground mt-1.5 text-base sm:text-lg"
                variants={itemVariants}
              >
                Generate professional branding assets in minutes
              </motion.p>
            </div>

            {/* Stats Pills - Desktop only */}
            <motion.div 
              className="hidden lg:flex flex-col gap-2"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 border border-border/50">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-xs font-medium text-muted-foreground">100+ Asset Types</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 border border-border/50">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">AI-Powered</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Progress Bar & Steps */}
        <motion.div variants={itemVariants} className="mb-8">
          {/* Progress track */}
          <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-6">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 via-primary to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '500%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
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
                  <motion.button
                    onClick={() => {
                      if (isCompleted) {
                        setDirection(s.number < step ? -1 : 1);
                        setStep(s.number);
                      }
                    }}
                    disabled={!isCompleted && !isActive}
                    className={cn(
                      "group relative flex flex-col sm:flex-row items-center gap-2 sm:gap-3 transition-all duration-300",
                      isCompleted && "cursor-pointer"
                    )}
                    whileHover={isCompleted ? { scale: 1.05 } : undefined}
                    whileTap={isCompleted ? { scale: 0.95 } : undefined}
                  >
                    {/* Step circle */}
                    <motion.div 
                      className={cn(
                        "relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                        isActive && `bg-gradient-to-br ${s.gradient} text-white shadow-lg`,
                        isCompleted && "bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg",
                        !isActive && !isCompleted && "bg-secondary text-muted-foreground"
                      )}
                      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <AnimatePresence mode="wait">
                        {isCompleted ? (
                          <motion.svg 
                            key="check"
                            xmlns="http://www.w3.org/2000/svg" 
                            className="w-6 h-6" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </motion.svg>
                        ) : (
                          <motion.div
                            key="icon"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Icon className="w-6 h-6" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Pulse ring for active */}
                      {isActive && (
                        <motion.div 
                          className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br", s.gradient)}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>

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
                  </motion.button>

                  {/* Connector line */}
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 mx-2 sm:mx-4">
                      <motion.div 
                        className="h-0.5 rounded-full bg-border"
                        style={{ originX: 0 }}
                      >
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: step > s.number ? 1 : 0 }}
                          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                          style={{ originX: 0 }}
                        />
                      </motion.div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
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
      </motion.div>
    </div>
  );
};

export default OnboardingFlow;
