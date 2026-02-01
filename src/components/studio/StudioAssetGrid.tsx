import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Image as ImageIcon, Loader2, MoreVertical } from 'lucide-react';
import { Brand } from '@/types/studio.types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Demo imagery imports
import demoBanner from '@/assets/demos/demo-banner.jpg';
import demoNameTag from '@/assets/demos/demo-name-tag.jpg';
import demoSocialPost from '@/assets/demos/demo-social-post.jpg';
import demoTshirt from '@/assets/demos/demo-tshirt.jpg';
import demoInvitation from '@/assets/demos/demo-invitation.jpg';
import demoPresentation from '@/assets/demos/demo-presentation.jpg';
import demoStageBackdrop from '@/assets/demos/demo-stage-backdrop.jpg';
import demoPlaceCard from '@/assets/demos/demo-place-card.jpg';
import demoLogo from '@/assets/demos/demo-logo.jpg';
import demoTicket from '@/assets/demos/demo-ticket.jpg';
import demoVideo from '@/assets/demos/demo-video.jpg';
import demoDocuments from '@/assets/demos/demo-documents.jpg';
import demoPhoto from '@/assets/demos/demo-photo.jpg';
import demoSafety from '@/assets/demos/demo-safety.jpg';

interface StudioAssetGridProps {
  assetTypes: string[];
  brand: Brand | null;
  viewMode: 'grid' | 'list';
  selectedAssets: string[];
  onSelectAsset: (id: string) => void;
  studioGradient: string;
}

