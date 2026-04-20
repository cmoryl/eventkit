import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Clock, ArrowRight, FolderOpen, Image as ImageIcon, Plus,
  Palette, Printer, Shirt, Share2, Presentation, Building, Ticket,
  UtensilsCrossed, Video, FileText, Camera, Shield,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { StudioType, STUDIO_DEFINITIONS } from '@/types/studio.types';
import { cn } from '@/lib/utils';

// Map studio icon name strings to actual Lucide components
const STUDIO_ICON_MAP: Record<string, LucideIcon> = {
  Palette,
  Printer,
  Shirt,
  Share2,
  Presentation,
  Building,
  Ticket,
  UtensilsCrossed,
  Video,
  FileText,
  Camera,
  Shield,
};

interface RecentProject {
  id: string;
  name: string;
  description: string | null;
  updated_at: string;
  generated_assets: unknown;
  thumbnail_url?: string | null;
}

interface RecentCreationsSectionProps {
  onGetStarted: () => void;
}

export const RecentCreationsSection: React.FC<RecentCreationsSectionProps> = ({
  onGetStarted
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecentProjects();
    }
  }, [user]);

  const loadRecentProjects = async () => {
    if (!user) return;
    
    try {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, description, updated_at, generated_assets')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(4);

      if (projectsError) throw projectsError;
      
      // Extract thumbnail from generated_assets JSON (multiple possible shapes)
      // or fall back to project_assets table
      const isUsableImage = (s: unknown): s is string =>
        typeof s === 'string' &&
        (s.startsWith('http') || s.startsWith('https') || s.startsWith('data:image'));

      const findThumbnailInAssets = (assets: unknown): string | null => {
        if (!Array.isArray(assets)) return null;
        for (const a of assets as any[]) {
          if (!a || typeof a !== 'object') continue;
          // CreationStudio shape: { assetType, imageUrl, hasContent }
          if (isUsableImage(a.imageUrl)) return a.imageUrl;
          // Index.tsx shape: { id, type, title, content, ... }
          if (isUsableImage(a.content)) return a.content;
          // Other possible shapes
          if (isUsableImage(a.thumbnail)) return a.thumbnail;
          if (isUsableImage(a.url)) return a.url;
          if (isUsableImage(a.image)) return a.image;
        }
        return null;
      };

      const projectsWithThumbnails = await Promise.all(
        (projects || []).map(async (project) => {
          let thumbnail: string | null = findThumbnailInAssets(project.generated_assets);

          // Fallback: check project_assets table
          if (!thumbnail) {
            const { data: assets } = await supabase
              .from('project_assets')
              .select('content')
              .eq('project_id', project.id)
              .limit(8);

            for (const row of assets || []) {
              if (isUsableImage(row.content)) {
                thumbnail = row.content;
                break;
              }
            }
          }

          return { ...project, thumbnail_url: thumbnail };
        })
      );
      
      setRecentProjects(projectsWithThumbnails);
    } catch (error) {
      console.error('Error loading recent projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Quick access studios
  const quickAccessStudios = STUDIO_DEFINITIONS.slice(0, 6);

  if (isLoading) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Recent Creations</h2>
                <p className="text-sm text-muted-foreground">Pick up where you left off</p>
              </div>
            </div>
            {recentProjects.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onGetStarted}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {recentProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/20"
            >
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start creating your first event design kit and it will appear here
              </p>
              <Button onClick={onGetStarted}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProjects.map((project, i) => {
                const assetCount = Array.isArray(project.generated_assets) 
                  ? project.generated_assets.length 
                  : 0;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/?project=${project.id}`)}
                  >
                    {/* Preview Area */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
                      {project.thumbnail_url ? (
                        <img 
                          src={project.thumbnail_url} 
                          alt={project.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Hide broken image and show fallback
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5" />
                          {Array.isArray(project.generated_assets) && project.generated_assets.length > 0 ? (
                            <div className="relative z-10 grid grid-cols-2 gap-1.5 p-3 max-w-full">
                              {(project.generated_assets as any[]).slice(0, 4).map((a, idx) => (
                                <div
                                  key={idx}
                                  className="px-2 py-1 rounded-md bg-background/70 backdrop-blur-sm border border-border/50 text-[10px] font-medium truncate"
                                  title={a?.title || a?.type || a?.assetType}
                                >
                                  {(a?.title || a?.type || a?.assetType || 'Asset').toString().replace(/_/g, ' ')}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <ImageIcon className="w-10 h-10 text-muted-foreground/40 relative z-10" />
                          )}
                        </>
                      )}
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <Button size="sm" variant="secondary">
                          Open Project
                        </Button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-medium text-foreground truncate">{project.name}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {assetCount} asset{assetCount !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(project.updated_at)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick Access Studios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Quick Access</h2>
                <p className="text-sm text-muted-foreground">Jump into any creation studio</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickAccessStudios.map((studio, i) => {
              const StudioIcon = STUDIO_ICON_MAP[studio.icon] ?? Sparkles;
              return (
                <motion.button
                  key={studio.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(studio.route)}
                  className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all"
                  aria-label={`Open ${studio.name}`}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center transition-transform group-hover:scale-110 shadow-md",
                    studio.gradient
                  )}>
                    <StudioIcon className="w-6 h-6 text-white" strokeWidth={2.25} />
                  </div>
                  <span className="text-sm font-medium text-center">{studio.shortName}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
