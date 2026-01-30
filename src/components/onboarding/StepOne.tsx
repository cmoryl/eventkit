import React, { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { EventDetails, LogoAsset, EventType } from '../../types';
import EventTypeSelector from './EventTypeSelector';
import { Users, DollarSign, Hash, Shirt } from 'lucide-react';

interface StepOneProps {
  eventDetails: EventDetails;
  setEventDetails: React.Dispatch<React.SetStateAction<EventDetails>>;
  logos: LogoAsset[];
  setLogos: React.Dispatch<React.SetStateAction<LogoAsset[]>>;
}

const StepOne: React.FC<StepOneProps> = ({ eventDetails, setEventDetails, logos, setLogos }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      setLogos(prev => [...prev, { id: uuidv4(), file, url, name: file.name }]);
    });
  };

  const removeLogo = (id: string) => {
    setLogos(prev => {
      const logo = prev.find(l => l.id === id);
      if (logo) URL.revokeObjectURL(logo.url);
      return prev.filter(l => l.id !== id);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">Event Details</h2>
        <p className="text-sm text-muted-foreground">Tell us about your event</p>
      </div>

      {/* Event Name - Primary field */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Event Name <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={eventDetails.name}
          onChange={handleChange}
          placeholder="e.g., Tech Summit 2025"
          className="input-field text-lg"
          autoFocus
        />
      </div>

      {/* Event Type Selector */}
      <div className="pt-2">
        <EventTypeSelector
          selectedType={eventDetails.eventType}
          onSelect={(type) => setEventDetails(prev => ({ ...prev, eventType: type }))}
        />
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Event Logo <span className="text-muted-foreground font-normal text-xs">(optional)</span>
        </label>
        
        {logos.length > 0 ? (
          <div className="flex flex-wrap gap-3 mb-3">
            {logos.map(logo => (
              <div key={logo.id} className="relative group">
                <div className="w-20 h-20 rounded-xl bg-secondary/50 border border-border overflow-hidden flex items-center justify-center shadow-sm">
                  <img src={logo.url} alt={logo.name} className="max-w-full max-h-full object-contain" />
                </div>
                <button
                  onClick={() => removeLogo(logo.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-10 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <span className="block text-sm font-medium">Upload your logo</span>
              <span className="text-xs text-muted-foreground">PNG, JPG, or SVG</span>
            </div>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleLogoUpload}
          className="hidden"
        />
      </div>

      {/* Optional Details - Collapsible */}
      <details className="group pt-2">
        <summary className="flex items-center gap-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors py-2">
          <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center group-open:bg-primary/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform group-open:rotate-90 group-open:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          Add more details
        </summary>
        
        <div className="mt-4 space-y-4 animate-fade-in pl-8">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              name="description"
              value={eventDetails.description}
              onChange={handleChange}
              placeholder="A brief description of your event..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={eventDetails.date}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={eventDetails.location}
                onChange={handleChange}
                placeholder="City, Venue"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Website</label>
              <input
                type="url"
                name="website"
                value={eventDetails.website}
                onChange={handleChange}
                placeholder="https://..."
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={eventDetails.email}
                onChange={handleChange}
                placeholder="contact@event.com"
                className="input-field"
              />
            </div>
          </div>

          {/* Event-Specific Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                Expected Attendees
              </label>
              <input
                type="number"
                name="expectedAttendees"
                value={eventDetails.expectedAttendees || ''}
                onChange={(e) => setEventDetails(prev => ({ ...prev, expectedAttendees: parseInt(e.target.value) || undefined }))}
                placeholder="250"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                Budget
              </label>
              <input
                type="number"
                name="budget"
                value={eventDetails.budget || ''}
                onChange={(e) => setEventDetails(prev => ({ ...prev, budget: parseFloat(e.target.value) || undefined }))}
                placeholder="50000"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                Event Hashtag
              </label>
              <input
                type="text"
                name="hashtag"
                value={eventDetails.hashtag || ''}
                onChange={(e) => setEventDetails(prev => ({ ...prev, hashtag: e.target.value }))}
                placeholder="#TechSummit2025"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Shirt className="w-4 h-4 text-muted-foreground" />
                Dress Code
              </label>
              <input
                type="text"
                name="dresscode"
                value={eventDetails.dresscode || ''}
                onChange={(e) => setEventDetails(prev => ({ ...prev, dresscode: e.target.value }))}
                placeholder="Business Casual"
                className="input-field"
              />
            </div>
          </div>
        </div>
      </details>
    </div>
  );
};

export default StepOne;
