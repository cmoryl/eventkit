import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AssetType } from '@/types';
import { StudioType } from '@/types/studio.types';

// Import studio images
import studioBrandingImg from '@/assets/studios/studio-branding.jpg';
import studioPrintImg from '@/assets/studios/studio-print.jpg';
import studioMerchImg from '@/assets/studios/studio-merch.jpg';
import studioSocialImg from '@/assets/studios/studio-social.jpg';
import studioPresentationsImg from '@/assets/studios/studio-presentations.jpg';
import studioVenueImg from '@/assets/studios/studio-venue.jpg';
import studioInvitationsImg from '@/assets/studios/studio-invitations.jpg';
import studioDiningImg from '@/assets/studios/studio-dining.jpg';
import studioVideoImg from '@/assets/studios/studio-video.jpg';
import studioDocsImg from '@/assets/studios/studio-docs.jpg';
import studioPhotoImg from '@/assets/studios/studio-photo.jpg';
import studioSafetyImg from '@/assets/studios/studio-safety.jpg';

interface ShowcaseAsset {
  id: string;
  image: string;
  title: string;
  gradient: string;
  assetType: AssetType;
  studioId: StudioType;
}

// Import demo images for additional variety
import demoBanner from '@/assets/demos/demo-banner.jpg';
import demoNameTag from '@/assets/demos/demo-name-tag.jpg';
import demoSocialPost from '@/assets/demos/demo-social-post.jpg';
import demoTshirt from '@/assets/demos/demo-tshirt.jpg';
import demoTicket from '@/assets/demos/demo-ticket.jpg';
import demoPlaceCard from '@/assets/demos/demo-place-card.jpg';
import demoLanyard from '@/assets/demos/demo-lanyard.jpg';
import demoRollupBanner from '@/assets/demos/demo-rollup-banner.jpg';
import demoStepRepeat from '@/assets/demos/demo-step-repeat.jpg';
import demoInvitation from '@/assets/demos/demo-invitation.jpg';
import demoMenu from '@/assets/demos/demo-menu.jpg';
import demoCertificate from '@/assets/demos/demo-certificate.jpg';
import demoWristband from '@/assets/demos/demo-wristband.jpg';
import demoSponsorWall from '@/assets/demos/demo-sponsor-wall.jpg';
import demoFloorDecal from '@/assets/demos/demo-floor-decal.jpg';
import demoTableTent from '@/assets/demos/demo-table-tent.jpg';
import demoPhotoBoothFrame from '@/assets/demos/demo-photo-booth-frame.jpg';
import demoLinkedinBanner from '@/assets/demos/demo-linkedin-banner.jpg';
import demoZoomBackground from '@/assets/demos/demo-zoom-background.jpg';
import demoSwagBag from '@/assets/demos/demo-swag-bag.jpg';

// Map assets to their studios with images - expanded with more variety
const topRowAssets: ShowcaseAsset[] = [
  { id: 'branding', image: studioBrandingImg, title: 'Branding', gradient: 'from-violet-500 to-purple-600', assetType: AssetType.Logo, studioId: 'branding' },
  { id: 'banner', image: studioPrintImg, title: 'Print', gradient: 'from-blue-500 to-cyan-500', assetType: AssetType.Banner, studioId: 'print-signage' },
  { id: 'tshirt', image: studioMerchImg, title: 'Merch', gradient: 'from-orange-500 to-red-500', assetType: AssetType.Tshirt, studioId: 'merchandise' },
  { id: 'social', image: studioSocialImg, title: 'Social', gradient: 'from-pink-500 to-rose-500', assetType: AssetType.SocialPost, studioId: 'social-digital' },
  { id: 'presentation', image: studioPresentationsImg, title: 'Slides', gradient: 'from-emerald-500 to-teal-500', assetType: AssetType.Presentation, studioId: 'presentations' },
  { id: 'venue', image: studioVenueImg, title: 'Venue', gradient: 'from-indigo-500 to-blue-600', assetType: AssetType.MainStageBackdrop, studioId: 'venue-experience' },
  // Additional assets for variety
  { id: 'banners', image: demoBanner, title: 'Banners', gradient: 'from-cyan-500 to-blue-600', assetType: AssetType.Banner, studioId: 'print-signage' },
  { id: 'nametags', image: demoNameTag, title: 'Badges', gradient: 'from-purple-500 to-indigo-500', assetType: AssetType.NameTag, studioId: 'print-signage' },
  { id: 'lanyards', image: demoLanyard, title: 'Lanyards', gradient: 'from-sky-500 to-blue-500', assetType: AssetType.Lanyard, studioId: 'merchandise' },
  { id: 'rollup', image: demoRollupBanner, title: 'Roll-Ups', gradient: 'from-amber-500 to-orange-500', assetType: AssetType.StandUpPillarBanner, studioId: 'print-signage' },
  { id: 'steprepeat', image: demoStepRepeat, title: 'Step & Repeat', gradient: 'from-fuchsia-500 to-pink-500', assetType: AssetType.StepAndRepeat, studioId: 'venue-experience' },
  { id: 'sponsorwall', image: demoSponsorWall, title: 'Sponsors', gradient: 'from-slate-500 to-zinc-600', assetType: AssetType.SponsorWall, studioId: 'venue-experience' },
];

