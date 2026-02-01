import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Image, Upload, Trash2, Loader2, CheckCircle2, 
  Sparkles, AlertCircle, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppSettings } from '@/hooks/useAppSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AdminSiteSettings: React.FC = () => {
  const { 
    settings, 
    isLoading, 
    updateLogoSettings, 
    logoType,
    logoUrl,
    logoIconUrl 
  } = useAppSettings();
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewIconUrl, setPreviewIconUrl] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState(logoType);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setSelectedType(logoType);
    setPreviewUrl(logoUrl);
    setPreviewIconUrl(logoIconUrl);
  }, [logoType, logoUrl, logoIconUrl]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'icon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `app-${type}-${Date.now()}.${fileExt}`;
      const filePath = `site/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('asset-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('asset-images')
        .getPublicUrl(filePath);

      if (type === 'logo') {
        setPreviewUrl(publicUrl);
      } else {
        setPreviewIconUrl(publicUrl);
      }

      toast.success(`${type === 'logo' ? 'Logo' : 'Icon'} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateLogoSettings({
        type: selectedType as 'default' | 'custom' | 'icon-only',
        url: previewUrl,
        iconUrl: previewIconUrl
      });
      toast.success('Logo settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      await updateLogoSettings({
        type: 'default',
        url: null,
        iconUrl: null
      });
      setSelectedType('default');
      setPreviewUrl(null);
      setPreviewIconUrl(null);
      toast.success('Logo reset to default');
    } catch (error) {
      toast.error('Failed to reset logo');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Site Settings</h2>
        <p className="text-muted-foreground">
          Customize the EventKIT application branding
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Application Logo
          </CardTitle>
          <CardDescription>
            Upload a custom logo to replace the default EventKIT branding across the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Type Selection */}
          <div className="space-y-3">
            <Label>Logo Display Style</Label>
            <RadioGroup 
              value={selectedType} 
              onValueChange={(v) => setSelectedType(v as 'default' | 'custom' | 'icon-only')}
              className="grid grid-cols-3 gap-4"
            >
              <Label
                htmlFor="default"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedType === 'default' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <RadioGroupItem value="default" id="default" className="sr-only" />
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-medium text-sm">Default</span>
                <span className="text-xs text-muted-foreground text-center">EventKIT branding</span>
              </Label>

              <Label
                htmlFor="custom"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedType === 'custom' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <RadioGroupItem value="custom" id="custom" className="sr-only" />
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Custom logo" className="w-full h-full object-contain" />
                  ) : (
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <span className="font-medium text-sm">Custom Logo</span>
                <span className="text-xs text-muted-foreground text-center">Your brand logo</span>
              </Label>

              <Label
                htmlFor="icon-only"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedType === 'icon-only' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <RadioGroupItem value="icon-only" id="icon-only" className="sr-only" />
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                  {previewIconUrl ? (
                    <img src={previewIconUrl} alt="Icon" className="w-8 h-8 object-contain" />
                  ) : (
                    <Image className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <span className="font-medium text-sm">Icon Only</span>
                <span className="text-xs text-muted-foreground text-center">Square icon/symbol</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Custom Logo Upload */}
          {selectedType === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Full Logo (Recommended: 200×50px or wider)</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-24 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Logo preview" className="max-h-full max-w-full object-contain p-2" />
                    ) : (
                      <div className="text-center p-4">
                        <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">No logo uploaded</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, 'logo')}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      Upload
                    </Button>
                    {previewUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setPreviewUrl(null)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Icon Only Upload */}
          {selectedType === 'icon-only' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Square Icon (Recommended: 512×512px)</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                    {previewIconUrl ? (
                      <img src={previewIconUrl} alt="Icon preview" className="w-16 h-16 object-contain" />
                    ) : (
                      <div className="text-center p-2">
                        <Image className="w-8 h-8 mx-auto text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      ref={iconInputRef}
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, 'icon')}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => iconInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      Upload
                    </Button>
                    {previewIconUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setPreviewIconUrl(null)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Preview */}
          <div className="space-y-2">
            <Label>Header Preview</Label>
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center gap-3">
                {selectedType === 'default' && (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold">EventKIT</span>
                  </>
                )}
                {selectedType === 'custom' && previewUrl && (
                  <img src={previewUrl} alt="Logo" className="h-10 object-contain" />
                )}
                {selectedType === 'custom' && !previewUrl && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">Upload a logo to preview</span>
                  </div>
                )}
                {selectedType === 'icon-only' && previewIconUrl && (
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-background">
                    <img src={previewIconUrl} alt="Icon" className="w-full h-full object-contain" />
                  </div>
                )}
                {selectedType === 'icon-only' && !previewIconUrl && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">Upload an icon to preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={isSaving || (selectedType === 'default' && !logoUrl && !logoIconUrl)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSiteSettings;
