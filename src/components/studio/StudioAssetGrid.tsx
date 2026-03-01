import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Image as ImageIcon, Loader2, MoreVertical, ZoomIn, Pencil, Edit3, Film } from 'lucide-react';
import { Brand } from '@/types/studio.types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AssetGenerationCanvas } from './AssetGenerationCanvas';
import { TemplateWorkflowModal } from './TemplateWorkflowModal';
import { VisualEditor } from '@/components/visualEditor';
import { AnimatedBannerEditor } from '@/components/animatedBanner';
import { isAnimatableAsset } from '@/config/animationPresets';
import { SlideEditor } from '@/components/slides/SlideEditor';
import { VideoStudioEditor } from '@/components/videoStudio/VideoStudioEditor';
import MerchMockupOverlay, { MERCH_MOCKUP_TYPES } from './MerchMockupOverlay';
import { ColorPaletteEditor } from './ColorPaletteEditor';

// Presentation asset types that should open the slide editor
const PRESENTATION_ASSET_TYPES = ['PRESENTATION_SLIDE', 'WEBINAR_SLIDE'];
// Asset types that open the palette editor
const PALETTE_ASSET_TYPES = ['PALETTE'];
// Video asset types that should open the video studio editor
const VIDEO_ASSET_TYPES = ['VIDEO_TEASER', 'MOTION_GRAPHIC', 'DIGITAL_SIGNAGE_LOOP'];
// Demo imagery imports - Core assets
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

// Hyper-realistic demo images - Batch 1 (Merchandise & Print)
import demoSwagBag from '@/assets/demos/demo-swag-bag.jpg';
import demoLanyard from '@/assets/demos/demo-lanyard.jpg';
import demoHat from '@/assets/demos/demo-hat.jpg';
import demoWaterBottle from '@/assets/demos/demo-water-bottle.jpg';
import demoStickers from '@/assets/demos/demo-stickers.jpg';
import demoMenu from '@/assets/demos/demo-menu.jpg';
import demoVipPass from '@/assets/demos/demo-vip-pass.jpg';
import demoCoaster from '@/assets/demos/demo-coaster.jpg';
import demoCertificate from '@/assets/demos/demo-certificate.jpg';
import demoFloorDecal from '@/assets/demos/demo-floor-decal.jpg';
import demoRollupBanner from '@/assets/demos/demo-rollup-banner.jpg';
import demoWristband from '@/assets/demos/demo-wristband.jpg';

// Hyper-realistic demo images - Batch 2 (Signage & Digital)
import demoNameTagFront from '@/assets/demos/demo-name-tag-front.jpg';
import demoEventSignage from '@/assets/demos/demo-event-signage.jpg';
import demoHangingSignage from '@/assets/demos/demo-hanging-signage.jpg';
import demoSocialStory from '@/assets/demos/demo-social-story.jpg';
import demoEmailHeader from '@/assets/demos/demo-email-header.jpg';
import demoYoutubeThumbnail from '@/assets/demos/demo-youtube-thumbnail.jpg';
import demoPodcastCover from '@/assets/demos/demo-podcast-cover.jpg';
import demoZoomBackground from '@/assets/demos/demo-zoom-background.jpg';
import demoStepRepeat from '@/assets/demos/demo-step-repeat.jpg';
import demoTableNumber from '@/assets/demos/demo-table-number.jpg';
import demoRegistrationCounter from '@/assets/demos/demo-registration-counter.jpg';
import demoKiosk from '@/assets/demos/demo-kiosk.jpg';
import demoBackstagePass from '@/assets/demos/demo-backstage-pass.jpg';
import demoRsvpCard from '@/assets/demos/demo-rsvp-card.jpg';
import demoTableTent from '@/assets/demos/demo-table-tent.jpg';
import demoProgramBooklet from '@/assets/demos/demo-program-booklet.jpg';
import demoPhotoBoothFrame from '@/assets/demos/demo-photo-booth-frame.jpg';
import demoAnimatedLogo from '@/assets/demos/demo-animated-logo.jpg';

// Hyper-realistic demo images - Batch 3 (Branding & Signage)
import demoLogoMonochrome from '@/assets/demos/demo-logo-monochrome.jpg';
import demoLogoReversed from '@/assets/demos/demo-logo-reversed.jpg';
import demoPalette from '@/assets/demos/demo-palette.jpg';
import demoStyleGuide from '@/assets/demos/demo-style-guide.jpg';
import demoPattern from '@/assets/demos/demo-pattern.jpg';
import demoOutdoorSignage from '@/assets/demos/demo-outdoor-signage.jpg';
import demoDoorSignage from '@/assets/demos/demo-door-signage.jpg';
import demoEaselSignage from '@/assets/demos/demo-easel-signage.jpg';
import demoLocationSignage from '@/assets/demos/demo-location-signage.jpg';
import demoRoomSignage from '@/assets/demos/demo-room-signage.jpg';
import demoFeatherFlag from '@/assets/demos/demo-feather-flag.jpg';
import demoTeardropFlag from '@/assets/demos/demo-teardrop-flag.jpg';
import demoFolder from '@/assets/demos/demo-folder.jpg';

// Hyper-realistic demo images - Batch 4 (Apparel & Social)
import demoTshirtBack from '@/assets/demos/demo-tshirt-back.jpg';
import demoTshirtSleeve from '@/assets/demos/demo-tshirt-sleeve.jpg';
import demoLinkedinBanner from '@/assets/demos/demo-linkedin-banner.jpg';
import demoTwitterHeader from '@/assets/demos/demo-twitter-header.jpg';
import demoAppIcon from '@/assets/demos/demo-app-icon.jpg';
import demoFavicon from '@/assets/demos/demo-favicon.jpg';
import demoAppSplash from '@/assets/demos/demo-app-splash.jpg';

// Hyper-realistic demo images - Batch 5 (Venue & Presentations)
import demoWebinarSlide from '@/assets/demos/demo-webinar-slide.jpg';
import demoStreamOverlay from '@/assets/demos/demo-stream-overlay.jpg';
import demoBackWall from '@/assets/demos/demo-back-wall.jpg';
import demoRegistrationWall from '@/assets/demos/demo-registration-wall.jpg';
import demoElevatorWrap from '@/assets/demos/demo-elevator-wrap.jpg';
import demoColumnWrap from '@/assets/demos/demo-column-wrap.jpg';
import demoCeilingHanger from '@/assets/demos/demo-ceiling-hanger.jpg';
import demoParkingPass from '@/assets/demos/demo-parking-pass.jpg';