const bottomRowAssets: ShowcaseAsset[] = [
  { id: 'invites', image: studioInvitationsImg, title: 'Invites', gradient: 'from-amber-500 to-yellow-500', assetType: AssetType.InvitationCard, studioId: 'invitations-access' },
  { id: 'dining', image: studioDiningImg, title: 'Dining', gradient: 'from-lime-500 to-green-500', assetType: AssetType.Menu, studioId: 'hospitality-dining' },
  { id: 'video', image: studioVideoImg, title: 'Video', gradient: 'from-red-500 to-pink-600', assetType: AssetType.VideoTeaser, studioId: 'video-motion' },
  { id: 'docs', image: studioDocsImg, title: 'Docs', gradient: 'from-slate-500 to-gray-600', assetType: AssetType.ProgramBooklet, studioId: 'documents-forms' },
  { id: 'photo', image: studioPhotoImg, title: 'Photo', gradient: 'from-fuchsia-500 to-purple-600', assetType: AssetType.PhotoBoothFrame, studioId: 'photo-engagement' },
  { id: 'safety', image: studioSafetyImg, title: 'Safety', gradient: 'from-green-500 to-emerald-600', assetType: AssetType.AccessibilitySignage, studioId: 'accessibility-safety' },
  // Additional assets for variety
  { id: 'tickets', image: demoTicket, title: 'Tickets', gradient: 'from-yellow-500 to-orange-500', assetType: AssetType.TicketDesign, studioId: 'invitations-access' },
  { id: 'placecards', image: demoPlaceCard, title: 'Seating', gradient: 'from-teal-500 to-cyan-500', assetType: AssetType.PlaceCard, studioId: 'hospitality-dining' },
  { id: 'invitation', image: demoInvitation, title: 'RSVP', gradient: 'from-rose-500 to-pink-500', assetType: AssetType.InvitationCard, studioId: 'invitations-access' },
  { id: 'menus', image: demoMenu, title: 'Menus', gradient: 'from-emerald-500 to-green-500', assetType: AssetType.Menu, studioId: 'hospitality-dining' },
  { id: 'certificates', image: demoCertificate, title: 'Certificates', gradient: 'from-amber-400 to-yellow-500', assetType: AssetType.CertificateAward, studioId: 'documents-forms' },
  { id: 'wristbands', image: demoWristband, title: 'Wristbands', gradient: 'from-violet-500 to-purple-500', assetType: AssetType.WristbandDesign, studioId: 'invitations-access' },
  { id: 'floordecal', image: demoFloorDecal, title: 'Floor Decals', gradient: 'from-blue-500 to-indigo-500', assetType: AssetType.FloorDecal, studioId: 'venue-experience' },
  { id: 'tabletent', image: demoTableTent, title: 'Table Tents', gradient: 'from-orange-400 to-red-500', assetType: AssetType.TableTent, studioId: 'hospitality-dining' },
  { id: 'photoframe', image: demoPhotoBoothFrame, title: 'Photo Frames', gradient: 'from-pink-400 to-rose-500', assetType: AssetType.PhotoBoothFrame, studioId: 'photo-engagement' },
  { id: 'linkedin', image: demoLinkedinBanner, title: 'LinkedIn', gradient: 'from-blue-600 to-blue-800', assetType: AssetType.LinkedInBanner, studioId: 'social-digital' },
  { id: 'zoom', image: demoZoomBackground, title: 'Zoom BG', gradient: 'from-cyan-400 to-blue-500', assetType: AssetType.ZoomBackground, studioId: 'social-digital' },
  { id: 'swagbag', image: demoSwagBag, title: 'Swag Bags', gradient: 'from-purple-400 to-indigo-500', assetType: AssetType.SwagBag, studioId: 'merchandise' },
];

