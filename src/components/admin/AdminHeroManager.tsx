import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Type, Save, RotateCcw, Eye, Sparkles, 
  FileText, Loader2, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface HeroContent {
  id?: string;
  badge_text: string;
  headline_start: string;
  headline_highlight: string;
  description: string;
  cta_text: string;
}

const defaultContent: HeroContent = {
  badge_text: '100+ Asset Types',
  headline_start: 'Create Stunning',
  headline_highlight: 'Event Design Kits',
  description: 'From banners to merchandise — upload your logo, describe your style, and generate a complete professional branding package in minutes.',
  cta_text: 'Get Started'
};

export const AdminHeroManager: React.FC = () => {
  const { user } = useAuth();
  const [content, setContent] = useState<HeroContent>(defaultContent);
  const [originalContent, setOriginalContent] = useState<HeroContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load existing hero content
  useEffect(() => {
    const loadContent = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('hero_content')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          const loadedContent: HeroContent = {
            id: data.id,
            badge_text: data.badge_text || defaultContent.badge_text,
            headline_start: data.headline_start || defaultContent.headline_start,
            headline_highlight: data.headline_highlight || defaultContent.headline_highlight,
            description: data.description || defaultContent.description,
            cta_text: data.cta_text || defaultContent.cta_text
          };
          setContent(loadedContent);
          setOriginalContent(loadedContent);
        }
      } catch (error) {
        console.error('Error loading hero content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [user]);

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(content) !== JSON.stringify(originalContent);
    setHasChanges(changed);
  }, [content, originalContent]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      if (content.id) {
        // Update existing
        const { error } = await supabase
          .from('hero_content')
          .update({
            badge_text: content.badge_text,
            headline_start: content.headline_start,
            headline_highlight: content.headline_highlight,
            description: content.description,
            cta_text: content.cta_text
          })
          .eq('id', content.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('hero_content')
          .insert({
            user_id: user.id,
            badge_text: content.badge_text,
            headline_start: content.headline_start,
            headline_highlight: content.headline_highlight,
            description: content.description,
            cta_text: content.cta_text
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setContent({ ...content, id: data.id });
        }
      }

      setOriginalContent(content);
      toast.success('Hero content saved successfully!');
    } catch (error) {
      console.error('Error saving hero content:', error);
      toast.error('Failed to save hero content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setContent(defaultContent);
  };

  const handleRevert = () => {
    setContent(originalContent);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Type className="w-6 h-6 text-primary" />
            Hero Content Manager
          </h2>
          <p className="text-muted-foreground mt-1">
            Customize your landing page hero section
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRevert}
            disabled={!hasChanges}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Revert
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleReset}
          >
            Reset to Default
          </Button>
          <Button 
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Content Editor
            </CardTitle>
            <CardDescription>
              Edit the text displayed in your hero section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Badge Text */}
            <div className="space-y-2">
              <Label htmlFor="badge">Badge Text</Label>
              <div className="relative">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="badge"
                  value={content.badge_text}
                  onChange={(e) => setContent({ ...content, badge_text: e.target.value })}
                  placeholder="100+ Asset Types"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Small badge shown above the headline
              </p>
            </div>

            {/* Headline Start */}
            <div className="space-y-2">
              <Label htmlFor="headline-start">Headline (First Part)</Label>
              <Input
                id="headline-start"
                value={content.headline_start}
                onChange={(e) => setContent({ ...content, headline_start: e.target.value })}
                placeholder="Create Stunning"
              />
              <p className="text-xs text-muted-foreground">
                Regular text before the highlighted portion
              </p>
            </div>

            {/* Headline Highlight */}
            <div className="space-y-2">
              <Label htmlFor="headline-highlight">Headline (Highlighted)</Label>
              <Input
                id="headline-highlight"
                value={content.headline_highlight}
                onChange={(e) => setContent({ ...content, headline_highlight: e.target.value })}
                placeholder="Event Design Kits"
                className="text-primary"
              />
              <p className="text-xs text-muted-foreground">
                Gradient-highlighted portion of the headline
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={content.description}
                onChange={(e) => setContent({ ...content, description: e.target.value })}
                placeholder="From banners to merchandise..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Subheadline text explaining the value proposition
              </p>
            </div>

            {/* CTA Text */}
            <div className="space-y-2">
              <Label htmlFor="cta">Call to Action Button</Label>
              <Input
                id="cta"
                value={content.cta_text}
                onChange={(e) => setContent({ ...content, cta_text: e.target.value })}
                placeholder="Get Started"
              />
              <p className="text-xs text-muted-foreground">
                Text for the main call-to-action button
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="bg-gradient-to-br from-background to-muted/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Live Preview
            </CardTitle>
            <CardDescription>
              See how your hero section will look
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              key={JSON.stringify(content)}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 px-4 rounded-xl bg-background/50 border border-border"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {content.badge_text || 'Badge Text'}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl md:text-3xl font-bold mb-4">
                {content.headline_start || 'Headline Start'}{' '}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {content.headline_highlight || 'Highlighted Text'}
                </span>
              </h1>

              {/* Description */}
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                {content.description || 'Description text goes here...'}
              </p>

              {/* CTA Button */}
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                {content.cta_text || 'Get Started'}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            {hasChanges && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-amber-500 mt-4"
              >
                ⚠️ You have unsaved changes
              </motion.p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