// Hyper-realistic demo images - Batch 6 (Hospitality & Dining)
import demoNapkin from '@/assets/demos/demo-napkin.jpg';
import demoBarMenu from '@/assets/demos/demo-bar-menu.jpg';
import demoCateringLabel from '@/assets/demos/demo-catering-label.jpg';
import demoDietaryCard from '@/assets/demos/demo-dietary-card.jpg';

// Hyper-realistic demo images - Batch 7 (Video & Documents)
import demoMotionGraphic from '@/assets/demos/demo-motion-graphic.jpg';
import demoCountdown from '@/assets/demos/demo-countdown.jpg';
import demoSignageLoop from '@/assets/demos/demo-signage-loop.jpg';
import demoPressRelease from '@/assets/demos/demo-press-release.jpg';
import demoMediaKit from '@/assets/demos/demo-media-kit.jpg';
import demoSponsorPackage from '@/assets/demos/demo-sponsor-package.jpg';
import demoThankYou from '@/assets/demos/demo-thank-you.jpg';
import demoEvaluationForm from '@/assets/demos/demo-evaluation-form.jpg';

// Hyper-realistic demo images - Batch 8 (Photo & Safety)
import demoPhotoFrame from '@/assets/demos/demo-photo-frame.jpg';
import demoSelfieStation from '@/assets/demos/demo-selfie-station.jpg';
import demoAdaSignage from '@/assets/demos/demo-ada-signage.jpg';
import demoEmergencyExit from '@/assets/demos/demo-emergency-exit.jpg';
import demoHealthScreening from '@/assets/demos/demo-health-screening.jpg';
import demoCrowdControl from '@/assets/demos/demo-crowd-control.jpg';
import demoSlogans from '@/assets/demos/demo-slogans.jpg';

// Hyper-realistic demo images - Batch 9 (Accessibility & Safety NEW)
import demoAccessibilitySignage from '@/assets/demos/demo-accessibility-signage.jpg';
import demoVolunteerVest from '@/assets/demos/demo-volunteer-vest.jpg';
import demoSecurityBadge from '@/assets/demos/demo-security-badge.jpg';
import demoMediaCredential from '@/assets/demos/demo-media-credential.jpg';
import demoFloorPlan from '@/assets/demos/demo-floor-plan.jpg';
import demoWifiSign from '@/assets/demos/demo-wifi-sign.jpg';
import demoQrCode from '@/assets/demos/demo-qr-code.jpg';
import demoAgendaHighlights from '@/assets/demos/demo-agenda-highlights.jpg';

// Hyper-realistic demo images - Batch 10 (Photo & Engagement NEW)
import demoPhotoBoothProps from '@/assets/demos/demo-photo-booth-props.jpg';
import demoNetworkingBingo from '@/assets/demos/demo-networking-bingo.jpg';
import demoScavengerHunt from '@/assets/demos/demo-scavenger-hunt.jpg';
import demoPollCard from '@/assets/demos/demo-poll-card.jpg';
import demoSpeakerIntro from '@/assets/demos/demo-speaker-intro.jpg';
import demoBreakoutSession from '@/assets/demos/demo-breakout-session.jpg';
import demoSelfieFrame from '@/assets/demos/demo-selfie-frame.jpg';

// Hyper-realistic demo images - Batch 11 (Venue & Experience NEW)
import demoTableRunner from '@/assets/demos/demo-table-runner.jpg';
import demoTablecloth from '@/assets/demos/demo-tablecloth.jpg';
import demoCocktailNapkin from '@/assets/demos/demo-cocktail-napkin.jpg';
import demoEscalatorGraphics from '@/assets/demos/demo-escalator-graphics.jpg';
import demoStairGraphics from '@/assets/demos/demo-stair-graphics.jpg';
import demoWindowCling from '@/assets/demos/demo-window-cling.jpg';
import demoAFrame from '@/assets/demos/demo-a-frame.jpg';
import demoLoadingDock from '@/assets/demos/demo-loading-dock.jpg';
import demoVipLounge from '@/assets/demos/demo-vip-lounge.jpg';
import demoGreenRoom from '@/assets/demos/demo-green-room.jpg';
import demoShuttleSignage from '@/assets/demos/demo-shuttle-signage.jpg';
import demoGiftBox from '@/assets/demos/demo-gift-box.jpg';
import demoMatchbook from '@/assets/demos/demo-matchbook.jpg';
import demoEnvelope from '@/assets/demos/demo-envelope.jpg';
import demoLiveStreamOverlay from '@/assets/demos/demo-live-stream-overlay.jpg';
import demoHybridEvent from '@/assets/demos/demo-hybrid-event.jpg';
import demoArMarker from '@/assets/demos/demo-ar-marker.jpg';
import demoFeedbackKiosk from '@/assets/demos/demo-feedback-kiosk.jpg';
import demoVenueTour3d from '@/assets/demos/demo-venue-tour-3d.jpg';
import demoSeatingChart from '@/assets/demos/demo-seating-chart.jpg';
import demoSocialProfile from '@/assets/demos/demo-social-profile.jpg';
import demoGlassDoor from '@/assets/demos/demo-glass-door.jpg';
import demoGlassDoubleDoor from '@/assets/demos/demo-glass-double-door.jpg';
import demoRotatingDoor from '@/assets/demos/demo-rotating-door.jpg';
import demoPortableBillboard from '@/assets/demos/demo-portable-billboard.jpg';
import demoWelcomeCounter from '@/assets/demos/demo-welcome-counter.jpg';
import demoTechCounter from '@/assets/demos/demo-tech-counter.jpg';

interface StudioAssetGridProps {
  assetTypes: string[];
  brand: Brand | null;
  viewMode: 'grid' | 'list';
  selectedAssets: string[];
  onSelectAsset: (id: string) => void;
  studioGradient: string;
}

