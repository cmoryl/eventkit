import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Key, MapPin, Eye, EyeOff, Check, ExternalLink, Trash2, 
  Sparkles, Image, Cpu, Cloud, Shield, Zap, ChevronRight,
  Settings, Palette, Globe, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApiSettings } from '@/hooks/useApiSettings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'google' | 'ai' | 'about';

interface ApiKeyConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  description: string;
  docsUrl: string;
  docsLabel: string;
  features?: string[];
}

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const googleConfigs: ApiKeyConfig[] = [
  {
    id: 'googleMapsApiKey',
    label: 'Google Maps',
    icon: <MapPin className="w-4 h-4" />,
    placeholder: 'AIzaSy...',
    description: 'Enhanced venue search with Places API',
    docsUrl: 'https://console.cloud.google.com/apis/credentials',
    docsLabel: 'Cloud Console',
    features: ['Venue autocomplete', 'Location intelligence', 'Place details'],
  },
  {
    id: 'googleCloudApiKey',
    label: 'Google AI Studio',
    icon: <Brain className="w-4 h-4" />,
    placeholder: 'AIzaSy...',
    description: 'Access Whisk, Imagen 3, and Veo 2',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    docsLabel: 'AI Studio',
    features: ['Google Whisk', 'Imagen 3', 'Veo 2 video'],
  },
];

const aiConfigs: ApiKeyConfig[] = [
  {
    id: 'openaiApiKey',
    label: 'OpenAI',
    icon: <Sparkles className="w-4 h-4" />,
    placeholder: 'sk-...',
    description: 'GPT and DALL-E models',
    docsUrl: 'https://platform.openai.com/api-keys',
    docsLabel: 'OpenAI Platform',
    features: ['GPT-4 Vision', 'DALL-E 3', 'Text generation'],
  },
  {
    id: 'stabilityApiKey',
    label: 'Stability AI',
    icon: <Image className="w-4 h-4" />,
    placeholder: 'sk-...',
    description: 'Stable Diffusion models',
    docsUrl: 'https://platform.stability.ai/account/keys',
    docsLabel: 'Stability Platform',
    features: ['SD3', 'SDXL', 'Image upscaling'],
  },
  {
    id: 'replicateApiKey',
    label: 'Replicate',
    icon: <Cpu className="w-4 h-4" />,
    placeholder: 'r8_...',
    description: 'Run various AI models',
    docsUrl: 'https://replicate.com/account/api-tokens',
    docsLabel: 'Replicate Dashboard',
    features: ['Flux', 'SDXL', 'Custom models'],
  },
];

