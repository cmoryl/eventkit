import React from 'react';
import { EventType } from '../../types';
import {
  Building2,
  Heart,
  Briefcase,
  Music,
  Award,
  Users,
  Lightbulb,
  Mic,
  Trophy,
  HandHeart,
  GraduationCap,
  Rocket,
  UserPlus,
  Medal,
  HelpCircle,
} from 'lucide-react';

interface EventTypeSelectorProps {
  selectedType?: EventType;
  onSelect: (type: EventType) => void;
}

const EVENT_TYPES: { type: EventType; label: string; icon: React.ReactNode; description: string; suggestedAssets: string[] }[] = [
  {
    type: 'conference',
    label: 'Conference',
    icon: <Building2 className="w-5 h-5" />,
    description: 'Multi-day professional gathering with keynotes and breakout sessions',
    suggestedAssets: ['Name Tags', 'Stage Backdrop', 'Presentation Deck', 'WiFi Signs', 'Room Signage'],
  },
  {
    type: 'wedding',
    label: 'Wedding',
    icon: <Heart className="w-5 h-5" />,
    description: 'Celebration of love with ceremony and reception',
    suggestedAssets: ['Invitation Cards', 'Place Cards', 'Table Numbers', 'Menu', 'Thank You Cards'],
  },
  {
    type: 'corporate',
    label: 'Corporate Event',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'Company meetings, retreats, or team-building events',
    suggestedAssets: ['Banners', 'Name Tags', 'Folders', 'Presentation Deck', 'Swag Bags'],
  },
  {
    type: 'festival',
    label: 'Festival',
    icon: <Music className="w-5 h-5" />,
    description: 'Large-scale celebration with multiple activities and stages',
    suggestedAssets: ['Wristbands', 'Stage Backdrops', 'Wayfinding Signs', 'Merchandise'],
  },
  {
    type: 'gala',
    label: 'Gala / Formal Dinner',
    icon: <Award className="w-5 h-5" />,
    description: 'Elegant evening event with dinner and entertainment',
    suggestedAssets: ['Invitations', 'Menus', 'Table Numbers', 'Program Booklets', 'Awards'],
  },
  {
    type: 'tradeshow',
    label: 'Trade Show / Expo',
    icon: <Users className="w-5 h-5" />,
    description: 'Exhibition with vendor booths and product showcases',
    suggestedAssets: ['Booth Displays', 'Banners', 'Business Cards', 'Floor Plans', 'Badges'],
  },
  {
    type: 'workshop',
    label: 'Workshop / Training',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'Hands-on learning session with focused curriculum',
    suggestedAssets: ['Workbooks', 'Name Tags', 'Certificates', 'Presentation Slides'],
  },
  {
    type: 'concert',
    label: 'Concert / Performance',
    icon: <Mic className="w-5 h-5" />,
    description: 'Live music or theatrical performance',
    suggestedAssets: ['Tickets', 'Posters', 'Stage Graphics', 'Merchandise', 'Wristbands'],
  },
  {
    type: 'sports',
    label: 'Sports Event',
    icon: <Trophy className="w-5 h-5" />,
    description: 'Athletic competition or sporting activity',
    suggestedAssets: ['Jerseys', 'Banners', 'Signage', 'Medals', 'Programs'],
  },
  {
    type: 'fundraiser',
    label: 'Fundraiser / Charity',
    icon: <HandHeart className="w-5 h-5" />,
    description: 'Event to raise money or awareness for a cause',
    suggestedAssets: ['Donation Cards', 'Banners', 'Thank You Notes', 'Programs', 'Sponsor Logos'],
  },
  {
    type: 'graduation',
    label: 'Graduation',
    icon: <GraduationCap className="w-5 h-5" />,
    description: 'Academic achievement celebration',
    suggestedAssets: ['Programs', 'Banners', 'Name Cards', 'Photo Frames', 'Certificates'],
  },
  {
    type: 'product_launch',
    label: 'Product Launch',
    icon: <Rocket className="w-5 h-5" />,
    description: 'Unveiling of a new product or service',
    suggestedAssets: ['Press Kits', 'Backdrops', 'Social Media', 'Invitations', 'Swag'],
  },
  {
    type: 'networking',
    label: 'Networking Event',
    icon: <UserPlus className="w-5 h-5" />,
    description: 'Professional social gathering for connections',
    suggestedAssets: ['Name Tags', 'Social Media', 'Banners', 'Business Cards'],
  },
  {
    type: 'award_ceremony',
    label: 'Award Ceremony',
    icon: <Medal className="w-5 h-5" />,
    description: 'Recognition event honoring achievements',
    suggestedAssets: ['Certificates', 'Programs', 'Stage Graphics', 'Trophies', 'Invitations'],
  },
  {
    type: 'other',
    label: 'Other',
    icon: <HelpCircle className="w-5 h-5" />,
    description: 'Custom event type not listed above',
    suggestedAssets: ['Core branding', 'Basic signage', 'Digital assets'],
  },
];

const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({ selectedType, onSelect }) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">What type of event are you planning?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          We'll customize asset recommendations based on your event type
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {EVENT_TYPES.map((eventType) => (
          <button
            key={eventType.type}
            onClick={() => onSelect(eventType.type)}
            className={`group relative p-4 rounded-xl border-2 transition-all text-left hover:scale-[1.02] ${
              selectedType === eventType.type
                ? 'border-primary bg-primary/10 shadow-lg'
                : 'border-border hover:border-primary/40 hover:bg-secondary/30'
            }`}
          >
            <div className={`p-2 rounded-lg w-fit mb-3 transition-colors ${
              selectedType === eventType.type
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
            }`}>
              {eventType.icon}
            </div>
            <h4 className="font-medium text-sm text-foreground">{eventType.label}</h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{eventType.description}</p>
            
            {selectedType === eventType.type && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <div className="w-2 h-2 bg-primary-foreground rounded-full" />
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedType && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in">
          <h4 className="text-sm font-medium text-foreground mb-2">Recommended Assets for {EVENT_TYPES.find(e => e.type === selectedType)?.label}</h4>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.find(e => e.type === selectedType)?.suggestedAssets.map((asset, idx) => (
              <span key={idx} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                {asset}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventTypeSelector;