// Asset display info with demo imagery
const assetDisplayInfo: Record<string, { name: string; description: string; dimensions?: string; demoImage?: string }> = {
  // Branding
  'LOGO': { name: 'Primary Logo', description: 'Main brand logo in full color', dimensions: '1024×1024', demoImage: demoLogo },
  'LOGO_MONOCHROME': { name: 'Monochrome Logo', description: 'Single-color logo variant', dimensions: '1024×1024', demoImage: demoLogo },
  'LOGO_REVERSED': { name: 'Reversed Logo', description: 'Logo for dark backgrounds', dimensions: '1024×1024', demoImage: demoLogo },
  'PALETTE': { name: 'Color Palette', description: 'Brand color system', dimensions: '1200×800', demoImage: demoLogo },
  'SLOGANS': { name: 'Brand Taglines', description: 'Collection of brand slogans', dimensions: 'Text', demoImage: demoDocuments },
  'STYLE_GUIDE': { name: 'Style Guide', description: 'Brand usage guidelines', dimensions: 'Multi-page', demoImage: demoDocuments },
  'SEAMLESS_PATTERN': { name: 'Brand Pattern', description: 'Tileable background pattern', dimensions: '600×600', demoImage: demoLogo },
  
  // Print & Signage
  'BANNER': { name: 'Event Banner', description: 'Large format display banner', dimensions: '96×36 in', demoImage: demoBanner },
  'NAME_TAG': { name: 'Name Badge', description: 'Attendee name badge front', dimensions: '4×3 in', demoImage: demoNameTag },
  'NAME_TAG_BACK': { name: 'Badge Back', description: 'Name badge back with info', dimensions: '4×3 in', demoImage: demoNameTag },
  'EVENT_SIGNAGE': { name: 'Event Signage', description: 'General event signage', dimensions: '24×36 in', demoImage: demoBanner },
  'HANGING_SIGNAGE': { name: 'Hanging Sign', description: 'Overhead directional sign', dimensions: '48×24 in', demoImage: demoBanner },
  'OUTDOOR_SIGNAGE': { name: 'Outdoor Sign', description: 'Weather-resistant signage', dimensions: '48×36 in', demoImage: demoBanner },
  'DOOR_SIGNAGE': { name: 'Door Sign', description: 'Room identification sign', dimensions: '8×10 in', demoImage: demoBanner },
  'EASEL_SIGNAGE': { name: 'Easel Sign', description: 'Stand-mounted display', dimensions: '22×28 in', demoImage: demoBanner },
  'LOCATION_SIGNAGE': { name: 'Location Sign', description: 'Wayfinding signage', dimensions: '24×18 in', demoImage: demoBanner },
  'ROOM_SIGNAGE': { name: 'Room Sign', description: 'Room identifier', dimensions: '11×8.5 in', demoImage: demoBanner },
  'STAND_UP_PILLAR_BANNER': { name: 'Pillar Banner', description: 'Stand-up retractable banner', dimensions: '33×80 in', demoImage: demoBanner },
  'FEATHER_FLAG': { name: 'Feather Flag', description: 'Outdoor feather banner', dimensions: '15×68 in', demoImage: demoBanner },
  'TEARDROP_FLAG': { name: 'Teardrop Flag', description: 'Teardrop-shaped flag', dimensions: '24×66 in', demoImage: demoBanner },
  'FOLDER': { name: 'Presentation Folder', description: 'Document folder', dimensions: '9×12 in', demoImage: demoDocuments },
  'MENU': { name: 'Event Menu', description: 'Dining menu card', dimensions: '5×7 in', demoImage: demoPlaceCard },
  
  // Merchandise
  'TSHIRT': { name: 'T-Shirt Front', description: 'Front print design', dimensions: '12×16 in', demoImage: demoTshirt },
  'TSHIRT_BACK': { name: 'T-Shirt Back', description: 'Back print design', dimensions: '12×16 in', demoImage: demoTshirt },
  'TSHIRT_SLEEVE': { name: 'T-Shirt Sleeve', description: 'Sleeve print design', dimensions: '3×4 in', demoImage: demoTshirt },
  'HAT': { name: 'Hat Design', description: 'Cap or beanie design', dimensions: '4×2 in', demoImage: demoTshirt },
  'LANYARD': { name: 'Lanyard', description: 'Neck lanyard design', dimensions: '36×0.75 in', demoImage: demoNameTag },
  'SWAG_BAG': { name: 'Swag Bag', description: 'Tote bag design', dimensions: '14×16 in', demoImage: demoTshirt },
  'STICKER_SHEET': { name: 'Sticker Sheet', description: 'Die-cut sticker set', dimensions: '8.5×11 in', demoImage: demoTshirt },
  'WATER_BOTTLE': { name: 'Water Bottle', description: 'Bottle wrap design', dimensions: '8×3 in', demoImage: demoTshirt },
  
  // Social & Digital
  'SOCIAL_POST': { name: 'Social Post', description: 'Square social media post', dimensions: '1080×1080', demoImage: demoSocialPost },
  'SOCIAL_STORY': { name: 'Social Story', description: 'Vertical story format', dimensions: '1080×1920', demoImage: demoSocialPost },
  'EMAIL_HEADER': { name: 'Email Header', description: 'Email banner image', dimensions: '600×200', demoImage: demoSocialPost },
  'LINKEDIN_BANNER': { name: 'LinkedIn Banner', description: 'LinkedIn cover image', dimensions: '1584×396', demoImage: demoSocialPost },
  'TWITTER_HEADER': { name: 'Twitter Header', description: 'Twitter/X cover', dimensions: '1500×500', demoImage: demoSocialPost },
  'YOUTUBE_THUMBNAIL': { name: 'YouTube Thumbnail', description: 'Video thumbnail', dimensions: '1280×720', demoImage: demoSocialPost },
  'PODCAST_COVER': { name: 'Podcast Cover', description: 'Podcast artwork', dimensions: '3000×3000', demoImage: demoSocialPost },
  'ZOOM_BACKGROUND': { name: 'Zoom Background', description: 'Virtual meeting background', dimensions: '1920×1080', demoImage: demoStageBackdrop },
  'APP_ICON': { name: 'App Icon', description: 'Mobile app icon', dimensions: '1024×1024', demoImage: demoLogo },
  'FAVICON': { name: 'Favicon', description: 'Browser tab icon', dimensions: '32×32', demoImage: demoLogo },
  'EVENT_APP_SPLASH': { name: 'App Splash', description: 'Event app splash screen', dimensions: '1242×2688', demoImage: demoSocialPost },
  
  // Presentations
  'PRESENTATION_SLIDE': { name: 'Slide Template', description: 'Presentation slides', dimensions: '1920×1080', demoImage: demoPresentation },
  'WEBINAR_SLIDE': { name: 'Webinar Slide', description: 'Webinar presentation', dimensions: '1920×1080', demoImage: demoPresentation },
  'LIVE_STREAM_OVERLAY': { name: 'Stream Overlay', description: 'Live stream graphics', dimensions: '1920×1080', demoImage: demoPresentation },
  
  // Venue & Experience
  'BACK_WALL': { name: 'Back Wall', description: 'Stage backdrop panel', dimensions: '20×10 ft', demoImage: demoStageBackdrop },
  'MAIN_STAGE_BACKDROP': { name: 'Stage Backdrop', description: 'Main stage design', dimensions: '40×20 ft', demoImage: demoStageBackdrop },
  'REGISTRATION_COUNTER': { name: 'Registration Counter', description: 'Check-in desk graphic', dimensions: '10×3 ft', demoImage: demoStageBackdrop },
  'REGISTRATION_BACK_WALL': { name: 'Registration Wall', description: 'Registration backdrop', dimensions: '20×8 ft', demoImage: demoStageBackdrop },
  'KIOSK': { name: 'Info Kiosk', description: 'Interactive kiosk design', dimensions: '1080×1920', demoImage: demoStageBackdrop },
  'STEP_AND_REPEAT': { name: 'Step & Repeat', description: 'Photo backdrop', dimensions: '8×8 ft', demoImage: demoPhoto },
  'FLOOR_DECAL': { name: 'Floor Decal', description: 'Floor graphic', dimensions: '48×48 in', demoImage: demoStageBackdrop },
  'ELEVATOR_WRAP': { name: 'Elevator Wrap', description: 'Elevator door graphic', dimensions: '72×84 in', demoImage: demoStageBackdrop },
  'COLUMN_WRAP': { name: 'Column Wrap', description: 'Pillar wrap design', dimensions: '24×96 in', demoImage: demoStageBackdrop },
  'CEILING_HANGER': { name: 'Ceiling Banner', description: 'Overhead hanging sign', dimensions: '36×36 in', demoImage: demoBanner },
  
  // Invitations & Access
  'INVITATION_CARD': { name: 'Invitation', description: 'Event invitation card', dimensions: '5×7 in', demoImage: demoInvitation },
  'RSVP_CARD': { name: 'RSVP Card', description: 'Response card', dimensions: '4×6 in', demoImage: demoInvitation },
  'TICKET_DESIGN': { name: 'Event Ticket', description: 'Admission ticket', dimensions: '5.5×2 in', demoImage: demoTicket },
  'VIP_BADGE': { name: 'VIP Badge', description: 'VIP access credential', dimensions: '4×6 in', demoImage: demoTicket },
  'BACKSTAGE_PASS': { name: 'Backstage Pass', description: 'Backstage access', dimensions: '4×6 in', demoImage: demoTicket },
  'PARKING_PASS': { name: 'Parking Pass', description: 'Vehicle permit', dimensions: '4×6 in', demoImage: demoTicket },
  'WRISTBAND_DESIGN': { name: 'Wristband', description: 'Access wristband', dimensions: '10×0.75 in', demoImage: demoNameTag },
  
  // Hospitality & Dining
  'PLACE_CARD': { name: 'Place Card', description: 'Table seat card', dimensions: '3.5×2 in', demoImage: demoPlaceCard },
  'TABLE_NUMBER': { name: 'Table Number', description: 'Table identifier', dimensions: '4×6 in', demoImage: demoPlaceCard },
  'TABLE_TENT': { name: 'Table Tent', description: 'Tabletop tent card', dimensions: '4×6 in', demoImage: demoPlaceCard },
  'COASTER_DESIGN': { name: 'Coaster', description: 'Beverage coaster', dimensions: '4×4 in', demoImage: demoPlaceCard },
  'NAPKIN_DESIGN': { name: 'Napkin Print', description: 'Custom napkin design', dimensions: '5×5 in', demoImage: demoPlaceCard },
  'BAR_MENU': { name: 'Bar Menu', description: 'Beverage menu', dimensions: '4×9 in', demoImage: demoPlaceCard },
  'CATERING_LABEL': { name: 'Food Label', description: 'Dish identifier', dimensions: '3×2 in', demoImage: demoPlaceCard },
  'DIETARY_CARD': { name: 'Dietary Card', description: 'Allergen indicator', dimensions: '2×3 in', demoImage: demoPlaceCard },
  
  // Video & Motion
  'VIDEO_TEASER': { name: 'Video Teaser', description: 'Promotional video', dimensions: '1920×1080', demoImage: demoVideo },
  'ANIMATED_LOGO': { name: 'Animated Logo', description: 'Motion logo', dimensions: '1080×1080', demoImage: demoVideo },
  'MOTION_GRAPHIC': { name: 'Motion Graphic', description: 'Animated graphics', dimensions: '1920×1080', demoImage: demoVideo },
  'COUNTDOWN_TIMER': { name: 'Countdown', description: 'Event countdown', dimensions: '1920×1080', demoImage: demoVideo },
  'DIGITAL_SIGNAGE_LOOP': { name: 'Signage Loop', description: 'Digital display loop', dimensions: '1920×1080', demoImage: demoVideo },
  
  // Documents & Forms
  'PROGRAM_BOOKLET': { name: 'Program', description: 'Event program booklet', dimensions: '5.5×8.5 in', demoImage: demoDocuments },
  'PRESS_RELEASE': { name: 'Press Release', description: 'Media announcement', dimensions: '8.5×11 in', demoImage: demoDocuments },
  'MEDIA_KIT': { name: 'Media Kit', description: 'Press materials', dimensions: 'Multi-page', demoImage: demoDocuments },
  'SPONSOR_PACKAGE': { name: 'Sponsor Package', description: 'Sponsorship deck', dimensions: '16:9', demoImage: demoDocuments },
  'CERTIFICATE_AWARD': { name: 'Certificate', description: 'Award certificate', dimensions: '11×8.5 in', demoImage: demoDocuments },
  'THANK_YOU_NOTE': { name: 'Thank You', description: 'Appreciation card', dimensions: '5×7 in', demoImage: demoInvitation },
  'SESSION_EVALUATION': { name: 'Evaluation Form', description: 'Feedback form', dimensions: '8.5×11 in', demoImage: demoDocuments },
  
  // Photo & Engagement
  'PHOTO_FRAME': { name: 'Photo Frame', description: 'Shareable frame overlay', dimensions: '1080×1080', demoImage: demoPhoto },
  'SELFIE_STATION': { name: 'Selfie Station', description: 'Photo booth backdrop', dimensions: '8×8 ft', demoImage: demoPhoto },
  
  // Accessibility & Safety
  'ADA_SIGNAGE': { name: 'ADA Sign', description: 'Accessibility signage', dimensions: '8×8 in', demoImage: demoSafety },
  'EMERGENCY_EXIT': { name: 'Exit Sign', description: 'Emergency exit marker', dimensions: '12×6 in', demoImage: demoSafety },
  'HEALTH_SCREENING': { name: 'Health Sign', description: 'Health protocol sign', dimensions: '11×17 in', demoImage: demoSafety },
  'CROWD_CONTROL': { name: 'Crowd Sign', description: 'Crowd management', dimensions: '24×36 in', demoImage: demoSafety },
};

