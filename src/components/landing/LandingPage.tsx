import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Zap, Palette, Download, ArrowRight, CheckCircle2, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssetShowcase } from './AssetShowcase';
import { RecentCreationsSection } from './RecentCreationsSection';
import { FeaturedSection } from './FeaturedSection';
import { AssetType } from '@/types';
import { AppNavHeader } from '@/components/layout/AppNavHeader';
import { useAuth } from '@/hooks/useAuth';

interface LandingPageProps {
  onGetStarted: () => void;
  isAuthenticated?: boolean;
  onAssetClick?: (assetType: AssetType) => void;
}

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'Transform your event vision into professional assets in seconds using advanced AI.',
  },
  {
    icon: Palette,
    title: 'Complete Brand Kits',
    description: 'From banners to business cards, get 100+ cohesive branded assets instantly.',
  },
  {
    icon: Zap,
    title: 'Print-Ready Exports',
    description: 'Download high-resolution files ready for professional printing.',
  },
  {
    icon: Download,
    title: 'One-Click Download',
    description: 'Export everything as a zip or selectively download individual assets.',
  },
];

const steps = [
  { step: '01', title: 'Describe Your Event', description: 'Enter your event details and upload your logo' },
  { step: '02', title: 'Choose Your Style', description: 'Select colors, patterns, and visual direction' },
  { step: '03', title: 'Generate & Download', description: 'AI creates your complete design kit instantly' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onGetStarted,
  isAuthenticated = false,
  onAssetClick
}) => {
  const { user, signOut, isAuthenticated: isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[128px]"
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Hero Header */}
      <AppNavHeader onGetStarted={onGetStarted} />

      {/* Unified Hero Section */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20">
        {/* Text Content */}
        <div className="max-w-5xl mx-auto text-center px-6 mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            100+ Asset Types
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5"
          >
            Create Stunning{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
              Event Design Kits
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            From banners to merchandise — upload your logo, describe your style, and generate a complete professional branding package in minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center mb-2"
          >
            <Button size="lg" onClick={onGetStarted} className="text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25">
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        {/* Integrated Asset Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <AssetShowcase 
            embedded 
            isAuthenticated={isAuthenticated}
            onAssetClick={onAssetClick}
          />
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 mt-10 sm:mt-14 px-4"
        >
          {[
            { value: 'Print-Ready', label: 'High Resolution' },
            { value: '<1 min', label: 'Generation Time' },
            { value: 'AI-Powered', label: 'Smart Generation' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Authenticated User: Recent Creations & Featured */}
      {isLoggedIn && (
        <>
          <RecentCreationsSection onGetStarted={onGetStarted} />
          <FeaturedSection />
        </>
      )}

      {/* Non-authenticated: Features Section */}
      {!isLoggedIn && (
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                From digital assets to print-ready files, create a cohesive brand identity for any event.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 hover:bg-card/80 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Non-authenticated: How It Works */}
      {!isLoggedIn && (
        <section className="py-24 sm:py-32 px-6 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />
          
          <div className="max-w-6xl mx-auto relative">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4"
              >
                How It{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Works
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg text-muted-foreground max-w-md mx-auto"
              >
                Three simple steps to your complete event kit
              </motion.p>
            </motion.div>

            {/* Vertical Timeline */}
            <div className="relative">
              {/* Central line - desktop only */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
                <motion.div
                  className="w-full h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{ originY: 0 }}
                />
              </div>

              {/* Steps */}
              <div className="space-y-16 lg:space-y-24">
                {steps.map((step, i) => {
                  const isEven = i % 2 === 0;
                  
                  return (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.5 }}
                      className={`relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                        isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                      }`}
                    >
                      {/* Content Side */}
                      <motion.div
                        initial={{ opacity: 0, x: isEven ? -60 : 60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                        className={`flex-1 ${isEven ? 'lg:text-right' : 'lg:text-left'} text-center lg:text-inherit`}
                      >
                        <div className={`inline-block ${isEven ? 'lg:ml-auto' : 'lg:mr-auto'}`}>
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                            className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-3"
                          >
                            Step {step.step}
                          </motion.span>
                          <h3 className="text-2xl sm:text-3xl font-bold mb-3">{step.title}</h3>
                          <p className="text-muted-foreground max-w-sm">{step.description}</p>
                        </div>
                      </motion.div>

                      {/* Center Number - Desktop */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 0.1,
                          type: "spring",
                          stiffness: 200
                        }}
                        className="relative flex-shrink-0 order-first lg:order-none"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/25 relative z-10">
                          <span className="text-3xl sm:text-4xl font-bold text-primary-foreground">
                            {step.step}
                          </span>
                        </div>
                        {/* Glow ring */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.3, 0.5]
                          }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </motion.div>

                      {/* Visual Side - Icon/Illustration */}
                      <motion.div
                        initial={{ opacity: 0, x: isEven ? 60 : -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                        className="flex-1 hidden lg:flex justify-center"
                      >
                        <div className={`w-full max-w-xs aspect-[4/3] rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 flex items-center justify-center relative overflow-hidden group`}>
                          {/* Animated background pattern */}
                          <div className="absolute inset-0 opacity-30">
                            <div className="absolute inset-0" style={{
                              backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary) / 0.3) 1px, transparent 0)`,
                              backgroundSize: '24px 24px'
                            }} />
                          </div>
                          {/* Floating icon */}
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-10"
                          >
                            {i === 0 && (
                              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-primary" />
                              </div>
                            )}
                            {i === 1 && (
                              <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center">
                                <Palette className="w-8 h-8 text-accent" />
                              </div>
                            )}
                            {i === 2 && (
                              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Download className="w-8 h-8 text-primary" />
                              </div>
                            )}
                          </motion.div>
                          {/* Hover glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-500" />
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center mt-20"
              >
                <Button 
                  size="lg" 
                  onClick={onGetStarted}
                  className="rounded-xl px-8 shadow-lg shadow-primary/25"
                >
                  Start Creating <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Only show for non-authenticated users */}
      {!isLoggedIn && (
        <section className="py-24 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Create Your Event Kit?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Join thousands of event planners who save hours on design work with AI-powered asset generation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <Button size="lg" onClick={onGetStarted} className="text-lg px-8 py-6 rounded-xl">
                Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Free to start</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> No design skills needed</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Print-ready exports</span>
            </div>
          </motion.div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-medium">EventKIT</span>
            </div>

            <nav className="flex items-center gap-6 text-sm">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </button>
              <button 
                onClick={onGetStarted}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Get Started
              </button>
            </nav>

            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