const tabs = [
  { id: 'google' as TabId, label: 'Google', icon: GoogleIcon, color: 'from-blue-500 to-green-500' },
  { id: 'ai' as TabId, label: 'AI Providers', icon: Sparkles, color: 'from-violet-500 to-purple-500' },
  { id: 'about' as TabId, label: 'About', icon: Shield, color: 'from-emerald-500 to-teal-500' },
];

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, configuredKeysCount } = useApiSettings();
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<TabId>('google');

  useEffect(() => {
    if (isOpen) {
      setKeys({
        googleMapsApiKey: settings.googleMapsApiKey || '',
        googleCloudApiKey: settings.googleCloudApiKey || '',
        openaiApiKey: settings.openaiApiKey || '',
        stabilityApiKey: settings.stabilityApiKey || '',
        replicateApiKey: settings.replicateApiKey || '',
      });
      setVisibleKeys({});
      setActiveTab('google');
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    const updates: Record<string, string | undefined> = {};
    [...googleConfigs, ...aiConfigs].forEach(config => {
      const value = keys[config.id]?.trim();
      updates[config.id] = value || undefined;
    });
    updateSettings(updates);
    toast.success('Settings saved successfully!');
    onClose();
  };

  const handleRemoveKey = (keyId: string) => {
    setKeys(prev => ({ ...prev, [keyId]: '' }));
    updateSettings({ [keyId]: undefined });
    toast.success('API key removed');
  };

  const toggleVisibility = (keyId: string) => {
    setVisibleKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const hasKey = (keyId: string) => Boolean(settings[keyId as keyof typeof settings]);

  const renderKeyCard = (config: ApiKeyConfig) => {
    const isConfigured = hasKey(config.id);
    
    return (
      <motion.div
        key={config.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-4 rounded-xl border transition-all",
          isConfigured 
            ? "bg-emerald-500/5 border-emerald-500/20" 
            : "bg-secondary/30 border-border hover:border-primary/30"
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isConfigured 
                ? "bg-emerald-500/10 text-emerald-500" 
                : "bg-secondary text-muted-foreground"
            )}>
              {config.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{config.label}</h4>
                {isConfigured && (
                  <span className="flex items-center gap-1 text-xs text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" />
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <a 
            href={config.docsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {config.features && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {config.features.map((feature, idx) => (
              <span 
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-md bg-secondary/80 text-muted-foreground"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            type={visibleKeys[config.id] ? 'text' : 'password'}
            value={keys[config.id] || ''}
            onChange={(e) => setKeys(prev => ({ ...prev, [config.id]: e.target.value }))}
            placeholder={config.placeholder}
            className={cn(
              "w-full px-4 py-2.5 pr-20 rounded-lg border bg-background/80 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all font-mono text-sm",
              isConfigured && !keys[config.id] && "border-emerald-500/30"
            )}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => toggleVisibility(config.id)}
              className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            >
              {visibleKeys[config.id] ? (
                <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            {isConfigured && (
              <button
                type="button"
                onClick={() => handleRemoveKey(config.id)}
                className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[85vh] overflow-hidden"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="p-5 border-b border-border shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Settings</h2>
                      <p className="text-sm text-muted-foreground">
                        {configuredKeysCount > 0 
                          ? `${configuredKeysCount} integration${configuredKeysCount > 1 ? 's' : ''} configured`
                          : 'Configure your API integrations'
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2.5 rounded-xl hover:bg-secondary transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                          isActive 
                            ? "bg-background text-foreground shadow-sm" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {typeof Icon === 'function' && Icon.name === 'GoogleIcon' ? (
                          <Icon />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 overflow-y-auto flex-1">
                <AnimatePresence mode="wait">
                  {activeTab === 'google' && (
                    <motion.div
                      key="google"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center">
                          <GoogleIcon />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">Google Services</h3>
                          <p className="text-xs text-muted-foreground">Maps, Whisk, Imagen, and Veo</p>
                        </div>
                      </div>
                      {googleConfigs.map(renderKeyCard)}
                    </motion.div>
                  )}

                  {activeTab === 'ai' && (
                    <motion.div
                      key="ai"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-violet-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">AI Providers</h3>
                          <p className="text-xs text-muted-foreground">Alternative generation engines</p>
                        </div>
                      </div>
                      {aiConfigs.map(renderKeyCard)}
                    </motion.div>
                  )}

                  {activeTab === 'about' && (
                    <motion.div
                      key="about"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">Privacy & Security</h3>
                          <p className="text-xs text-muted-foreground">How your data is handled</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <Shield className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground mb-1">Local Storage Only</h4>
                              <p className="text-sm text-muted-foreground">
                                All API keys are stored securely in your browser's local storage. They are never transmitted to our servers or any third party.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                              <Zap className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground mb-1">Direct API Calls</h4>
                              <p className="text-sm text-muted-foreground">
                                When you use your own API keys, requests go directly from your browser to the respective service provider.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                              <Globe className="w-4 h-4 text-violet-500" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground mb-1">Built-in AI Available</h4>
                              <p className="text-sm text-muted-foreground">
                                You can use our built-in AI (powered by Lovable AI) without any API keys. Custom keys are optional for advanced users.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border">
                        <div className="flex items-center gap-2 text-sm">
                          <Key className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            <strong className="text-foreground">{configuredKeysCount}</strong> of 5 integrations configured
                          </span>
                        </div>
                        <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            initial={{ width: 0 }}
                            animate={{ width: `${(configuredKeysCount / 5) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-border flex items-center justify-between shrink-0">
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Changes are saved to your browser
                </p>
                <div className="flex items-center gap-2 ml-auto">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="gap-2">
                    <Check className="w-4 h-4" />
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ApiSettingsModal;