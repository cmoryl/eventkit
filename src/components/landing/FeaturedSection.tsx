import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STUDIO_DEFINITIONS } from '@/types/studio.types';
import { cn } from '@/lib/utils';

// Import template images
import corporateConferenceImg from '@/assets/templates/corporate-conference-kit.jpg';
import weddingCelebrationImg from '@/assets/templates/wedding-celebration-suite.jpg';
import techSummitImg from '@/assets/templates/tech-summit-bundle.jpg';
import galaDinnerImg from '@/assets/templates/gala-dinner-awards.jpg';

const featuredTemplates = [
  {
    id: 'corporate-conference',
    title: 'Corporate Conference Kit',
    description: 'Complete branding for professional events',
    category: 'Business Events',
    studioId: 'branding',
    image: corporateConferenceImg,
    assets: ['Logo', 'Banner', 'Name Badges', 'Signage', 'Presentation'],
  },
  {
    id: 'wedding-celebration',
    title: 'Wedding Celebration Suite',
    description: 'Elegant designs for your special day',
    category: 'Social Events',
    studioId: 'invitations-access',
    image: weddingCelebrationImg,
    assets: ['Invitation', 'RSVP', 'Menu', 'Place Cards', 'Thank You'],
  },
  {
    id: 'tech-summit',
    title: 'Tech Summit Bundle',
    description: 'Modern designs for tech conferences',
    category: 'Tech Events',
    studioId: 'social-digital',
    image: techSummitImg,
    assets: ['Social Posts', 'Slides', 'Badges', 'Swag', 'Signage'],
  },
  {
    id: 'gala-dinner',
    title: 'Gala & Awards Evening',
    description: 'Sophisticated materials for formal events',
    category: 'Galas & Awards',
    studioId: 'hospitality-dining',
    image: galaDinnerImg,
    assets: ['Invitation', 'Program', 'Menu', 'Certificate', 'Backdrop'],
  },
];

const trendingStudios = [
  { ...STUDIO_DEFINITIONS[0], usageLabel: 'Most popular' },
  { ...STUDIO_DEFINITIONS[3], usageLabel: 'Trending' },
  { ...STUDIO_DEFINITIONS[1], usageLabel: 'High demand' },
];

export const FeaturedSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="max-w-6xl mx-auto">
        {/* Featured Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Featured Templates</h2>
                <p className="text-sm text-muted-foreground">Curated event design collections</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {featuredTemplates.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-xl transition-all overflow-hidden cursor-pointer"
                onClick={() => navigate(`/studio/${template.studioId}`)}
              >
                <div className="flex">
                  {/* Visual Side - Now with real image */}
                  <div className="w-2/5 relative overflow-hidden">
                    <img 
                      src={template.image} 
                      alt={template.title}
                      className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/50" />
                  </div>

                  {/* Content Side */}
                  <div className="flex-1 p-5">
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">
                      {template.category}
                    </span>
                    <h3 className="text-lg font-bold mt-1 mb-2">{template.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>
                    
                    {/* Assets Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {template.assets.slice(0, 4).map((asset) => (
                        <span 
                          key={asset}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          {asset}
                        </span>
                      ))}
                      {template.assets.length > 4 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          +{template.assets.length - 4} more
                        </span>
                      )}
                    </div>

                    <Button size="sm" variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80">
                      Start Creating <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trending Studios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Trending Studios</h2>
              <p className="text-sm text-muted-foreground">What creators are using right now</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {trendingStudios.map((studio, i) => (
              <motion.div
                key={studio.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer p-4"
                onClick={() => navigate(studio.route)}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
                    studio.gradient
                  )}>
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{studio.shortName}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {studio.usageLabel}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {studio.description}
                    </p>
                    <p className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Studio →
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