const getAssetInfo = (assetType: string) => {
  return assetDisplayInfo[assetType] || {
    name: assetType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: 'Professional event asset',
    dimensions: 'Standard',
    demoImage: demoBanner
  };
};

export const StudioAssetGrid: React.FC<StudioAssetGridProps> = ({
  assetTypes,
  brand,
  viewMode,
  selectedAssets,
  onSelectAsset,
  studioGradient
}) => {
  const [generatingAssets, setGeneratingAssets] = useState<Set<string>>(new Set());
  
  const handleGenerate = async (assetType: string) => {
    setGeneratingAssets(prev => new Set(prev).add(assetType));
    
    // Simulate generation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setGeneratingAssets(prev => {
      const next = new Set(prev);
      next.delete(assetType);
      return next;
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {assetTypes.map((assetType, index) => {
          const info = getAssetInfo(assetType);
          const isSelected = selectedAssets.includes(assetType);
          const isGenerating = generatingAssets.has(assetType);
          
          return (
            <motion.div
              key={assetType}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
              )}
              onClick={() => onSelectAsset(assetType)}
            >
              <div 
                className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                  isSelected 
                    ? "border-primary bg-primary" 
                    : "border-muted-foreground/30 group-hover:border-primary/50"
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                {info.demoImage ? (
                  <img 
                    src={info.demoImage} 
                    alt={info.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{info.name}</h3>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
              
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {info.dimensions}
              </div>
              
              <Button
                size="sm"
                className={cn("bg-gradient-to-r", studioGradient)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerate(assetType);
                }}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1" />
                    Generate
                  </>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {assetTypes.map((assetType, index) => {
        const info = getAssetInfo(assetType);
        const isSelected = selectedAssets.includes(assetType);
        const isGenerating = generatingAssets.has(assetType);
        
        return (
          <motion.div
            key={assetType}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className={cn(
              "group relative rounded-xl border overflow-hidden transition-all cursor-pointer",
              isSelected
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => onSelectAsset(assetType)}
          >
            {/* Selection Checkbox */}
            <div 
              className={cn(
                "absolute top-3 left-3 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                isSelected 
                  ? "border-primary bg-primary" 
                  : "border-white/50 bg-black/20 group-hover:border-white"
              )}
            >
              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            
            {/* More Options */}
            <button 
              className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-black/20 text-white/70 hover:bg-black/40 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {/* Preview Area with Demo Image */}
            <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
              {info.demoImage ? (
                <img 
                  src={info.demoImage} 
                  alt={info.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <>
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-10",
                    studioGradient
                  )} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                </>
              )}
              
              {/* Generate Overlay */}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <Button
                  size="sm"
                  className={cn("bg-gradient-to-r shadow-lg", studioGradient)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerate(assetType);
                  }}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
              
              {/* Loading Overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-2" />
                    <p className="text-xs text-white/80">Generating...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="p-3 bg-card">
              <h3 className="font-medium text-sm text-foreground truncate">{info.name}</h3>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground truncate">{info.description}</p>
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded inline-block">
                {info.dimensions}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
