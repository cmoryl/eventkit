import React from 'react';
import { AssetType } from '../types';

interface AssetSpecificFieldsProps {
  assetType: AssetType;
  customContent: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  inputClassName: string;
}

const AssetSpecificFields: React.FC<AssetSpecificFieldsProps> = ({
  assetType,
  customContent,
  onChange,
  inputClassName,
}) => {
  const renderFields = () => {
    switch (assetType) {
      // ═══════════════════════════════════════════════════════════════════════
      // PRINT & SIGNAGE
      // ═══════════════════════════════════════════════════════════════════════
      case AssetType.NameTag:
      case AssetType.NameTagBack:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Badge Content</h4>
            <input type="text" name="name" value={customContent.name || ''} onChange={onChange} placeholder="Attendee Name" className={inputClassName} />
            <input type="text" name="title" value={customContent.title || ''} onChange={onChange} placeholder="Job Title" className={inputClassName} />
            <input type="text" name="company" value={customContent.company || ''} onChange={onChange} placeholder="Company" className={inputClassName} />
            <input type="text" name="pronouns" value={customContent.pronouns || ''} onChange={onChange} placeholder="Pronouns (optional)" className={inputClassName} />
          </div>
        );

      case AssetType.Banner:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Banner Content</h4>
            <input type="text" name="headline" value={customContent.headline || ''} onChange={onChange} placeholder="Main Headline" className={inputClassName} />
            <input type="text" name="subheadline" value={customContent.subheadline || ''} onChange={onChange} placeholder="Subheadline" className={inputClassName} />
            <input type="text" name="eventDate" value={customContent.eventDate || ''} onChange={onChange} placeholder="Event Date (e.g., March 15-17, 2026)" className={inputClassName} />
            <input type="text" name="venue" value={customContent.venue || ''} onChange={onChange} placeholder="Venue / Location" className={inputClassName} />
            <input type="text" name="cta" value={customContent.cta || ''} onChange={onChange} placeholder="Call to Action (e.g., Register Now)" className={inputClassName} />
          </div>
        );

      case AssetType.EventSignage:
      case AssetType.HangingSignage:
      case AssetType.OutdoorSignage:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Signage Content</h4>
            <input type="text" name="mainText" value={customContent.mainText || ''} onChange={onChange} placeholder="Main Text" className={inputClassName} />
            <input type="text" name="direction" value={customContent.direction || ''} onChange={onChange} placeholder="Direction (e.g., →, ←, ↑)" className={inputClassName} />
            <input type="text" name="distance" value={customContent.distance || ''} onChange={onChange} placeholder="Distance (e.g., 50m)" className={inputClassName} />
            <select name="arrowDirection" value={customContent.arrowDirection || ''} onChange={onChange} className={inputClassName}>
              <option value="">No Arrow</option>
              <option value="left">← Left</option>
              <option value="right">→ Right</option>
              <option value="up">↑ Ahead</option>
              <option value="down">↓ Below</option>
            </select>
          </div>
        );

      case AssetType.DoorSignage:
      case AssetType.RoomSignage:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Room Signage</h4>
            <input type="text" name="roomName" value={customContent.roomName || ''} onChange={onChange} placeholder="Room Name (e.g., Summit Hall A)" className={inputClassName} />
            <input type="text" name="roomNumber" value={customContent.roomNumber || ''} onChange={onChange} placeholder="Room Number" className={inputClassName} />
            <input type="text" name="sessionTitle" value={customContent.sessionTitle || ''} onChange={onChange} placeholder="Session Title" className={inputClassName} />
            <input type="text" name="sessionTime" value={customContent.sessionTime || ''} onChange={onChange} placeholder="Time (e.g., 9:00 AM - 10:30 AM)" className={inputClassName} />
            <input type="text" name="speakerName" value={customContent.speakerName || ''} onChange={onChange} placeholder="Speaker Name" className={inputClassName} />
            <input type="text" name="capacity" value={customContent.capacity || ''} onChange={onChange} placeholder="Capacity (e.g., 200 seats)" className={inputClassName} />
          </div>
        );

      case AssetType.EaselSignage:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Welcome Sign</h4>
            <input type="text" name="welcomeText" value={customContent.welcomeText || ''} onChange={onChange} placeholder="Welcome Message" className={inputClassName} />
            <input type="text" name="eventTitle" value={customContent.eventTitle || ''} onChange={onChange} placeholder="Event Title" className={inputClassName} />
            <input type="text" name="hostName" value={customContent.hostName || ''} onChange={onChange} placeholder="Host / Organizer Name" className={inputClassName} />
            <input type="text" name="dateDisplay" value={customContent.dateDisplay || ''} onChange={onChange} placeholder="Date Display" className={inputClassName} />
          </div>
        );

      case AssetType.Menu:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Menu Details</h4>
            <input type="text" name="menuTitle" value={customContent.menuTitle || ''} onChange={onChange} placeholder="Menu Title (e.g., Lunch Menu)" className={inputClassName} />
            <textarea name="dishes" value={customContent.dishes || ''} onChange={onChange} placeholder="Dishes (one per line)&#10;Grilled Salmon&#10;Caesar Salad&#10;Chocolate Cake" rows={4} className={inputClassName + ' resize-none'} />
            <input type="text" name="dietaryNotes" value={customContent.dietaryNotes || ''} onChange={onChange} placeholder="Dietary Notes (e.g., GF, V options available)" className={inputClassName} />
            <input type="text" name="chefName" value={customContent.chefName || ''} onChange={onChange} placeholder="Chef / Caterer Name" className={inputClassName} />
          </div>
        );

      case AssetType.ThankYouNote:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Thank You Card</h4>
            <input type="text" name="recipientName" value={customContent.recipientName || ''} onChange={onChange} placeholder="Recipient Name (or leave blank)" className={inputClassName} />
            <textarea name="message" value={customContent.message || ''} onChange={onChange} placeholder="Thank you message..." rows={3} className={inputClassName + ' resize-none'} />
            <input type="text" name="senderName" value={customContent.senderName || ''} onChange={onChange} placeholder="From (Sender Name)" className={inputClassName} />
            <input type="text" name="senderTitle" value={customContent.senderTitle || ''} onChange={onChange} placeholder="Sender Title / Role" className={inputClassName} />
          </div>
        );

      case AssetType.Folder:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Folder Content</h4>
            <input type="text" name="folderTitle" value={customContent.folderTitle || ''} onChange={onChange} placeholder="Folder Title" className={inputClassName} />
            <input type="text" name="tagline" value={customContent.tagline || ''} onChange={onChange} placeholder="Tagline / Subtitle" className={inputClassName} />
            <input type="text" name="website" value={customContent.website || ''} onChange={onChange} placeholder="Website URL" className={inputClassName} />
            <input type="text" name="contactInfo" value={customContent.contactInfo || ''} onChange={onChange} placeholder="Contact Info" className={inputClassName} />
          </div>
        );

      // ═══════════════════════════════════════════════════════════════════════
      // MERCHANDISE
      // ═══════════════════════════════════════════════════════════════════════
      case AssetType.Tshirt:
      case AssetType.TshirtBack:
      case AssetType.TshirtSleeve:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">T-Shirt Design</h4>
            <input type="text" name="mainGraphicText" value={customContent.mainGraphicText || ''} onChange={onChange} placeholder="Main Text / Slogan" className={inputClassName} />
            <input type="text" name="yearOrEdition" value={customContent.yearOrEdition || ''} onChange={onChange} placeholder="Year / Edition (e.g., 2026)" className={inputClassName} />
            <select name="printStyle" value={customContent.printStyle || ''} onChange={onChange} className={inputClassName}>
              <option value="">Print Style</option>
              <option value="dtg">DTG (Full Color)</option>
              <option value="screenprint">Screen Print (Limited Colors)</option>
              <option value="embroidery">Embroidery</option>
              <option value="heattransfer">Heat Transfer</option>
            </select>
            <input type="text" name="sponsorLogos" value={customContent.sponsorLogos || ''} onChange={onChange} placeholder="Sponsor Names (for back)" className={inputClassName} />
          </div>
        );

      case AssetType.Hat:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Hat Design</h4>
            <input type="text" name="embroideryText" value={customContent.embroideryText || ''} onChange={onChange} placeholder="Embroidery Text" className={inputClassName} />
            <select name="hatStyle" value={customContent.hatStyle || ''} onChange={onChange} className={inputClassName}>
              <option value="">Hat Style</option>
              <option value="snapback">Snapback</option>
              <option value="fitted">Fitted</option>
              <option value="dad-cap">Dad Cap</option>
              <option value="trucker">Trucker</option>
              <option value="beanie">Beanie</option>
            </select>
            <select name="placement" value={customContent.placement || ''} onChange={onChange} className={inputClassName}>
              <option value="">Placement</option>
              <option value="front-center">Front Center</option>
              <option value="front-left">Front Left</option>
              <option value="side">Side</option>
              <option value="back">Back</option>
            </select>
          </div>
        );

      case AssetType.Lanyard:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Lanyard Design</h4>
            <input type="text" name="repeatText" value={customContent.repeatText || ''} onChange={onChange} placeholder="Repeating Text" className={inputClassName} />
            <select name="lanyardWidth" value={customContent.lanyardWidth || ''} onChange={onChange} className={inputClassName}>
              <option value="">Width</option>
              <option value="0.5">1/2 inch (12mm)</option>
              <option value="0.75">3/4 inch (20mm) - Standard</option>
              <option value="1">1 inch (25mm)</option>
            </select>
            <select name="clipType" value={customContent.clipType || ''} onChange={onChange} className={inputClassName}>
              <option value="">Clip Type</option>
              <option value="bulldog">Bulldog Clip</option>
              <option value="j-hook">J-Hook</option>
              <option value="lobster-claw">Lobster Claw</option>
              <option value="badge-reel">Badge Reel</option>
            </select>
          </div>
        );

      case AssetType.SwagBag:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Swag Bag Design</h4>
            <input type="text" name="bagText" value={customContent.bagText || ''} onChange={onChange} placeholder="Main Text / Slogan" className={inputClassName} />
            <select name="bagType" value={customContent.bagType || ''} onChange={onChange} className={inputClassName}>
              <option value="">Bag Type</option>
              <option value="tote">Cotton Tote</option>
              <option value="drawstring">Drawstring Backpack</option>
              <option value="paper">Paper Gift Bag</option>
              <option value="reusable">Reusable Shopping Bag</option>
            </select>
            <input type="text" name="sponsorArea" value={customContent.sponsorArea || ''} onChange={onChange} placeholder="Sponsor Names" className={inputClassName} />
          </div>
        );

      case AssetType.WaterBottle:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Water Bottle Label</h4>
            <input type="text" name="labelText" value={customContent.labelText || ''} onChange={onChange} placeholder="Label Text" className={inputClassName} />
            <input type="text" name="tagline" value={customContent.tagline || ''} onChange={onChange} placeholder="Tagline" className={inputClassName} />
            <select name="bottleSize" value={customContent.bottleSize || ''} onChange={onChange} className={inputClassName}>
              <option value="">Bottle Size</option>
              <option value="16oz">16 oz (500ml)</option>
              <option value="20oz">20 oz (600ml)</option>
              <option value="32oz">32 oz (1L)</option>
            </select>
          </div>
        );

      case AssetType.StickerSheet:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Sticker Collection</h4>
            <textarea name="stickerConcepts" value={customContent.stickerConcepts || ''} onChange={onChange} placeholder="Sticker concepts (one per line)&#10;Event logo&#10;Fun mascot&#10;Hashtag&#10;Date badge" rows={4} className={inputClassName + ' resize-none'} />
            <select name="stickerFinish" value={customContent.stickerFinish || ''} onChange={onChange} className={inputClassName}>
              <option value="">Finish</option>
              <option value="matte">Matte</option>
              <option value="glossy">Glossy</option>
              <option value="holographic">Holographic</option>
              <option value="die-cut">Die-Cut</option>
            </select>
          </div>
        );

      // ═══════════════════════════════════════════════════════════════════════
      // DIGITAL ASSETS
      // ═══════════════════════════════════════════════════════════════════════
      case AssetType.SocialPost:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Social Media Post</h4>
            <input type="text" name="headline" value={customContent.headline || ''} onChange={onChange} placeholder="Headline Text" className={inputClassName} />
            <textarea name="caption" value={customContent.caption || ''} onChange={onChange} placeholder="Caption / Body text" rows={2} className={inputClassName + ' resize-none'} />
            <input type="text" name="hashtags" value={customContent.hashtags || ''} onChange={onChange} placeholder="Hashtags (e.g., #TechSummit2026)" className={inputClassName} />
            <input type="text" name="cta" value={customContent.cta || ''} onChange={onChange} placeholder="Call to Action (e.g., Link in bio!)" className={inputClassName} />
            <select name="platform" value={customContent.platform || ''} onChange={onChange} className={inputClassName}>
              <option value="">Platform</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter/X</option>
            </select>
          </div>
        );

      case AssetType.SocialStory:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Story / Reel</h4>
            <input type="text" name="mainText" value={customContent.mainText || ''} onChange={onChange} placeholder="Main Text Overlay" className={inputClassName} />
            <input type="text" name="swipeUpText" value={customContent.swipeUpText || ''} onChange={onChange} placeholder="Swipe Up / Link Text" className={inputClassName} />
            <input type="text" name="countdown" value={customContent.countdown || ''} onChange={onChange} placeholder="Countdown (e.g., 5 Days Left!)" className={inputClassName} />
            <select name="storyType" value={customContent.storyType || ''} onChange={onChange} className={inputClassName}>
              <option value="">Story Type</option>
              <option value="announcement">Announcement</option>
              <option value="countdown">Countdown</option>
              <option value="behindscenes">Behind the Scenes</option>
              <option value="speaker-spotlight">Speaker Spotlight</option>
            </select>
          </div>
        );

      case AssetType.EmailHeader:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Email Header</h4>
            <input type="text" name="emailSubject" value={customContent.emailSubject || ''} onChange={onChange} placeholder="Email Subject/Theme" className={inputClassName} />
            <input type="text" name="preheader" value={customContent.preheader || ''} onChange={onChange} placeholder="Preheader Text" className={inputClassName} />
            <select name="emailType" value={customContent.emailType || ''} onChange={onChange} className={inputClassName}>
              <option value="">Email Type</option>
              <option value="invitation">Invitation</option>
              <option value="reminder">Reminder</option>
              <option value="confirmation">Confirmation</option>
              <option value="follow-up">Follow-up</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </div>
        );

      // ═══════════════════════════════════════════════════════════════════════
      // UTILITIES
      // ═══════════════════════════════════════════════════════════════════════
      case AssetType.WifiSign:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">WiFi Information</h4>
            <input type="text" name="networkName" value={customContent.networkName || ''} onChange={onChange} placeholder="Network Name (SSID)" className={inputClassName} />
            <input type="text" name="password" value={customContent.password || ''} onChange={onChange} placeholder="Password" className={inputClassName} />
            <select name="securityType" value={customContent.securityType || ''} onChange={onChange} className={inputClassName}>
              <option value="">Security Type</option>
              <option value="WPA2">WPA2</option>
              <option value="WPA3">WPA3</option>
              <option value="open">Open (No Password)</option>
            </select>
            <input type="text" name="additionalInfo" value={customContent.additionalInfo || ''} onChange={onChange} placeholder="Additional Info (e.g., Guest network)" className={inputClassName} />
          </div>
        );

      case AssetType.QRCode:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">QR Code Content</h4>
            <input type="text" name="qrUrl" value={customContent.qrUrl || ''} onChange={onChange} placeholder="URL to encode" className={inputClassName} />
            <input type="text" name="qrLabel" value={customContent.qrLabel || ''} onChange={onChange} placeholder="Label below QR" className={inputClassName} />
            <select name="qrPurpose" value={customContent.qrPurpose || ''} onChange={onChange} className={inputClassName}>
              <option value="">Purpose</option>
              <option value="registration">Event Registration</option>
              <option value="app-download">App Download</option>
              <option value="feedback">Feedback Form</option>
              <option value="schedule">Schedule / Agenda</option>
              <option value="wifi">WiFi Connect</option>
              <option value="social">Social Media</option>
            </select>
          </div>
        );

      case AssetType.PhotoBoothFrame:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Photo Frame</h4>
            <input type="text" name="frameText" value={customContent.frameText || ''} onChange={onChange} placeholder="Frame Text / Hashtag" className={inputClassName} />
            <input type="text" name="eventDate" value={customContent.eventDate || ''} onChange={onChange} placeholder="Event Date" className={inputClassName} />
            <select name="frameStyle" value={customContent.frameStyle || ''} onChange={onChange} className={inputClassName}>
              <option value="">Frame Style</option>
              <option value="polaroid">Polaroid</option>
              <option value="photo-booth">Photo Booth Strip</option>
              <option value="instagram">Instagram Style</option>
              <option value="decorative">Decorative Border</option>
            </select>
          </div>
        );

      // ═══════════════════════════════════════════════════════════════════════
      // EXPERIENCE & VENUE
      // ═══════════════════════════════════════════════════════════════════════
      case AssetType.MainStageBackdrop:
      case AssetType.BackWall:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Backdrop Design</h4>
            <input type="text" name="mainTitle" value={customContent.mainTitle || ''} onChange={onChange} placeholder="Main Title" className={inputClassName} />
            <input type="text" name="subtitle" value={customContent.subtitle || ''} onChange={onChange} placeholder="Subtitle / Tagline" className={inputClassName} />
            <select name="backdropStyle" value={customContent.backdropStyle || ''} onChange={onChange} className={inputClassName}>
              <option value="">Style</option>
              <option value="step-repeat">Step & Repeat (Logos)</option>
              <option value="solid">Solid with Logo</option>
              <option value="gradient">Gradient</option>
              <option value="photo-op">Photo Op Design</option>
            </select>
            <input type="text" name="sponsorLogos" value={customContent.sponsorLogos || ''} onChange={onChange} placeholder="Sponsor Names (comma separated)" className={inputClassName} />
          </div>
        );

      case AssetType.RegistrationCounter:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Registration Desk</h4>
            <input type="text" name="welcomeText" value={customContent.welcomeText || ''} onChange={onChange} placeholder="Welcome Text" className={inputClassName} />
            <input type="text" name="instructions" value={customContent.instructions || ''} onChange={onChange} placeholder="Check-in Instructions" className={inputClassName} />
            <input type="text" name="deskLabels" value={customContent.deskLabels || ''} onChange={onChange} placeholder="Desk Labels (e.g., A-M, N-Z, VIP)" className={inputClassName} />
          </div>
        );

      case AssetType.TableNumber:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Table Number</h4>
            <input type="text" name="tableNumber" value={customContent.tableNumber || ''} onChange={onChange} placeholder="Table Number / Name" className={inputClassName} />
            <select name="tableStyle" value={customContent.tableStyle || ''} onChange={onChange} className={inputClassName}>
              <option value="">Style</option>
              <option value="numeric">Numeric (1, 2, 3...)</option>
              <option value="named">Named (Rose, Lily...)</option>
              <option value="themed">Themed (Tech Terms, Cities...)</option>
            </select>
          </div>
        );

      case AssetType.PlaceCard:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Place Card</h4>
            <input type="text" name="guestName" value={customContent.guestName || ''} onChange={onChange} placeholder="Guest Name" className={inputClassName} />
            <input type="text" name="tableAssignment" value={customContent.tableAssignment || ''} onChange={onChange} placeholder="Table Assignment" className={inputClassName} />
            <input type="text" name="dietaryRestrictions" value={customContent.dietaryRestrictions || ''} onChange={onChange} placeholder="Dietary Notes (V, GF, etc.)" className={inputClassName} />
          </div>
        );

      case AssetType.CertificateAward:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Certificate Details</h4>
            <input type="text" name="recipientName" value={customContent.recipientName || ''} onChange={onChange} placeholder="Recipient Name" className={inputClassName} />
            <input type="text" name="achievement" value={customContent.achievement || ''} onChange={onChange} placeholder="Achievement / Participation Title" className={inputClassName} />
            <input type="text" name="dateAwarded" value={customContent.dateAwarded || ''} onChange={onChange} placeholder="Date Awarded" className={inputClassName} />
            <input type="text" name="signatoryName" value={customContent.signatoryName || ''} onChange={onChange} placeholder="Signatory Name" className={inputClassName} />
            <input type="text" name="signatoryTitle" value={customContent.signatoryTitle || ''} onChange={onChange} placeholder="Signatory Title" className={inputClassName} />
          </div>
        );

      case AssetType.InvitationCard:
      case AssetType.RSVPCard:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Invitation Details</h4>
            <input type="text" name="guestName" value={customContent.guestName || ''} onChange={onChange} placeholder="Guest Name (or leave blank)" className={inputClassName} />
            <input type="text" name="eventTitle" value={customContent.eventTitle || ''} onChange={onChange} placeholder="Event Title" className={inputClassName} />
            <input type="text" name="hostName" value={customContent.hostName || ''} onChange={onChange} placeholder="Host Name" className={inputClassName} />
            <input type="text" name="eventDateTime" value={customContent.eventDateTime || ''} onChange={onChange} placeholder="Date & Time" className={inputClassName} />
            <input type="text" name="venue" value={customContent.venue || ''} onChange={onChange} placeholder="Venue" className={inputClassName} />
            <input type="text" name="rsvpDeadline" value={customContent.rsvpDeadline || ''} onChange={onChange} placeholder="RSVP Deadline" className={inputClassName} />
            <input type="text" name="dresscode" value={customContent.dresscode || ''} onChange={onChange} placeholder="Dress Code" className={inputClassName} />
          </div>
        );

      case AssetType.TicketDesign:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Ticket Details</h4>
            <input type="text" name="ticketType" value={customContent.ticketType || ''} onChange={onChange} placeholder="Ticket Type (e.g., VIP, General)" className={inputClassName} />
            <input type="text" name="eventTitle" value={customContent.eventTitle || ''} onChange={onChange} placeholder="Event Title" className={inputClassName} />
            <input type="text" name="eventDateTime" value={customContent.eventDateTime || ''} onChange={onChange} placeholder="Date & Time" className={inputClassName} />
            <input type="text" name="venue" value={customContent.venue || ''} onChange={onChange} placeholder="Venue" className={inputClassName} />
            <input type="text" name="seatInfo" value={customContent.seatInfo || ''} onChange={onChange} placeholder="Seat / Section Info" className={inputClassName} />
            <input type="text" name="price" value={customContent.price || ''} onChange={onChange} placeholder="Price" className={inputClassName} />
          </div>
        );

      case AssetType.WristbandDesign:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Wristband Design</h4>
            <input type="text" name="wristbandText" value={customContent.wristbandText || ''} onChange={onChange} placeholder="Wristband Text" className={inputClassName} />
            <select name="accessLevel" value={customContent.accessLevel || ''} onChange={onChange} className={inputClassName}>
              <option value="">Access Level</option>
              <option value="general">General Admission</option>
              <option value="vip">VIP</option>
              <option value="backstage">Backstage</option>
              <option value="press">Press</option>
              <option value="staff">Staff</option>
            </select>
            <input type="text" name="dayInfo" value={customContent.dayInfo || ''} onChange={onChange} placeholder="Day/Date Info" className={inputClassName} />
          </div>
        );

      case AssetType.VIPBadge:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">VIP Badge</h4>
            <input type="text" name="name" value={customContent.name || ''} onChange={onChange} placeholder="VIP Name" className={inputClassName} />
            <input type="text" name="title" value={customContent.title || ''} onChange={onChange} placeholder="Title / Role" className={inputClassName} />
            <input type="text" name="company" value={customContent.company || ''} onChange={onChange} placeholder="Company / Organization" className={inputClassName} />
            <select name="vipLevel" value={customContent.vipLevel || ''} onChange={onChange} className={inputClassName}>
              <option value="">VIP Level</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
              <option value="diamond">Diamond</option>
              <option value="speaker">Speaker</option>
              <option value="sponsor">Sponsor</option>
            </select>
          </div>
        );

      case AssetType.ParkingPass:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Parking Pass</h4>
            <input type="text" name="vehicleName" value={customContent.vehicleName || ''} onChange={onChange} placeholder="Driver Name" className={inputClassName} />
            <input type="text" name="lotSection" value={customContent.lotSection || ''} onChange={onChange} placeholder="Lot / Section" className={inputClassName} />
            <input type="text" name="validDates" value={customContent.validDates || ''} onChange={onChange} placeholder="Valid Dates" className={inputClassName} />
            <select name="parkingType" value={customContent.parkingType || ''} onChange={onChange} className={inputClassName}>
              <option value="">Parking Type</option>
              <option value="general">General</option>
              <option value="vip">VIP</option>
              <option value="handicap">Accessible</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
        );

      // ═══════════════════════════════════════════════════════════════════════
      // PRESENTATIONS & SLIDES
      // ═══════════════════════════════════════════════════════════════════════
      case AssetType.Presentation:
      case AssetType.PresentationSlide:
      case AssetType.WebinarSlide:
        return (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Deck Basics</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Tell the AI what this deck is about. The more you provide, the smarter the layouts.
              </p>
            </div>
            <input
              type="text"
              name="deckTitle"
              value={customContent.deckTitle || ''}
              onChange={onChange}
              placeholder="Deck title (e.g. Q2 Product Roadmap)"
              className={inputClassName}
            />
            <input
              type="text"
              name="deckSubtitle"
              value={customContent.deckSubtitle || ''}
              onChange={onChange}
              placeholder="Subtitle / tagline"
              className={inputClassName}
            />
            <input
              type="text"
              name="audience"
              value={customContent.audience || ''}
              onChange={onChange}
              placeholder="Audience (e.g. Executive team, Investors, Sales kickoff)"
              className={inputClassName}
            />
            <input
              type="text"
              name="goal"
              value={customContent.goal || ''}
              onChange={onChange}
              placeholder="Goal of the deck (e.g. Get budget approval)"
              className={inputClassName}
            />
            <select
              name="slideCount"
              value={customContent.slideCount || ''}
              onChange={onChange}
              className={inputClassName}
            >
              <option value="">Number of slides</option>
              <option value="5">~5 slides (lightning)</option>
              <option value="10">~10 slides (standard)</option>
              <option value="15">~15 slides (detailed)</option>
              <option value="20">~20 slides (deep dive)</option>
            </select>

            <div className="pt-3">
              <label className="text-sm font-medium text-foreground block mb-1">
                Content brief
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Paste your full content — outline, bullets, talking points, or a rough draft.
                Use <code className="px-1 py-0.5 rounded bg-muted">## Slide Title</code> on its own line
                to lock in slide breaks, or just dump notes and let the AI structure it.
              </p>

              {/* Example templates — click to insert/append a structure */}
              <div className="mb-2">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
                  Insert example template
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SLIDE_BRIEF_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        const current = (customContent.contentBrief || '').trim();
                        const next = current
                          ? current + '\n\n' + tpl.content
                          : tpl.content;
                        // Synthesize a change event so onChange handler treats it like typing
                        const synthetic = {
                          target: { name: 'contentBrief', value: next },
                          currentTarget: { name: 'contentBrief', value: next },
                        } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
                        onChange(synthetic);
                      }}
                      title={tpl.description}
                      className="px-2.5 py-1 rounded-md text-xs border border-border bg-muted/40 hover:bg-muted hover:border-primary/50 text-foreground transition-colors flex items-center gap-1.5"
                    >
                      <span>{tpl.icon}</span>
                      <span>{tpl.label}</span>
                    </button>
                  ))}
                  {customContent.contentBrief && (
                    <button
                      type="button"
                      onClick={() => {
                        const synthetic = {
                          target: { name: 'contentBrief', value: '' },
                          currentTarget: { name: 'contentBrief', value: '' },
                        } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
                        onChange(synthetic);
                      }}
                      className="px-2.5 py-1 rounded-md text-xs border border-border/60 bg-transparent hover:bg-destructive/10 hover:border-destructive/50 text-muted-foreground hover:text-destructive transition-colors ml-auto"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <textarea
                name="contentBrief"
                value={customContent.contentBrief || ''}
                onChange={onChange}
                rows={10}
                placeholder={`Click a template above, or type your own:\n\n## Why now\nMarket grew 40% YoY. Competitors raising prices. Window closes Q3.\n\n## Our advantage\n- 3x faster onboarding\n- 92% retention\n- Proprietary dataset\n\n## The ask\n$2M to scale GTM team across EMEA.`}
                className={inputClassName + ' resize-y font-mono text-sm leading-relaxed min-h-[260px]'}
              />
            </div>

            <div className="pt-2">
              <label className="text-sm font-medium text-foreground block mb-1">
                Key stats / numbers (optional)
              </label>
              <textarea
                name="keyStats"
                value={customContent.keyStats || ''}
                onChange={onChange}
                rows={3}
                placeholder="One per line — e.g.\n92% customer retention\n$4.2M ARR\n3x faster than competitors"
                className={inputClassName + ' resize-y'}
              />
            </div>

            <div className="pt-2">
              <label className="text-sm font-medium text-foreground block mb-1">
                Speaker notes (optional)
              </label>
              <textarea
                name="speakerNotes"
                value={customContent.speakerNotes || ''}
                onChange={onChange}
                rows={3}
                placeholder="Anything you want the AI to know but not display on slides — tone, things to emphasize, what to avoid…"
                className={inputClassName + ' resize-y'}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const fields = renderFields();
  
  if (!fields) return null;

  return (
    <div className="pt-3 border-t border-border">
      {fields}
    </div>
  );
};

export default AssetSpecificFields;
