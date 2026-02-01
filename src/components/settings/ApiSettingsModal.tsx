import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, MapPin, Eye, EyeOff, Check, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApiSettings } from '@/hooks/useApiSettings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, hasGoogleMapsKey } = useApiSettings();
  const [googleMapsKey, setGoogleMapsKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGoogleMapsKey(settings.googleMapsApiKey || '');
      setShowKey(false);
    }
  }, [isOpen, settings.googleMapsApiKey]);

  const handleSave = () => {
    if (googleMapsKey.trim()) {
      updateSettings({ googleMapsApiKey: googleMapsKey.trim() });
      toast.success('Google Maps API key saved!');
    }
    onClose();
  };

  const handleRemoveKey = () => {
    updateSettings({ googleMapsApiKey: undefined });
    setGoogleMapsKey('');
    toast.success('API key removed');
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4);
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">API Settings</h2>
                    <p className="text-xs text-muted-foreground">Configure external API keys</p>
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
              <div className="p-4 space-y-4">
                {/* Google Maps API Key */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Google Maps API Key
                    </label>
                    {hasGoogleMapsKey && (
                      <span className="flex items-center gap-1 text-xs text-emerald-500">
                        <Check className="w-3 h-3" />
                        Configured
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Enable enhanced venue search with Google Places API. Get your key from the{' '}
                    <a 
                      href="https://console.cloud.google.com/apis/credentials" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      Google Cloud Console
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>

                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={googleMapsKey}
                      onChange={(e) => setGoogleMapsKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className={cn(
                        "w-full px-4 py-3 pr-20 rounded-xl border bg-background/80 backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all font-mono text-sm",
                        hasGoogleMapsKey && !googleMapsKey && "border-emerald-500/30"
                      )}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                      >
                        {showKey ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      {hasGoogleMapsKey && (
                        <button
                          type="button"
                          onClick={handleRemoveKey}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* API requirements info */}
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Required APIs:</strong> Places API, Geocoding API
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your key is stored locally in your browser and never sent to our servers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border flex items-center justify-end gap-2">
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
