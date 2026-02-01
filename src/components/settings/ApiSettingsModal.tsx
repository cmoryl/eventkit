import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, MapPin, Eye, EyeOff, Check, ExternalLink, Trash2, Sparkles, Image, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApiSettings } from '@/hooks/useApiSettings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiKeyConfig {
  id: keyof typeof keyLabels;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  description: string;
  docsUrl: string;
  docsLabel: string;
}

const keyLabels = {
  googleMapsApiKey: 'Google Maps',
  openaiApiKey: 'OpenAI',
  stabilityApiKey: 'Stability AI',
  replicateApiKey: 'Replicate',
} as const;

const apiKeyConfigs: ApiKeyConfig[] = [
  {
    id: 'googleMapsApiKey',
    label: 'Google Maps API Key',
    icon: <MapPin className="w-4 h-4 text-muted-foreground" />,
    placeholder: 'AIzaSy...',
    description: 'Enable enhanced venue search with Google Places API.',
    docsUrl: 'https://console.cloud.google.com/apis/credentials',
    docsLabel: 'Google Cloud Console',
  },
  {
    id: 'openaiApiKey',
    label: 'OpenAI API Key',
    icon: <Sparkles className="w-4 h-4 text-muted-foreground" />,
    placeholder: 'sk-...',
    description: 'Use GPT models for enhanced AI generation.',
    docsUrl: 'https://platform.openai.com/api-keys',
    docsLabel: 'OpenAI Platform',
  },
  {
    id: 'stabilityApiKey',
    label: 'Stability AI API Key',
    icon: <Image className="w-4 h-4 text-muted-foreground" />,
    placeholder: 'sk-...',
    description: 'Access Stable Diffusion models for image generation.',
    docsUrl: 'https://platform.stability.ai/account/keys',
    docsLabel: 'Stability Platform',
  },
  {
    id: 'replicateApiKey',
    label: 'Replicate API Key',
    icon: <Cpu className="w-4 h-4 text-muted-foreground" />,
    placeholder: 'r8_...',
    description: 'Run various AI models via Replicate.',
    docsUrl: 'https://replicate.com/account/api-tokens',
    docsLabel: 'Replicate Dashboard',
  },
];

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, configuredKeysCount } = useApiSettings();
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setKeys({
        googleMapsApiKey: settings.googleMapsApiKey || '',
        openaiApiKey: settings.openaiApiKey || '',
        stabilityApiKey: settings.stabilityApiKey || '',
        replicateApiKey: settings.replicateApiKey || '',
      });
      setVisibleKeys({});
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    const updates: Record<string, string | undefined> = {};
    apiKeyConfigs.forEach(config => {
      const value = keys[config.id]?.trim();
      updates[config.id] = value || undefined;
    });
    updateSettings(updates);
    toast.success('API settings saved!');
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[85vh] overflow-hidden"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">API Settings</h2>
                    <p className="text-xs text-muted-foreground">
                      {configuredKeysCount > 0 
                        ? `${configuredKeysCount} key${configuredKeysCount > 1 ? 's' : ''} configured`
                        : 'Configure external API keys'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {apiKeyConfigs.map((config) => (
                  <div key={config.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        {config.icon}
                        {config.label}
                      </label>
                      {hasKey(config.id) && (
                        <span className="flex items-center gap-1 text-xs text-emerald-500">
                          <Check className="w-3 h-3" />
                          Configured
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {config.description}{' '}
                      <a 
                        href={config.docsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-0.5"
                      >
                        {config.docsLabel}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>

                    <div className="relative">
                      <input
                        type={visibleKeys[config.id] ? 'text' : 'password'}
                        value={keys[config.id] || ''}
                        onChange={(e) => setKeys(prev => ({ ...prev, [config.id]: e.target.value }))}
                        placeholder={config.placeholder}
                        className={cn(
                          "w-full px-4 py-2.5 pr-20 rounded-xl border bg-background/80 backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all font-mono text-sm",
                          hasKey(config.id) && !keys[config.id] && "border-emerald-500/30"
                        )}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleVisibility(config.id)}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                        >
                          {visibleKeys[config.id] ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                        {hasKey(config.id) && (
                          <button
                            type="button"
                            onClick={() => handleRemoveKey(config.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Info box */}
                <div className="p-3 rounded-lg bg-secondary/50 border border-border mt-4">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Privacy:</strong> Keys are stored locally in your browser and never sent to our servers.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border flex items-center justify-end gap-2 shrink-0">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Settings
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ApiSettingsModal;