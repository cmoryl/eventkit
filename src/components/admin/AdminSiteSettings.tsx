import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Image, Upload, Trash2, Loader2, CheckCircle2, 
  Sparkles, AlertCircle, RotateCcw, Sun, Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    logoUrlDark,
    logoIconUrl,
    logoIconUrlDark
  } = useAppSettings();
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewUrlDark, setPreviewUrlDark] = useState<string | null>(null);
  const [previewIconUrl, setPreviewIconUrl] = useState<string | null>(null);
  const [previewIconUrlDark, setPreviewIconUrlDark] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState(logoType);
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoDarkInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const iconDarkInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setSelectedType(logoType);
    setPreviewUrl(logoUrl);
    setPreviewUrlDark(logoUrlDark);
    setPreviewIconUrl(logoIconUrl);
    setPreviewIconUrlDark(logoIconUrlDark);
  }, [logoType, logoUrl, logoUrlDark, logoIconUrl, logoIconUrlDark]);

  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    type: 'logo' | 'logo-dark' | 'icon' | 'icon-dark'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - include SVG
    const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.svg')) {
      toast.error('Please upload a valid image file (PNG, JPG, GIF, WebP, or SVG)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `app-${type}-${Date.now()}.${fileExt}`;
      const filePath = `site/${fileName}`;

      // Determine content type - explicitly set for SVG
      let contentType = file.type;
      if (fileExt === 'svg' || file.type === 'image/svg+xml') {
        contentType = 'image/svg+xml';
      }

      const { error: uploadError } = await supabase.storage
        .from('asset-images')
        .upload(filePath, file, {
          contentType,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('asset-images')
        .getPublicUrl(filePath);

      switch (type) {
        case 'logo':
          setPreviewUrl(publicUrl);
          break;
        case 'logo-dark':
          setPreviewUrlDark(publicUrl);
          break;
        case 'icon':
          setPreviewIconUrl(publicUrl);
          break;
        case 'icon-dark':
          setPreviewIconUrlDark(publicUrl);
          break;
      }

      toast.success('Image uploaded successfully');
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
        urlDark: previewUrlDark,
        iconUrl: previewIconUrl,
        iconUrlDark: previewIconUrlDark
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
        urlDark: null,
        iconUrl: null,
        iconUrlDark: null
      });
      setSelectedType('default');
      setPreviewUrl(null);
      setPreviewUrlDark(null);
      setPreviewIconUrl(null);
      setPreviewIconUrlDark(null);
      toast.success('Logo reset to default');
    } catch (error) {
      toast.error('Failed to reset logo');
    } finally {
      setIsSaving(false);
    }
  };

  const renderUploadBox = (
    url: string | null,
    onUpload: () => void,
    onRemove: () => void,
    inputRef: React.RefObject<HTMLInputElement>,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    label: string,
    isSquare?: boolean
  ) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div className={`${isSquare ? 'w-24 h-24' : 'flex-1 h-24'} rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden`}>
          {url ? (
            <img 
              src={url} 
              alt="Preview" 
              className={`${isSquare ? 'w-16 h-16' : 'max-h-full max-w-full p-2'} object-contain`} 
            />
          ) : (
            <div className="text-center p-4">
              <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">No image</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="file"
            ref={inputRef}
            accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,.svg"
            onChange={onChange}
            className="hidden"
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={onUpload}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Upload
          </Button>
          {url && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Supports PNG, JPG, WebP, GIF, and SVG</p>
    </div>
  );

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Application Logo
              </CardTitle>
              <CardDescription>
                Upload custom logos for light and dark modes. SVG files are supported for crisp display at any size.
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

              {/* Custom Logo Upload - Light & Dark */}
              {selectedType === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <Tabs defaultValue="light" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="light" className="gap-2">
                        <Sun className="w-4 h-4" />
                        Light Mode
                      </TabsTrigger>
                      <TabsTrigger value="dark" className="gap-2">
                        <Moon className="w-4 h-4" />
                        Dark Mode
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="light" className="mt-4">
                      {renderUploadBox(
                        previewUrl,
                        () => logoInputRef.current?.click(),
                        () => setPreviewUrl(null),
                        logoInputRef,
                        (e) => handleLogoUpload(e, 'logo'),
                        'Logo for Light Mode (Recommended: 200×50px or wider)'
                      )}
                    </TabsContent>
                    <TabsContent value="dark" className="mt-4">
                      {renderUploadBox(
                        previewUrlDark,
                        () => logoDarkInputRef.current?.click(),
                        () => setPreviewUrlDark(null),
                        logoDarkInputRef,
                        (e) => handleLogoUpload(e, 'logo-dark'),
                        'Logo for Dark Mode (Optional - falls back to light mode logo)'
                      )}
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}

              {/* Icon Only Upload - Light & Dark */}
              {selectedType === 'icon-only' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <Tabs defaultValue="light" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="light" className="gap-2">
                        <Sun className="w-4 h-4" />
                        Light Mode
                      </TabsTrigger>
                      <TabsTrigger value="dark" className="gap-2">
                        <Moon className="w-4 h-4" />
                        Dark Mode
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="light" className="mt-4">
                      {renderUploadBox(
                        previewIconUrl,
                        () => iconInputRef.current?.click(),
                        () => setPreviewIconUrl(null),
                        iconInputRef,
                        (e) => handleLogoUpload(e, 'icon'),
                        'Icon for Light Mode (Recommended: 512×512px)',
                        true
                      )}
                    </TabsContent>
                    <TabsContent value="dark" className="mt-4">
                      {renderUploadBox(
                        previewIconUrlDark,
                        () => iconDarkInputRef.current?.click(),
                        () => setPreviewIconUrlDark(null),
                        iconDarkInputRef,
                        (e) => handleLogoUpload(e, 'icon-dark'),
                        'Icon for Dark Mode (Optional - falls back to light mode icon)',
                        true
                      )}
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}

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

        {/* Right Column - Live Preview (Sticky) */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Header Preview
                </CardTitle>
                <div className="flex rounded-lg border border-border overflow-hidden w-fit">
                  <button
                    onClick={() => setPreviewMode('light')}
                    className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      previewMode === 'light' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    Light
                  </button>
                  <button
                    onClick={() => setPreviewMode('dark')}
                    className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      previewMode === 'dark' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    Dark
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-xl border border-border ${
                  previewMode === 'dark' ? 'bg-zinc-900' : 'bg-muted/30'
                }`}>
                  <div className="flex items-center gap-3">
                    {selectedType === 'default' && (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className={`text-lg font-bold ${previewMode === 'dark' ? 'text-white' : ''}`}>
                          EventKIT
                        </span>
                      </>
                    )}
                    {selectedType === 'custom' && (
                      (() => {
                        const displayUrl = previewMode === 'dark' 
                          ? (previewUrlDark || previewUrl) 
                          : previewUrl;
                        
                        if (displayUrl) {
                          return (
                            <img 
                              src={displayUrl} 
                              alt="Logo" 
                              className="max-h-10 max-w-[160px] w-auto h-auto object-contain" 
                            />
                          );
                        }
                        return (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">Upload a logo to preview</span>
                          </div>
                        );
                      })()
                    )}
                    {selectedType === 'icon-only' && (
                      (() => {
                        const displayUrl = previewMode === 'dark' 
                          ? (previewIconUrlDark || previewIconUrl) 
                          : previewIconUrl;
                        
                        if (displayUrl) {
                          return (
                            <img 
                              src={displayUrl} 
                              alt="Icon" 
                              className="max-h-10 max-w-[120px] w-auto h-auto object-contain" 
                            />
                          );
                        }
                        return (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">Upload an icon to preview</span>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Logos auto-resize to fit the header (max 40px height, 160px width)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSiteSettings;