// Asset display info with demo imagery - FULLY UNIQUE IMAGES
const assetDisplayInfo: Record<string, { name: string; description: string; dimensions?: string; demoImage?: string }> = {
  // Branding
  'LOGO': { name: 'Primary Logo', description: 'Main brand logo in full color', dimensions: '1024×1024', demoImage: demoLogo },
  'LOGO_MONOCHROME': { name: 'Monochrome Logo', description: 'Single-color logo variant', dimensions: '1024×1024', demoImage: demoLogoMonochrome },
  'LOGO_REVERSED': { name: 'Reversed Logo', description: 'Logo for dark backgrounds', dimensions: '1024×1024', demoImage: demoLogoReversed },
  'PALETTE': { name: 'Color Palette', description: 'Brand color system', dimensions: '1200×800', demoImage: demoPalette },
  'SLOGANS': { name: 'Brand Taglines', description: 'Collection of brand slogans', dimensions: 'Text', demoImage: demoSlogans },
  'STYLE_GUIDE': { name: 'Style Guide', description: 'Brand usage guidelines', dimensions: 'Multi-page', demoImage: demoStyleGuide },
  'SEAMLESS_PATTERN': { name: 'Brand Pattern', description: 'Tileable background pattern', dimensions: '600×600', demoImage: demoPattern },
  
  // Print & Signage
  'BANNER': { name: 'Event Banner', description: 'Large format display banner', dimensions: '96×36 in', demoImage: demoBanner },
  'NAME_TAG': { name: 'Name Badge', description: 'Attendee name badge front', dimensions: '4×3 in', demoImage: demoNameTagFront },
  'NAME_TAG_BACK': { name: 'Badge Back', description: 'Name badge back with info', dimensions: '4×3 in', demoImage: demoNameTag },
  'EVENT_SIGNAGE': { name: 'Event Signage', description: 'General event signage', dimensions: '24×36 in', demoImage: demoEventSignage },
  'HANGING_SIGNAGE': { name: 'Hanging Sign', description: 'Overhead directional sign', dimensions: '48×24 in', demoImage: demoHangingSignage },
  'OUTDOOR_SIGNAGE': { name: 'Outdoor Sign', description: 'Weather-resistant signage', dimensions: '48×36 in', demoImage: demoOutdoorSignage },
  'DOOR_SIGNAGE': { name: 'Door Sign', description: 'Room identification sign', dimensions: '8×10 in', demoImage: demoDoorSignage },
  'EASEL_SIGNAGE': { name: 'Easel Sign', description: 'Stand-mounted display', dimensions: '22×28 in', demoImage: demoEaselSignage },
  'LOCATION_SIGNAGE': { name: 'Location Sign', description: 'Wayfinding signage', dimensions: '24×18 in', demoImage: demoLocationSignage },
  'ROOM_SIGNAGE': { name: 'Room Sign', description: 'Room identifier', dimensions: '11×8.5 in', demoImage: demoRoomSignage },
  'STAND_UP_PILLAR_BANNER': { name: 'Pillar Banner', description: 'Stand-up retractable banner', dimensions: '33×80 in', demoImage: demoRollupBanner },
  'FEATHER_FLAG': { name: 'Feather Flag', description: 'Outdoor feather banner', dimensions: '15×68 in', demoImage: demoFeatherFlag },
  'TEARDROP_FLAG': { name: 'Teardrop Flag', description: 'Teardrop-shaped flag', dimensions: '24×66 in', demoImage: demoTeardropFlag },
  'FOLDER': { name: 'Presentation Folder', description: 'Document folder', dimensions: '9×12 in', demoImage: demoFolder },
  'MENU': { name: 'Event Menu', description: 'Dining menu card', dimensions: '5×7 in', demoImage: demoMenu },
  
  // Merchandise
  'TSHIRT': { name: 'T-Shirt Front', description: 'Front print design', dimensions: '12×16 in', demoImage: demoTshirt },
  'TSHIRT_BACK': { name: 'T-Shirt Back', description: 'Back print design', dimensions: '12×16 in', demoImage: demoTshirtBack },
  'TSHIRT_SLEEVE': { name: 'T-Shirt Sleeve', description: 'Sleeve print design', dimensions: '3×4 in', demoImage: demoTshirtSleeve },
  'HAT': { name: 'Hat Design', description: 'Cap or beanie design', dimensions: '4×2 in', demoImage: demoHat },
  'LANYARD': { name: 'Lanyard', description: 'Neck lanyard design', dimensions: '36×0.75 in', demoImage: demoLanyard },
  'SWAG_BAG': { name: 'Swag Bag', description: 'Tote bag design', dimensions: '14×16 in', demoImage: demoSwagBag },
  'STICKER_SHEET': { name: 'Sticker Sheet', description: 'Die-cut sticker set', dimensions: '8.5×11 in', demoImage: demoStickers },
  'WATER_BOTTLE': { name: 'Water Bottle', description: 'Bottle wrap design', dimensions: '8×3 in', demoImage: demoWaterBottle },
  
  // Social & Digital
  'SOCIAL_POST': { name: 'Social Post', description: 'Square social media post', dimensions: '1080×1080', demoImage: demoSocialPost },
  'SOCIAL_STORY': { name: 'Social Story', description: 'Vertical story format', dimensions: '1080×1920', demoImage: demoSocialStory },
  'EMAIL_HEADER': { name: 'Email Header', description: 'Email banner image', dimensions: '600×200', demoImage: demoEmailHeader },
  'LINKEDIN_BANNER': { name: 'LinkedIn Banner', description: 'LinkedIn cover image', dimensions: '1584×396', demoImage: demoLinkedinBanner },
  'TWITTER_HEADER': { name: 'Twitter Header', description: 'Twitter/X cover', dimensions: '1500×500', demoImage: demoTwitterHeader },
  'YOUTUBE_THUMBNAIL': { name: 'YouTube Thumbnail', description: 'Video thumbnail', dimensions: '1280×720', demoImage: demoYoutubeThumbnail },
  'PODCAST_COVER': { name: 'Podcast Cover', description: 'Podcast artwork', dimensions: '3000×3000', demoImage: demoPodcastCover },
  'ZOOM_BACKGROUND': { name: 'Zoom Background', description: 'Virtual meeting background', dimensions: '1920×1080', demoImage: demoZoomBackground },
  'APP_ICON': { name: 'App Icon', description: 'Mobile app icon', dimensions: '1024×1024', demoImage: demoAppIcon },
  'FAVICON': { name: 'Favicon', description: 'Browser tab icon', dimensions: '32×32', demoImage: demoFavicon },
  'EVENT_APP_SPLASH': { name: 'App Splash', description: 'Event app splash screen', dimensions: '1242×2688', demoImage: demoAppSplash },
  
  // Presentations
  'PRESENTATION_SLIDE': { name: 'Slide Template', description: 'Presentation slides', dimensions: '1920×1080', demoImage: demoPresentation },
  'WEBINAR_SLIDE': { name: 'Webinar Slide', description: 'Webinar presentation', dimensions: '1920×1080', demoImage: demoWebinarSlide },
  'LIVE_STREAM_OVERLAY': { name: 'Stream Overlay', description: 'Live stream graphics', dimensions: '1920×1080', demoImage: demoStreamOverlay },
  
  // Venue & Experience
  'BACK_WALL': { name: 'Back Wall', description: 'Stage backdrop panel', dimensions: '20×10 ft', demoImage: demoBackWall },
  'MAIN_STAGE_BACKDROP': { name: 'Stage Backdrop', description: 'Main stage design', dimensions: '40×20 ft', demoImage: demoStageBackdrop },
  'REGISTRATION_COUNTER': { name: 'Registration Counter', description: 'Check-in desk graphic', dimensions: '10×3 ft', demoImage: demoRegistrationCounter },
  'REGISTRATION_BACK_WALL': { name: 'Registration Wall', description: 'Registration backdrop', dimensions: '20×8 ft', demoImage: demoRegistrationWall },
  'KIOSK': { name: 'Info Kiosk', description: 'Interactive kiosk design', dimensions: '1080×1920', demoImage: demoKiosk },
  'STEP_AND_REPEAT': { name: 'Step & Repeat', description: 'Photo backdrop', dimensions: '8×8 ft', demoImage: demoStepRepeat },
  'FLOOR_DECAL': { name: 'Floor Decal', description: 'Floor graphic', dimensions: '48×48 in', demoImage: demoFloorDecal },
  'ELEVATOR_WRAP': { name: 'Elevator Wrap', description: 'Elevator door graphic', dimensions: '72×84 in', demoImage: demoElevatorWrap },
  'COLUMN_WRAP': { name: 'Column Wrap', description: 'Pillar wrap design', dimensions: '24×96 in', demoImage: demoColumnWrap },
  'CEILING_HANGER': { name: 'Ceiling Banner', description: 'Overhead hanging sign', dimensions: '36×36 in', demoImage: demoCeilingHanger },
  
  // Invitations & Access
  'INVITATION_CARD': { name: 'Invitation', description: 'Event invitation card', dimensions: '5×7 in', demoImage: demoInvitation },
  'RSVP_CARD': { name: 'RSVP Card', description: 'Response card', dimensions: '4×6 in', demoImage: demoRsvpCard },
  'TICKET_DESIGN': { name: 'Event Ticket', description: 'Admission ticket', dimensions: '5.5×2 in', demoImage: demoTicket },
  'VIP_BADGE': { name: 'VIP Badge', description: 'VIP access credential', dimensions: '4×6 in', demoImage: demoVipPass },
  'BACKSTAGE_PASS': { name: 'Backstage Pass', description: 'Backstage access', dimensions: '4×6 in', demoImage: demoBackstagePass },
  'PARKING_PASS': { name: 'Parking Pass', description: 'Vehicle permit', dimensions: '4×6 in', demoImage: demoParkingPass },
  'WRISTBAND_DESIGN': { name: 'Wristband', description: 'Access wristband', dimensions: '10×0.75 in', demoImage: demoWristband },
  
  // Hospitality & Dining
  'PLACE_CARD': { name: 'Place Card', description: 'Table seat card', dimensions: '3.5×2 in', demoImage: demoPlaceCard },
  'TABLE_NUMBER': { name: 'Table Number', description: 'Table identifier', dimensions: '4×6 in', demoImage: demoTableNumber },
  'TABLE_TENT': { name: 'Table Tent', description: 'Tabletop tent card', dimensions: '4×6 in', demoImage: demoTableTent },
  'COASTER_DESIGN': { name: 'Coaster', description: 'Beverage coaster', dimensions: '4×4 in', demoImage: demoCoaster },
  'NAPKIN_DESIGN': { name: 'Napkin Print', description: 'Custom napkin design', dimensions: '5×5 in', demoImage: demoNapkin },
  'BAR_MENU': { name: 'Bar Menu', description: 'Beverage menu', dimensions: '4×9 in', demoImage: demoBarMenu },
  'CATERING_LABEL': { name: 'Food Label', description: 'Dish identifier', dimensions: '3×2 in', demoImage: demoCateringLabel },
  'DIETARY_CARD': { name: 'Dietary Card', description: 'Allergen indicator', dimensions: '2×3 in', demoImage: demoDietaryCard },
  
  // Video & Motion
  'VIDEO_TEASER': { name: 'Video Teaser', description: 'Promotional video', dimensions: '1920×1080', demoImage: demoVideo },
  'ANIMATED_LOGO': { name: 'Animated Logo', description: 'Motion logo', dimensions: '1080×1080', demoImage: demoAnimatedLogo },
  'MOTION_GRAPHIC': { name: 'Motion Graphic', description: 'Animated graphics', dimensions: '1920×1080', demoImage: demoMotionGraphic },
  'COUNTDOWN_TIMER': { name: 'Countdown', description: 'Event countdown', dimensions: '1920×1080', demoImage: demoCountdown },
  'DIGITAL_SIGNAGE_LOOP': { name: 'Signage Loop', description: 'Digital display loop', dimensions: '1920×1080', demoImage: demoSignageLoop },
  
  // Documents & Forms
  'PROGRAM_BOOKLET': { name: 'Program', description: 'Event program booklet', dimensions: '5.5×8.5 in', demoImage: demoProgramBooklet },
  'PRESS_RELEASE': { name: 'Press Release', description: 'Media announcement', dimensions: '8.5×11 in', demoImage: demoPressRelease },
  'MEDIA_KIT': { name: 'Media Kit', description: 'Press materials', dimensions: 'Multi-page', demoImage: demoMediaKit },
  'SPONSOR_PACKAGE': { name: 'Sponsor Package', description: 'Sponsorship deck', dimensions: '16:9', demoImage: demoSponsorPackage },
  'CERTIFICATE_AWARD': { name: 'Certificate', description: 'Award certificate', dimensions: '11×8.5 in', demoImage: demoCertificate },
  'THANK_YOU_NOTE': { name: 'Thank You', description: 'Appreciation card', dimensions: '5×7 in', demoImage: demoThankYou },
  'SESSION_EVALUATION': { name: 'Evaluation Form', description: 'Feedback form', dimensions: '8.5×11 in', demoImage: demoEvaluationForm },
  
  // Photo & Engagement
  'PHOTO_FRAME': { name: 'Photo Frame', description: 'Shareable frame overlay', dimensions: '1080×1080', demoImage: demoPhotoFrame },
  'SELFIE_STATION': { name: 'Selfie Station', description: 'Photo booth backdrop', dimensions: '8×8 ft', demoImage: demoSelfieStation },
  'PHOTO_BOOTH_FRAME': { name: 'Booth Frame', description: 'Photo booth frame', dimensions: '8×10 in', demoImage: demoPhotoBoothFrame },
  'PHOTO_BOOTH_PROPS': { name: 'Photo Props', description: 'Printable photo props', dimensions: '11×17 in', demoImage: demoPhotoBoothProps },
  'NETWORKING_BINGO': { name: 'Networking Bingo', description: 'Icebreaker game card', dimensions: '5.5×5.5 in', demoImage: demoNetworkingBingo },
  'SCAVENGER_HUNT_CARD': { name: 'Scavenger Hunt', description: 'Activity checklist', dimensions: '5.5×8.5 in', demoImage: demoScavengerHunt },
  'POLL_CARD': { name: 'Poll Card', description: 'Audience voting card', dimensions: '4×6 in', demoImage: demoPollCard },
  'SPEAKER_INTRO_CARD': { name: 'Speaker Card', description: 'Presenter intro card', dimensions: '5×7 in', demoImage: demoSpeakerIntro },
  'BREAKOUT_SESSION_SIGN': { name: 'Breakout Sign', description: 'Session room sign', dimensions: '11×17 in', demoImage: demoBreakoutSession },
  
  // Accessibility & Safety
  'ADA_SIGNAGE': { name: 'ADA Sign', description: 'Accessibility signage', dimensions: '8×8 in', demoImage: demoAdaSignage },
  'ACCESSIBILITY_SIGNAGE': { name: 'Accessibility Sign', description: 'ADA compliant signage', dimensions: '8×8 in', demoImage: demoAccessibilitySignage },
  'EMERGENCY_EXIT': { name: 'Exit Sign', description: 'Emergency exit marker', dimensions: '12×6 in', demoImage: demoEmergencyExit },
  'EMERGENCY_GUIDE': { name: 'Emergency Guide', description: 'Safety procedures', dimensions: '8.5×11 in', demoImage: demoEmergencyExit },
  'HEALTH_SCREENING': { name: 'Health Sign', description: 'Health protocol sign', dimensions: '11×17 in', demoImage: demoHealthScreening },
  'CROWD_CONTROL': { name: 'Crowd Sign', description: 'Crowd management', dimensions: '24×36 in', demoImage: demoCrowdControl },
  'WIFI_SIGN': { name: 'WiFi Sign', description: 'Network credentials', dimensions: '8.5×11 in', demoImage: demoWifiSign },
  'QR_CODE': { name: 'QR Code', description: 'Branded scannable code', dimensions: '4×4 in', demoImage: demoQrCode },
  'AGENDA_HIGHLIGHTS': { name: 'Agenda Card', description: 'Key session times', dimensions: '5×7 in', demoImage: demoAgendaHighlights },
  'FLOOR_PLAN': { name: 'Floor Plan', description: 'Venue layout map', dimensions: '24×36 in', demoImage: demoFloorPlan },
  'VOLUNTEER_VEST': { name: 'Volunteer Vest', description: 'Staff identification', dimensions: '12×16 in', demoImage: demoVolunteerVest },
  'SECURITY_BADGE': { name: 'Security Badge', description: 'Security credential', dimensions: '4×3 in', demoImage: demoSecurityBadge },
  'MEDIA_CREDENTIAL': { name: 'Media Pass', description: 'Press credential', dimensions: '4×3 in', demoImage: demoMediaCredential },
  
  // Additional Venue & Experience
  'TABLE_RUNNER': { name: 'Table Runner', description: 'Branded table runner', dimensions: '12×72 in', demoImage: demoTableRunner },
  'TABLECLOTH_DESIGN': { name: 'Tablecloth', description: 'Full table covering', dimensions: '90×132 in', demoImage: demoTablecloth },
  'COCKTAIL_NAPKIN': { name: 'Cocktail Napkin', description: 'Beverage napkin', dimensions: '4.75×4.75 in', demoImage: demoCocktailNapkin },
  'ESCALATOR_GRAPHICS': { name: 'Escalator Graphics', description: 'Side panel wrap', dimensions: '96×30 in', demoImage: demoEscalatorGraphics },
  'STAIRS': { name: 'Stair Graphics', description: 'Stair riser decals', dimensions: '48×8 in', demoImage: demoStairGraphics },
  'WINDOW_CLING': { name: 'Window Cling', description: 'Glass door graphic', dimensions: '24×36 in', demoImage: demoWindowCling },
  'A_FRAME_SIGN': { name: 'A-Frame Sign', description: 'Sidewalk sign', dimensions: '24×36 in', demoImage: demoAFrame },
  'LOADING_DOCK_SIGNAGE': { name: 'Loading Dock', description: 'Vendor access sign', dimensions: '24×18 in', demoImage: demoLoadingDock },
  'VIP_LOUNGE_SIGNAGE': { name: 'VIP Lounge', description: 'VIP area signage', dimensions: '18×24 in', demoImage: demoVipLounge },
  'GREEN_ROOM_SIGNAGE': { name: 'Green Room', description: 'Speaker area sign', dimensions: '11×8.5 in', demoImage: demoGreenRoom },
  'SHUTTLE_SIGNAGE': { name: 'Shuttle Sign', description: 'Transport pickup', dimensions: '18×24 in', demoImage: demoShuttleSignage },
  'GIFT_BOX_PACKAGING': { name: 'Gift Box', description: 'Swag box packaging', dimensions: '6×6×4 in', demoImage: demoGiftBox },
  'MATCHBOOK_DESIGN': { name: 'Matchbook', description: 'Branded matchbook', dimensions: '2.5×1.5 in', demoImage: demoMatchbook },
  'ENVELOPE_DESIGN': { name: 'Envelope', description: 'Invitation envelope', dimensions: '9.5×4.125 in', demoImage: demoEnvelope },
  'PORTABLE_BILLBOARD': { name: 'A-Board', description: 'Sandwich board', dimensions: '24×36 in', demoImage: demoPortableBillboard },
  'WELCOME_COUNTER': { name: 'Welcome Counter', description: 'Info desk wrap', dimensions: '48×36 in', demoImage: demoWelcomeCounter },
  'TECHNOLOGY_COUNTER': { name: 'Tech Counter', description: 'Demo desk wrap', dimensions: '60×36 in', demoImage: demoTechCounter },
  'GLASS_DOOR': { name: 'Glass Door', description: 'Door decal', dimensions: '36×84 in', demoImage: demoGlassDoor },
  'GLASS_DOUBLE_DOOR': { name: 'Double Door', description: 'Double door decal', dimensions: '72×84 in', demoImage: demoGlassDoubleDoor },
  'GLASS_ROTATING_DOOR': { name: 'Revolving Door', description: 'Rotating door wrap', dimensions: '30×84 in', demoImage: demoRotatingDoor },
  
  // Digital & Virtual
  'AR_MARKER': { name: 'AR Marker', description: 'Augmented reality trigger', dimensions: '4×4 in', demoImage: demoArMarker },
  'FEEDBACK_KIOSK': { name: 'Feedback Kiosk', description: 'Survey screen UI', dimensions: '1080×1920', demoImage: demoFeedbackKiosk },
  'VENUE_TOUR_3D': { name: '3D Venue Tour', description: 'Virtual walkthrough', dimensions: '1920×1080', demoImage: demoVenueTour3d },
  'SEATING_CHART': { name: 'Seating Chart', description: 'Guest assignments', dimensions: '24×36 in', demoImage: demoSeatingChart },
  'SOCIAL_PROFILE': { name: 'Profile Image', description: 'Social avatar', dimensions: '400×400', demoImage: demoSocialProfile },
  'HYBRID_EVENT_SCREEN': { name: 'Hybrid Screen', description: 'In-person + virtual', dimensions: '1920×1080', demoImage: demoHybridEvent },
  'PHOTOREALISTIC_SHOT': { name: 'Mockup Shot', description: 'Real-world preview', dimensions: '1920×1080', demoImage: demoVenueTour3d },
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
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);
  
  // Full-screen canvas state
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [canvasAssetType, setCanvasAssetType] = useState<string | null>(null);
  
  // Template workflow state
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateAssetType, setTemplateAssetType] = useState<string | null>(null);
  const [templateAssetName, setTemplateAssetName] = useState<string>('');
  
  // Visual editor state
  const [visualEditorOpen, setVisualEditorOpen] = useState(false);
  const [visualEditorAssetType, setVisualEditorAssetType] = useState<string | null>(null);
  const [visualEditorAssetName, setVisualEditorAssetName] = useState<string>('');
  
  // Animated banner editor state
  const [animatedBannerOpen, setAnimatedBannerOpen] = useState(false);
  const [animatedBannerAssetType, setAnimatedBannerAssetType] = useState<string | null>(null);
  const [animatedBannerAssetName, setAnimatedBannerAssetName] = useState<string>('');
  
  // Slide editor state
  const [slideEditorOpen, setSlideEditorOpen] = useState(false);
  const [slideEditorAssetType, setSlideEditorAssetType] = useState<string | null>(null);
  const [slideEditorAssetName, setSlideEditorAssetName] = useState<string>('');
  
  // Video studio editor state
  const [videoStudioOpen, setVideoStudioOpen] = useState(false);
  
  // Palette editor state
  const [paletteEditorOpen, setPaletteEditorOpen] = useState(false);
  
  // Open full-screen canvas for generation with variations
  const handleGenerate = (assetType: string) => {
    if (!brand) {
      toast.error('Please select a brand first');
      return;
    }
    
    // Intercept PALETTE type to open color palette editor
    if (PALETTE_ASSET_TYPES.includes(assetType)) {
      setPaletteEditorOpen(true);
      return;
    }
    
    setCanvasAssetType(assetType);
    setCanvasOpen(true);
  };
  
  // Open template workflow for customization
  const handleOpenTemplate = (assetType: string, assetName: string) => {
    setTemplateAssetType(assetType);
    setTemplateAssetName(assetName);
    setTemplateModalOpen(true);
  };
  
  // Open visual editor (Canva-style) or slide editor for presentations
  const handleOpenVisualEditor = (assetType: string, assetName: string) => {
    if (PRESENTATION_ASSET_TYPES.includes(assetType)) {
      setSlideEditorAssetType(assetType);
      setSlideEditorAssetName(assetName);
      setSlideEditorOpen(true);
      return;
    }
    if (VIDEO_ASSET_TYPES.includes(assetType)) {
      setVideoStudioOpen(true);
      return;
    }
    setVisualEditorAssetType(assetType);
    setVisualEditorAssetName(assetName);
    setVisualEditorOpen(true);
  };
  
  // Open animated banner editor
  const handleOpenAnimatedBanner = (assetType: string, assetName: string) => {
    setAnimatedBannerAssetType(assetType);
    setAnimatedBannerAssetName(assetName);
    setAnimatedBannerOpen(true);
  };
  
  // Get dimensions for visual editor
  const getEditorDimensions = (assetType: string): { width: number; height: number } => {
    const info = getAssetInfo(assetType);
    const dims = info.dimensions || '1080×1080';
    
    // Parse dimensions - handle various formats
    if (dims.includes('×')) {
      const [w, h] = dims.split('×').map(d => parseInt(d.replace(/[^\d]/g, '')) || 1080);
      // Scale down large physical dimensions (inches to pixels approximation)
      if (dims.includes('in') || dims.includes('ft')) {
        return { width: Math.min(w * 100, 2000), height: Math.min(h * 100, 2000) };
      }
      return { width: w, height: h };
    }
    return { width: 1080, height: 1080 };
  };

  // Handle when image is generated and selected from canvas
  const handleImageFromCanvas = (assetType: string, imageUrl: string) => {
    setGeneratedImages(prev => ({
      ...prev,
      [assetType]: imageUrl
    }));
    setCanvasOpen(false);
    setCanvasAssetType(null);
  };
  
  // Get the image to display - generated takes priority over demo
  const getDisplayImage = (assetType: string, info: { demoImage?: string }) => {
    return generatedImages[assetType] || info.demoImage;
  };

  const handleViewImage = (imageSrc: string, title: string) => {
    setLightboxImage({ src: imageSrc, title });
  };

  // Get info for canvas
  const getCanvasInfo = () => {
    if (!canvasAssetType) return null;
    return getAssetInfo(canvasAssetType);
  };

  const canvasInfo = getCanvasInfo();

  if (viewMode === 'list') {
    return (
      <>
        <ImageLightbox
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
          imageSrc={lightboxImage?.src || ''}
          title={lightboxImage?.title}
        />
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
                onClick={() => handleGenerate(assetType)}
              >
                <div 
                  className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer hover:scale-110",
                    isSelected 
                      ? "border-primary bg-primary" 
                      : "border-muted-foreground/30 group-hover:border-primary/50"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAsset(assetType);
                  }}
                  title={isSelected ? "Deselect" : "Select for batch actions"}
                >
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                
                <div 
                  className="w-16 h-16 rounded-lg overflow-hidden bg-muted relative group/image cursor-zoom-in"
                  onClick={(e) => {
                    e.stopPropagation();
                    const displayImage = getDisplayImage(assetType, info);
                    if (displayImage) {
                      handleViewImage(displayImage, info.name);
                    }
                  }}
                >
                  {(() => {
                    const displayImage = getDisplayImage(assetType, info);
                    const hasGenerated = !!generatedImages[assetType];
                    const isMerch = MERCH_MOCKUP_TYPES.has(assetType);
                    
                    if (isMerch && hasGenerated && generatedImages[assetType]) {
                      return (
                        <MerchMockupOverlay
                          assetType={assetType}
                          imageUrl={generatedImages[assetType]}
                        />
                      );
                    }
                    
                    return displayImage ? (
                      <>
                        <img 
                          src={displayImage} 
                          alt={info.name}
                          className="w-full h-full object-cover"
                        />
                        {hasGenerated && (
                          <div className="absolute top-0.5 right-0.5 bg-primary rounded-full p-0.5">
                            <Sparkles className="w-2 h-2 text-primary-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                          <ZoomIn className="w-4 h-4 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    );
                  })()}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{info.name}</h3>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {info.dimensions}
                </div>
                
                <div className="flex items-center gap-2">
                  {isAnimatableAsset(assetType) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 border-primary/30 text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAnimatedBanner(assetType, info.name);
                      }}
                    >
                      <Film className="w-3.5 h-3.5" />
                      Animate
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenVisualEditor(assetType, info.name);
                    }}
                    title="Open Visual Editor (Canva-style)"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Design
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenTemplate(assetType, info.name);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Template
                  </Button>
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
                        AI Studio
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Full-Screen Generation Canvas (List View) */}
        {canvasAssetType && canvasInfo && (
          <AssetGenerationCanvas
            isOpen={canvasOpen}
            onClose={() => {
              setCanvasOpen(false);
              setCanvasAssetType(null);
            }}
            assetType={canvasAssetType}
            assetName={canvasInfo.name}
            assetDescription={canvasInfo.description}
            dimensions={canvasInfo.dimensions}
            brand={brand}
            eventName={brand?.name || 'Your Event'}
            studioGradient={studioGradient}
            onImageGenerated={(imageUrl) => handleImageFromCanvas(canvasAssetType, imageUrl)}
          />
        )}
        
        {/* Visual Editor (List View) */}
        {visualEditorAssetType && (
          <VisualEditor
            isOpen={visualEditorOpen}
            onClose={() => {
              setVisualEditorOpen(false);
              setVisualEditorAssetType(null);
            }}
            assetType={visualEditorAssetType}
            assetName={visualEditorAssetName}
            initialWidth={getEditorDimensions(visualEditorAssetType).width}
            initialHeight={getEditorDimensions(visualEditorAssetType).height}
            brandColors={brand?.styles?.color_palette?.map((c: any) => c.hex) || undefined}
            onSave={(state) => {
              toast.success('Design saved!');
              console.log('Saved state:', state);
            }}
            onExport={(state) => {
              toast.success('Exporting design...');
              console.log('Export state:', state);
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <ImageLightbox
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        imageSrc={lightboxImage?.src || ''}
        title={lightboxImage?.title}
      />
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
              onClick={() => handleGenerate(assetType)}
            >
              {/* Selection Checkbox - stops propagation to allow selection without opening editor */}
              <div 
                className={cn(
                  "absolute top-3 left-3 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer hover:scale-110",
                  isSelected 
                    ? "border-primary bg-primary" 
                    : "border-white/50 bg-black/20 group-hover:border-white"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAsset(assetType);
                }}
                title={isSelected ? "Deselect" : "Select for batch actions"}
              >
                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              
              {/* View Larger Button */}
              {(info.demoImage || generatedImages[assetType]) && (
                <button 
                  className="absolute top-3 right-10 z-10 p-1.5 rounded-lg bg-black/20 text-white/70 hover:bg-black/40 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    const displayImage = getDisplayImage(assetType, info);
                    if (displayImage) {
                      handleViewImage(displayImage, info.name);
                    }
                  }}
                  title="View larger"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              )}
              
              {/* More Options */}
              <button 
                className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-black/20 text-white/70 hover:bg-black/40 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {/* Preview Area with Demo Image */}
              <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                {(() => {
                  const displayImage = getDisplayImage(assetType, info);
                  const hasGenerated = !!generatedImages[assetType];
                  const isMerch = MERCH_MOCKUP_TYPES.has(assetType);
                  
                  // Show product mockup for merch items with generated images
                  if (isMerch && hasGenerated && generatedImages[assetType]) {
                    return (
                      <>
                        <MerchMockupOverlay
                          assetType={assetType}
                          imageUrl={generatedImages[assetType]}
                        />
                        <div className="absolute top-2 left-10 z-10 bg-primary rounded-full px-2 py-0.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-primary-foreground" />
                          <span className="text-[10px] font-medium text-primary-foreground">Mockup</span>
                        </div>
                      </>
                    );
                  }
                  
                  return displayImage ? (
                    <>
                      <img 
                        src={displayImage} 
                        alt={info.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {hasGenerated && (
                        <div className="absolute top-2 left-10 z-10 bg-primary rounded-full px-2 py-0.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-primary-foreground" />
                          <span className="text-[10px] font-medium text-primary-foreground">AI Generated</span>
                        </div>
                      )}
                    </>
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
                  );
                })()}
                
                {/* Open Studio Overlay - Click anywhere opens the studio */}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 sm:gap-3 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                  <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 px-2">
                    <Button
                      size="sm"
                      className={cn("bg-gradient-to-r shadow-lg pointer-events-auto w-full sm:w-auto text-xs sm:text-sm h-7 sm:h-8", studioGradient)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerate(assetType);
                      }}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                          AI Studio
                        </>
                      )}
                    </Button>
                    <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="shadow-lg pointer-events-auto gap-1 flex-1 sm:flex-none text-xs sm:text-sm h-7 sm:h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenVisualEditor(assetType, info.name);
                        }}
                        title="Open Visual Editor"
                      >
                        <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Design
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="shadow-lg pointer-events-auto gap-1 flex-1 sm:flex-none text-xs sm:text-sm h-7 sm:h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTemplate(assetType, info.name);
                        }}
                      >
                        <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Template
                      </Button>
                    </div>
                    {isAnimatableAsset(assetType) && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="shadow-lg pointer-events-auto gap-1 border-primary/30 text-primary w-full sm:w-auto text-xs sm:text-sm h-7 sm:h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAnimatedBanner(assetType, info.name);
                        }}
                      >
                        <Film className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Animate
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-white/70">Choose your editing mode</p>
                </div>
                
                {/* Loading Overlay with Enhanced Animation */}
                {isGenerating && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 flex items-center justify-center backdrop-blur-sm"
                  >
                    {/* Animated shimmer background */}
                    <div className="absolute inset-0 overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                    
                    {/* Central loading indicator */}
                    <div className="relative text-center z-10">
                      {/* Outer pulsing ring */}
                      <motion.div
                        className="absolute inset-0 -m-4 rounded-full border-2 border-primary/30"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      
                      {/* Inner rotating ring */}
                      <motion.div
                        className="w-12 h-12 rounded-full border-2 border-transparent border-t-primary border-r-primary/50 mx-auto"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      
                      {/* Center sparkle icon */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ scale: [0.9, 1.1, 0.9] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Sparkles className="w-5 h-5 text-primary" />
                      </motion.div>
                      
                      {/* Status text */}
                      <motion.p 
                        className="mt-3 text-xs text-white/90 font-medium"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        Generating...
                      </motion.p>
                    </div>
                  </motion.div>
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
      
      {/* Full-Screen Generation Canvas */}
      {canvasAssetType && canvasInfo && (
        <AssetGenerationCanvas
          isOpen={canvasOpen}
          onClose={() => {
            setCanvasOpen(false);
            setCanvasAssetType(null);
          }}
          assetType={canvasAssetType}
          assetName={canvasInfo.name}
          assetDescription={canvasInfo.description}
          dimensions={canvasInfo.dimensions}
          brand={brand}
          eventName={brand?.name || 'Your Event'}
          studioGradient={studioGradient}
          onImageGenerated={(imageUrl) => handleImageFromCanvas(canvasAssetType, imageUrl)}
        />
      )}
      
      {/* Template Workflow Modal */}
      {templateAssetType && (
        <TemplateWorkflowModal
          isOpen={templateModalOpen}
          onClose={() => {
            setTemplateModalOpen(false);
            setTemplateAssetType(null);
          }}
          assetType={templateAssetType}
          assetName={templateAssetName}
          brand={brand}
        />
      )}
      
      {/* Visual Editor (Grid View) */}
      {visualEditorAssetType && (
        <VisualEditor
          isOpen={visualEditorOpen}
          onClose={() => {
            setVisualEditorOpen(false);
            setVisualEditorAssetType(null);
          }}
          assetType={visualEditorAssetType}
          assetName={visualEditorAssetName}
          initialWidth={getEditorDimensions(visualEditorAssetType).width}
          initialHeight={getEditorDimensions(visualEditorAssetType).height}
          brandColors={brand?.styles?.color_palette?.map((c: any) => c.hex) || undefined}
          onSave={(state) => {
            toast.success('Design saved!');
            console.log('Saved state:', state);
          }}
          onExport={(state) => {
            toast.success('Exporting design...');
            console.log('Export state:', state);
          }}
        />
      )}
      
      {/* Animated Banner Editor */}
      {animatedBannerAssetType && (
        <AnimatedBannerEditor
          isOpen={animatedBannerOpen}
          onClose={() => {
            setAnimatedBannerOpen(false);
            setAnimatedBannerAssetType(null);
          }}
          assetType={animatedBannerAssetType}
          assetName={animatedBannerAssetName}
          brand={brand}
          backgroundImage={generatedImages[animatedBannerAssetType]}
          initialWidth={getEditorDimensions(animatedBannerAssetType).width}
          initialHeight={getEditorDimensions(animatedBannerAssetType).height}
        />
      )}

      {/* Slide Editor for Presentations */}
      {slideEditorAssetType && (
        <SlideEditor
          isOpen={slideEditorOpen}
          onClose={() => {
            setSlideEditorOpen(false);
            setSlideEditorAssetType(null);
          }}
          assetType={slideEditorAssetType}
          assetName={slideEditorAssetName}
          brand={brand}
        />
      )}

      {/* Video Studio Editor */}
      <VideoStudioEditor
        isOpen={videoStudioOpen}
        onClose={() => setVideoStudioOpen(false)}
      />

      {/* Color Palette Editor */}
      <ColorPaletteEditor
        isOpen={paletteEditorOpen}
        onClose={() => setPaletteEditorOpen(false)}
        brand={brand}
        onSavePalette={(colors) => {
          console.log('Palette saved:', colors);
          toast.success('Palette saved!');
        }}
      />
    </>
  );
};