const IconCard: React.FC<{
  asset: ShowcaseAsset;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (studioId: StudioType) => void;
}> = ({ asset, isHovered, onHover, onClick }) => {
  const handleClick = () => {
    onClick(asset.studioId);
  };
  
  return (
    <motion.div
      className="flex-shrink-0 cursor-pointer"
      onMouseEnter={() => onHover(asset.id)}
      onMouseLeave={() => onHover(null)}
      onClick={handleClick}
      whileHover={{ scale: 1.05, y: -6 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className={cn(
        "relative flex flex-col items-center gap-2 px-3 sm:px-4 py-3 sm:py-4 rounded-2xl transition-all duration-300",
        isHovered ? "bg-card/95 shadow-2xl z-20" : "bg-transparent"
      )}>
        {/* Glow effect - subtle */}
        <div className={cn(
          "absolute inset-0 rounded-2xl blur-xl transition-opacity duration-300 -z-10",
          `bg-gradient-to-br ${asset.gradient}`,
          isHovered ? "opacity-20" : "opacity-0"
        )} />
        
        {/* Image Card - Fixed sizing with proper overflow visible */}
        <div 
          className={cn(
            "relative rounded-xl shadow-lg transition-all duration-300 overflow-visible",
            isHovered 
              ? "w-32 h-32 sm:w-40 sm:h-40 shadow-2xl ring-2 ring-primary/60" 
              : "w-20 h-20 sm:w-24 sm:h-24"
          )}
        >
          <img 
            src={asset.image} 
            alt={asset.title}
            className="w-full h-full object-cover rounded-xl"
          />
          {/* Gradient overlay - less on hover */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 rounded-xl",
            isHovered ? "opacity-10" : "opacity-30"
          )} />
        </div>
        
        {/* Label */}
        <span className={cn(
          "text-xs sm:text-sm font-medium transition-all duration-300 mt-1",
          isHovered ? "text-foreground text-sm sm:text-base" : "text-muted-foreground"
        )}>
          {asset.title}
        </span>
      </div>
    </motion.div>
  );
};

const ScrollingRow: React.FC<{
  assets: ShowcaseAsset[];
  direction: 'left' | 'right';
  speed?: number;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onStudioClick: (studioId: StudioType) => void;
}> = ({ assets, direction, speed = 30, hoveredId, onHover, onStudioClick }) => {
  // Duplicate for seamless loop
  const duplicatedAssets = [...assets, ...assets, ...assets];
  const isPaused = hoveredId !== null;
  
  return (
    <div className="relative overflow-hidden py-4">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <motion.div
        className="flex gap-3 sm:gap-5"
        animate={{
          x: direction === 'left' 
            ? ['0%', '-33.333%'] 
            : ['-33.333%', '0%']
        }}
        transition={{
          x: {
            duration: speed,
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'loop',
          }
        }}
        style={{
          animationPlayState: isPaused ? 'paused' : 'running'
        }}
      >
        {duplicatedAssets.map((asset, i) => (
          <IconCard
            key={`${asset.id}-${i}`}
            asset={asset}
            isHovered={hoveredId === asset.id}
            onHover={onHover}
            onClick={onStudioClick}
          />
        ))}
      </motion.div>
    </div>
  );
};

interface AssetShowcaseProps {
  embedded?: boolean;
  isAuthenticated?: boolean;
  onAssetClick?: (assetType: AssetType) => void;
}

export const AssetShowcase: React.FC<AssetShowcaseProps> = ({ 
  embedded = false,
  isAuthenticated = false,
  onAssetClick
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleStudioClick = (studioId: StudioType) => {
    navigate(`/studio/${studioId}`);
  };

  // Embedded version (no header, no stats - for use inside hero)
  if (embedded) {
    return (
      <div className="w-full overflow-hidden">
        <div className="space-y-4 sm:space-y-5 pb-6">
          <ScrollingRow
            assets={topRowAssets}
            direction="left"
            speed={50}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onStudioClick={handleStudioClick}
          />
          <ScrollingRow
            assets={bottomRowAssets}
            direction="right"
            speed={55}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onStudioClick={handleStudioClick}
          />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-muted-foreground"
        >
          <span className="text-primary font-medium">✨ Click any studio</span> to start creating
        </motion.p>
      </div>
    );
  }

  // Full standalone version
  return (
    <section className="py-20 sm:py-28 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background pointer-events-none" />
      
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 px-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            16 Asset Categories
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            From branding to video, each studio is a complete production toolkit for your event assets.
          </p>
        </motion.div>

        <div className="space-y-4 sm:space-y-6">
          <ScrollingRow
            assets={topRowAssets}
            direction="left"
            speed={55}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onStudioClick={handleStudioClick}
          />
          <ScrollingRow
            assets={bottomRowAssets}
            direction="right"
            speed={60}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onStudioClick={handleStudioClick}
          />
        </div>
      </div>
    </section>
  );
};
