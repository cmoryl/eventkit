import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Zap, Palette, Download, ArrowRight, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AssetShowcase } from './AssetShowcase';

interface LandingPageProps {
  onGetStarted: () => void;
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

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
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

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EventKIT</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button onClick={onGetStarted} className="hidden sm:flex">
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

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
          <AssetShowcase embedded />
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

      {/* Features Section */}
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

      {/* How It Works */}
      <section className="py-20 px-6 bg-muted/30 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            >
              Simple Process
            </motion.span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to your complete event design kit</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Animated connecting line */}
            <motion.div 
              className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 overflow-hidden"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50"
                initial={{ x: '-100%' }}
                whileInView={{ x: '0%' }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              />
            </motion.div>
            
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: i * 0.2,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                whileHover={{ 
                  y: -12, 
                  scale: 1.02,
                  transition: { duration: 0.3, type: "spring", stiffness: 300 } 
                }}
                className="relative text-center group cursor-default p-6 rounded-2xl transition-all duration-300"
              >
                {/* Card background with animated gradient border */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-500"
                  whileHover={{ 
                    boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.3)",
                  }}
                />
                <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-primary/30 transition-colors duration-300" />
                
                {/* Animated corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-transparent group-hover:border-primary/50 rounded-tl-2xl transition-all duration-500 group-hover:w-12 group-hover:h-12" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-transparent group-hover:border-accent/50 rounded-br-2xl transition-all duration-500 group-hover:w-12 group-hover:h-12" />
                
                {/* Step number with animation */}
                <motion.div 
                  className="relative inline-block mb-4"
                  whileHover={{ 
                    scale: 1.15, 
                    rotate: [0, -8, 8, -4, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <span className="text-6xl sm:text-7xl font-bold bg-gradient-to-br from-primary/50 to-primary/20 bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-500">
                    {item.step}
                  </span>
                  {/* Animated ring */}
                  <motion.div
                    className="absolute -inset-4 rounded-full border-2 border-primary/0 group-hover:border-primary/30"
                    initial={false}
                    whileHover={{ 
                      scale: [1, 1.3, 1.1],
                      opacity: [0, 0.8, 0.4],
                      transition: { duration: 0.6 }
                    }}
                  />
                  {/* Glow effect */}
                  <div className="absolute inset-0 blur-2xl bg-primary/0 group-hover:bg-primary/20 transition-all duration-500 rounded-full" />
                </motion.div>
                
                {/* Title with animated underline */}
                <h3 className="text-xl font-semibold mb-3 relative inline-block">
                  <span className="relative z-10 group-hover:text-primary transition-colors duration-300">{item.title}</span>
                  <motion.span 
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-accent to-primary origin-left rounded-full"
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.2, duration: 0.4 }}
                  />
                  <motion.span 
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-accent to-primary origin-center rounded-full opacity-0 group-hover:opacity-100 scale-x-0 group-hover:scale-x-100 transition-all duration-300"
                  />
                </h3>
                
                <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 relative z-10">
                  {item.description}
                </p>
                
                {/* Floating arrow with enhanced animation */}
                {i < steps.length - 1 && (
                  <motion.div 
                    className="hidden md:flex absolute -right-4 top-14 text-primary/30 group-hover:text-primary/60 transition-colors duration-300"
                    animate={{ 
                      x: [0, 10, 0],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                )}
                
                {/* Particle effect on hover */}
                <motion.div
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-primary/50 opacity-0 group-hover:opacity-100"
                  animate={{ 
                    scale: [0, 1, 0],
                    y: [0, -30, -60],
                    x: [0, 10, 20],
                  }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
                />
                <motion.div
                  className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-accent/50 opacity-0 group-hover:opacity-100"
                  animate={{ 
                    scale: [0, 1, 0],
                    y: [0, -40, -70],
                    x: [0, -15, -25],
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.3, delay: 0.2 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
