// Asset defaults: dimensions, variables, base scene, base layout, base guards per asset type
import type { Level5AssetType, AssetDefaults, AssetDimensions, SceneSpec } from "../../types/eventTemplateSystem";

// ─── Dimension presets ────────────────────────────────
const dims = {
  badge4x6: { size: '4"×6"', dpi: 300, colorMode: "CMYK" as const, bleed: "0.125in", safeMargin: "0.25in" },
  badge3x4: { size: '3.5"×5"', dpi: 300, colorMode: "CMYK" as const, bleed: "0.125in", safeMargin: "0.25in" },
  card5x7: { size: '5"×7"', dpi: 300, colorMode: "CMYK" as const, bleed: "0.125in", safeMargin: "0.25in" },
  card4x6: { size: '4"×6"', dpi: 300, colorMode: "CMYK" as const, bleed: "0.125in", safeMargin: "0.25in" },
  a4: { size: '8.5"×11"', dpi: 300, colorMode: "CMYK" as const, bleed: "0.125in", safeMargin: "0.5in" },
  tabloid: { size: '11"×17"', dpi: 300, colorMode: "CMYK" as const, bleed: "0.125in", safeMargin: "0.5in" },
  banner24x36: { size: '24"×36"', dpi: 150, colorMode: "CMYK" as const, bleed: "0.25in", safeMargin: "1in" },
  banner33x80: { size: '33"×80"', dpi: 150, colorMode: "CMYK" as const, bleed: "0.5in", safeMargin: "2in" },
  stepRepeat: { size: '8\'×8\'', dpi: 150, colorMode: "CMYK" as const, bleed: "3in" },
  backdrop: { size: '40\'×16\'', dpi: 100, colorMode: "CMYK" as const },
  backWall: { size: '8\'×10\'', dpi: 100, colorMode: "CMYK" as const },
  social1080: { size: "1080×1080px", dpi: 72, colorMode: "RGB" as const },
  story1080x1920: { size: "1080×1920px", dpi: 72, colorMode: "RGB" as const },
  header1500x500: { size: "1500×500px", dpi: 72, colorMode: "RGB" as const },
  slide16x9: { size: "1920×1080px", dpi: 150, colorMode: "RGB" as const },
  email600: { size: "600×200px", dpi: 72, colorMode: "RGB" as const },
  icon512: { size: "512×512px", dpi: 72, colorMode: "RGB" as const },
  favicon: { size: "64×64px", dpi: 72, colorMode: "RGB" as const },
  tshirt: { size: '14"×16" print area', dpi: 300, colorMode: "CMYK" as const },
  hat: { size: '4"×2.5" embroidery field', dpi: 300, colorMode: "CMYK" as const },
  tableTent: { size: '4"×6" folded', dpi: 300, colorMode: "CMYK" as const, bleed: "0.125in" },
  placeCard: { size: '3.5"×2" folded', dpi: 300, colorMode: "CMYK" as const },
  wristband: { size: '10"×0.75"', dpi: 300, colorMode: "CMYK" as const },
  lanyard: { size: '36"×0.75" strap', dpi: 300, colorMode: "CMYK" as const },
  coaster: { size: '4"×4" round/square', dpi: 300, colorMode: "CMYK" as const, bleed: "0.125in" },
  napkin: { size: '5"×5" cocktail', dpi: 300, colorMode: "CMYK" as const },
  floorDecal: { size: '24"×24" or custom', dpi: 150, colorMode: "CMYK" as const },
  menuCard: { size: '4.25"×11"', dpi: 300, colorMode: "CMYK" as const, bleed: "0.125in" },
  programBooklet: { size: '5.5"×8.5"', dpi: 300, colorMode: "CMYK" as const, bleed: "0.125in", safeMargin: "0.375in" },
  folder: { size: '9"×12" with pocket', dpi: 300, colorMode: "CMYK" as const, bleed: "0.125in" },
  stickerSheet: { size: '8.5"×11" sheet', dpi: 300, colorMode: "CMYK" as const },
  waterBottle: { size: '8"×2.5" wrap', dpi: 300, colorMode: "CMYK" as const },
};

// ─── Common variable sets ─────────────────────────────
const coreVars = ["eventName", "logo", "colors"];
const badgeVars = [...coreVars, "attendeeName", "company", "title", "qrCode", "accessLevelColor"];
const signageVars = [...coreVars, "headline", "directionalCopy"];
const socialVars = [...coreVars, "headline", "subheadline", "cta", "hashtag"];
const merchVars = [...coreVars, "tagline"];
const docVars = [...coreVars, "bodyText", "date", "location"];

// ─── Scene factory ────────────────────────────────────
function scene(env: string, mounting: string, people = "Hands/people nearby for scale; no faces required.", lighting = "Soft professional venue lighting."): SceneSpec {
  return {
    environment: env,
    mounting,
    people,
    lighting,
    realismConstraints: [
      "No floating layout — asset must appear physically present",
      "Natural reflections and shadows",
      "No invented logos or sponsor marks",
      "Readable micro details without melting",
    ],
  };
}

// ─── Base guards ──────────────────────────────────────
const printGuards = [
  "All text readable at intended viewing distance",
  "Hierarchy: logo/event → primary info → secondary info → QR/utility",
  "No tiny type below 8pt equivalent at print size",
  "QR codes maintain clean quiet zone",
  "CMYK-safe colors only",
];
const digitalGuards = [
  "Hierarchy passes 3-second scan test",
  "Text readable on mobile screens",
  "Colors vibrant for screen display",
  "Safe zones respected for platform UI overlays",
];

// ─── Master defaults map ──────────────────────────────
const defaults: Partial<Record<Level5AssetType, AssetDefaults>> = {
  // ─ CREDENTIALS ─
  VIP_BADGE: { dimensions: dims.badge4x6, variables: badgeVars, baseTags: ["Badges", "Premium"], baseLayout: ["Top header band: logo + event name", "Name zone centered mid-card (largest type)", "Company + title below; QR bottom-right"], baseScene: scene("Registration counter with badges in trays", "Rigid PVC with matte lamination; lanyard slot"), baseGuards: printGuards },
  SECURITY_BADGE: { dimensions: dims.badge3x4, variables: [...badgeVars, "securityLevel"], baseTags: ["Badges", "Security"], baseLayout: ["Bold header with SECURITY designation", "Photo zone left; credentials right", "Access level color band"], baseScene: scene("Security checkpoint table", "Rigid PVC with clip attachment"), baseGuards: printGuards },
  BACKSTAGE_PASS: { dimensions: dims.badge4x6, variables: [...badgeVars, "accessZones"], baseTags: ["Badges", "Backstage"], baseLayout: ["Header band with access level", "Large attendee name", "Zone access list; holographic stripe"], baseScene: scene("Backstage area with equipment cases", "Laminated card with lanyard or adhesive"), baseGuards: printGuards },
  MEDIA_CREDENTIAL: { dimensions: dims.badge4x6, variables: [...badgeVars, "outlet", "photoUrl"], baseTags: ["Badges", "Media"], baseLayout: ["PRESS/MEDIA header", "Photo zone + name/outlet", "Access zones; restrictions"], baseScene: scene("Press room or media riser", "Rigid credential with clip"), baseGuards: printGuards },
  PARKING_PASS: { dimensions: dims.card4x6, variables: [...coreVars, "lotCode", "date", "vehicleInfo"], baseTags: ["Passes", "Parking"], baseLayout: ["Large lot identifier", "Date/event info", "Vehicle details; barcode"], baseScene: scene("Car dashboard, mirror-hang style", "Cardstock with mirror hang hole"), baseGuards: printGuards },
  TICKET_DESIGN: { dimensions: { size: '5.5"×2"', dpi: 300, colorMode: "CMYK", bleed: "0.125in" }, variables: [...coreVars, "date", "time", "venue", "section", "barcode"], baseTags: ["Tickets"], baseLayout: ["Stub + main body", "Event info prominent", "Barcode/QR on stub"], baseScene: scene("Ticket window or hand holding ticket", "Thick cardstock with perforated tear"), baseGuards: printGuards },
  WRISTBAND_DESIGN: { dimensions: dims.wristband, variables: [...coreVars, "accessLevel", "dayCode"], baseTags: ["Wristbands"], baseLayout: ["Continuous band design", "Logo + event name repeat", "Day/access color coding"], baseScene: scene("Wrist wearing band, event in background", "Tyvek/vinyl/fabric material"), baseGuards: printGuards },
  NAME_TAG: { dimensions: dims.badge4x6, variables: badgeVars, baseTags: ["Badges", "Name Tags"], baseLayout: ["Header: logo + event name", "Large name (dominant)", "Company/title; optional pronouns"], baseScene: scene("Registration area with badge trays", "PVC or cardstock with lanyard"), baseGuards: printGuards },
  NAME_TAG_BACK: { dimensions: dims.badge4x6, variables: [...coreVars, "schedule", "map", "emergencyInfo", "sponsorLogos"], baseTags: ["Badges", "Utility"], baseLayout: ["Schedule or map fill", "Emergency info", "Sponsor logos bottom"], baseScene: scene("Badge flipped showing back", "Same card stock as front"), baseGuards: printGuards },

  // ─ SIGNAGE ─
  BANNER: { dimensions: dims.banner33x80, variables: signageVars, baseTags: ["Signage", "Banners"], baseLayout: ["Logo upper third", "Headline center", "CTA/details lower; 2in bottom clear for retractor"], baseScene: scene("Hotel lobby or convention center entrance", "Retractable banner stand, slight curl at bottom"), baseGuards: printGuards },
  EVENT_SIGNAGE: { dimensions: dims.banner24x36, variables: [...signageVars, "icon"], baseTags: ["Signage", "Wayfinding"], baseLayout: ["Icon + directional arrow dominant", "Location name large", "Logo top corner"], baseScene: scene("Convention center hallway", "Mounted on easel or wall-fixed"), baseGuards: printGuards },
  HANGING_SIGNAGE: { dimensions: { size: '36" circular or 24"×36" rect', dpi: 100, colorMode: "CMYK" }, variables: signageVars, baseTags: ["Signage", "Hanging"], baseLayout: ["360° readable", "Big directional copy", "Logo centered both sides"], baseScene: scene("Hanging from convention center ceiling truss", "Double-sided with cables"), baseGuards: [...printGuards, "Minimum letter height for distance viewing"] },
  OUTDOOR_SIGNAGE: { dimensions: { size: '36"×48"', dpi: 150, colorMode: "CMYK" }, variables: signageVars, baseTags: ["Signage", "Outdoor"], baseLayout: ["Bold headline", "Directional arrow", "Weather-resistant design"], baseScene: scene("Outdoor entrance, parking area", "Coroplast or aluminum substrate"), baseGuards: [...printGuards, "UV/weather resistance consideration", "High contrast for daylight"] },
  DOOR_SIGNAGE: { dimensions: { size: '8.5"×11"', dpi: 300, colorMode: "CMYK" }, variables: [...signageVars, "roomName", "sessionTitle"], baseTags: ["Signage", "Doors"], baseLayout: ["Room name prominent", "Session info", "Logo top"], baseScene: scene("Hotel/conference room door", "Printed insert in door sign holder"), baseGuards: printGuards },
  EASEL_SIGNAGE: { dimensions: dims.banner24x36, variables: [...signageVars, "schedule"], baseTags: ["Signage", "Easel"], baseLayout: ["Welcome header", "Schedule or directions", "Sponsors bottom"], baseScene: scene("Lobby entrance on wooden or metal easel", "Foam board or poster on easel"), baseGuards: printGuards },
  LOCATION_SIGNAGE: { dimensions: { size: '12"×18"', dpi: 300, colorMode: "CMYK" }, variables: [...signageVars, "icon", "locationName"], baseTags: ["Signage", "Location"], baseLayout: ["Icon + location name", "Directional info", "Logo small top"], baseScene: scene("Hallway or junction point", "Wall-mounted acrylic or foam"), baseGuards: printGuards },
  ROOM_SIGNAGE: { dimensions: { size: '10"×8"', dpi: 300, colorMode: "CMYK" }, variables: [...signageVars, "roomName", "capacity"], baseTags: ["Signage", "Room"], baseLayout: ["Room name large", "Track color indicator", "Capacity/amenities"], baseScene: scene("Next to conference room door", "Acrylic holder or adhesive mount"), baseGuards: printGuards },
  STAND_UP_PILLAR_BANNER: { dimensions: dims.banner33x80, variables: signageVars, baseTags: ["Signage", "Pillar"], baseLayout: ["Vertical format", "Logo upper third", "Key message center"], baseScene: scene("Convention floor near pillar", "Stand-up display unit"), baseGuards: printGuards },
  FEATHER_FLAG: { dimensions: { size: '2.5\'×8\' flag', dpi: 100, colorMode: "CMYK" }, variables: [...coreVars, "headline"], baseTags: ["Flags"], baseLayout: ["Logo upper third", "Headline center", "Vertical flow"], baseScene: scene("Outdoor entrance or parking lot", "Feather flag on ground spike"), baseGuards: printGuards },
  TEARDROP_FLAG: { dimensions: { size: '2.5\'×6\' flag', dpi: 100, colorMode: "CMYK" }, variables: [...coreVars, "headline"], baseTags: ["Flags"], baseLayout: ["Logo upper curve", "Headline center", "Teardrop shape constraint"], baseScene: scene("Indoor lobby or outdoor pathway", "Teardrop flag on weighted base"), baseGuards: printGuards },
  FLOOR_DECAL: { dimensions: dims.floorDecal, variables: [...coreVars, "arrow", "zoneName"], baseTags: ["Signage", "Floor"], baseLayout: ["Arrow dominant", "Zone/direction text", "Logo trailing edge"], baseScene: scene("Convention floor, foot traffic visible", "Vinyl floor decal, slip-resistant"), baseGuards: [...printGuards, "Safety compliance", "High-contrast arrows"] },

  // ─ STAGE & VENUE ─
  MAIN_STAGE_BACKDROP: { dimensions: dims.backdrop, variables: [...coreVars, "speakerSafeZone"], baseTags: ["Stage", "Large Format"], baseLayout: ["Brand field upper third", "Speaker-safe center zone", "Screen avoidance zones marked"], baseScene: scene("Main stage with podium, screens flanking", "Fabric or LED panel backdrop"), baseGuards: [...printGuards, "Lighting interaction: avoid low-contrast behind logo"] },
  BACK_WALL: { dimensions: dims.backWall, variables: coreVars, baseTags: ["Stage", "Photo Wall"], baseLayout: ["Logo upper third", "Photo-friendly clear zone at face height", "Minimal detail near faces"], baseScene: scene("Photo-op wall behind reception/stage area", "Fabric or vinyl on frame"), baseGuards: [...printGuards, "Flash reflection avoidance"] },
  STEP_AND_REPEAT: { dimensions: dims.stepRepeat, variables: [...coreVars, "sponsorLogos", "tieringRules"], baseTags: ["Stage", "Step & Repeat"], baseLayout: ["Tiled grid: alternating logo + sponsor", "Consistent gutters", "Sponsor tiering (primary larger)"], baseScene: scene("Red carpet / photo-op area with stanchions", "Fabric or vinyl on pop-up frame"), baseGuards: [...printGuards, "Camera-flash-friendly contrast"] },
  REGISTRATION_COUNTER: { dimensions: { size: '6\'×3\' counter front', dpi: 100, colorMode: "CMYK" }, variables: [...coreVars, "welcomeMessage"], baseTags: ["Venue", "Registration"], baseLayout: ["Logo front-center", "Welcome message", "Clean uncluttered"], baseScene: scene("Registration area with staff behind counter", "Counter wrap or printed panel"), baseGuards: printGuards },
  KIOSK: { dimensions: { size: '22"×28" panel', dpi: 150, colorMode: "CMYK" }, variables: [...coreVars, "instructions"], baseTags: ["Venue", "Kiosk"], baseLayout: ["Header with logo", "Step-by-step instructions", "CTA button zone"], baseScene: scene("Self-service kiosk in lobby", "Printed panel on kiosk structure"), baseGuards: printGuards },
  ELEVATOR_WRAP: { dimensions: { size: '5\'×7\' per door', dpi: 100, colorMode: "CMYK" }, variables: [...coreVars, "floorDirectory"], baseTags: ["Venue", "Wrap"], baseLayout: ["Upper panel: logo + event", "Door split design", "Floor directory"], baseScene: scene("Elevator bank in hotel/convention center", "Vinyl wrap on elevator doors"), baseGuards: printGuards },
  COLUMN_WRAP: { dimensions: { size: '3\' diameter × 8\' height', dpi: 100, colorMode: "CMYK" }, variables: [...coreVars, "directionalInfo"], baseTags: ["Venue", "Wrap"], baseLayout: ["360° design", "Logo repeated vertically", "Directional info bands"], baseScene: scene("Convention floor near main pillars", "Vinyl wrap around structural column"), baseGuards: printGuards },
  CEILING_HANGER: { dimensions: { size: '36" diameter or 24"×36"', dpi: 100, colorMode: "CMYK" }, variables: [...coreVars, "zoneName"], baseTags: ["Venue", "Hanging"], baseLayout: ["Zone/direction dominant", "Logo centered", "360° visible"], baseScene: scene("Hanging from ceiling grid in expo hall", "Rigid hanging sign with cables"), baseGuards: [...printGuards, "Must read from 30+ feet"] },
  GLASS_DOOR: { dimensions: { size: '36"×80"', dpi: 100, colorMode: "CMYK" }, variables: [...coreVars, "promoText"], baseTags: ["Venue", "Glass"], baseLayout: ["Frosted/clear band", "Logo in band", "Sightlines maintained"], baseScene: scene("Glass entrance door to ballroom/session", "Frosted vinyl or clear cling"), baseGuards: printGuards },
  GLASS_DOUBLE_DOOR: { dimensions: { size: '72"×80" (2 panels)', dpi: 100, colorMode: "CMYK" }, variables: [...coreVars, "promoText"], baseTags: ["Venue", "Glass"], baseLayout: ["Continuous design across both panels", "Logo centered at split", "Safety stripe"], baseScene: scene("Double glass entry doors", "Vinyl cling spanning both panels"), baseGuards: printGuards },
  GLASS_ROTATING_DOOR: { dimensions: { size: '3-4 panel revolving', dpi: 100, colorMode: "CMYK" }, variables: [...coreVars, "safetyStripe"], baseTags: ["Venue", "Glass"], baseLayout: ["Sequential design per panel", "Safety strips required", "Logo on each panel"], baseScene: scene("Hotel revolving entrance door", "Clear cling with safety markings"), baseGuards: [...printGuards, "Safety compliance required"] },

  // ─ FOOD & BEVERAGE ─
  MENU: { dimensions: dims.menuCard, variables: [...docVars, "menuItems", "dietaryIcons"], baseTags: ["F&B", "Menu"], baseLayout: ["Header: logo + event name", "Menu sections with items", "Dietary icons legend"], baseScene: scene("Table setting with menu card propped", "Thick cardstock, possibly letterpressed"), baseGuards: printGuards },
  BAR_MENU: { dimensions: dims.menuCard, variables: [...docVars, "cocktails", "pricing"], baseTags: ["F&B", "Bar"], baseLayout: ["Header with event/bar name", "Cocktail list with descriptions", "Low-light optimized contrast"], baseScene: scene("Bar counter with moody lighting", "Cardstock in acrylic holder"), baseGuards: [...printGuards, "Must be readable in low light"] },
  TABLE_TENT: { dimensions: dims.tableTent, variables: [...coreVars, "promoText", "qrCode"], baseTags: ["F&B", "Table"], baseLayout: ["Front: promo/info", "Back: sponsor/QR", "Logo bottom corner"], baseScene: scene("Dining table with place settings", "Folded cardstock tent"), baseGuards: printGuards },
  PLACE_CARD: { dimensions: dims.placeCard, variables: [...coreVars, "guestName", "tableNumber"], baseTags: ["F&B", "Seating"], baseLayout: ["Guest name dominant", "Table number", "Logo subtle top"], baseScene: scene("Table setting with plate and flatware", "Folded cardstock or flat card"), baseGuards: printGuards },
  TABLE_NUMBER: { dimensions: { size: '5"×7"', dpi: 300, colorMode: "CMYK" }, variables: [...coreVars, "number"], baseTags: ["F&B", "Table"], baseLayout: ["Number dominant (huge)", "Event branding subtle", "Both sides identical"], baseScene: scene("Center of dining table", "Cardstock in holder or freestanding"), baseGuards: printGuards },
  CATERING_LABEL: { dimensions: { size: '3"×2"', dpi: 300, colorMode: "CMYK" }, variables: [...coreVars, "dishName", "ingredients", "allergens"], baseTags: ["F&B", "Labels"], baseLayout: ["Dish name top", "Ingredients/allergens", "Dietary icons"], baseScene: scene("Buffet line next to serving dish", "Small card in holder"), baseGuards: printGuards },
  DIETARY_CARD: { dimensions: { size: '2.5"×3.5"', dpi: 300, colorMode: "CMYK" }, variables: [...coreVars, "dietaryType", "icons"], baseTags: ["F&B", "Dietary"], baseLayout: ["Dietary type large", "Icons prominent", "High contrast"], baseScene: scene("Place setting or buffet", "Small card"), baseGuards: [...printGuards, "High contrast for accessibility"] },

  // ─ MERCH ─
  TSHIRT: { dimensions: dims.tshirt, variables: merchVars, baseTags: ["Merch", "Apparel"], baseLayout: ["Left-chest or center graphic", "Event name/date", "Clean, printable design"], baseScene: scene("Folded shirt on table or worn by person", "Cotton tee with screen print"), baseGuards: [...printGuards, "Embroidery/print realism"] },
  TSHIRT_BACK: { dimensions: dims.tshirt, variables: [...merchVars, "schedule", "hashtag", "sponsorLogos"], baseTags: ["Merch", "Apparel"], baseLayout: ["Large graphic or text", "Schedule/hashtag/sponsors", "Readable from behind"], baseScene: scene("Person wearing shirt, back view", "Screen print on cotton"), baseGuards: printGuards },
  TSHIRT_SLEEVE: { dimensions: { size: '3"×3" sleeve print', dpi: 300, colorMode: "CMYK" }, variables: [...coreVars, "year"], baseTags: ["Merch", "Apparel"], baseLayout: ["Small logo or year mark", "Simple, single placement"], baseScene: scene("Close-up of sleeve print", "Screen print or embroidery"), baseGuards: printGuards },
  HAT: { dimensions: dims.hat, variables: merchVars, baseTags: ["Merch", "Apparel"], baseLayout: ["Front panel: logo centered", "Text-only or icon+text", "Embroidery field constraints"], baseScene: scene("Hat on display or worn", "Structured cap with embroidery"), baseGuards: [...printGuards, "Embroidery stitch count realism"] },
  LANYARD: { dimensions: dims.lanyard, variables: [...coreVars, "sponsorLogos"], baseTags: ["Merch", "Lanyard"], baseLayout: ["Repeat pattern along strap", "Logo + event name alternating", "Sponsor logos if applicable"], baseScene: scene("Lanyard with badge attached, worn or laid flat", "Woven or dye-sublimated polyester"), baseGuards: printGuards },
  SWAG_BAG: { dimensions: { size: '15"×16" tote', dpi: 150, colorMode: "CMYK" }, variables: merchVars, baseTags: ["Merch", "Bags"], baseLayout: ["Logo centered or upper third", "Event name/tagline", "Generous margins"], baseScene: scene("Tote bag on registration counter or carried", "Canvas or non-woven tote"), baseGuards: printGuards },
  WATER_BOTTLE: { dimensions: dims.waterBottle, variables: merchVars, baseTags: ["Merch", "Drinkware"], baseLayout: ["Logo centered on main face", "Event name/date", "Wrap-around design optional"], baseScene: scene("Water bottle on conference table", "Stainless steel or aluminum"), baseGuards: printGuards },
  VOLUNTEER_VEST: { dimensions: { size: 'Front: 4"×4"; Back: 12"×14"', dpi: 150, colorMode: "CMYK" }, variables: [...merchVars, "role"], baseTags: ["Merch", "Staff"], baseLayout: ["VOLUNTEER/STAFF large back text", "Logo front left chest", "Role designation"], baseScene: scene("Person wearing vest at event", "Safety vest or polo"), baseGuards: printGuards },

  // ─ SOCIAL & DIGITAL ─
  SOCIAL_POST: { dimensions: dims.social1080, variables: socialVars, baseTags: ["Social", "Digital"], baseLayout: ["Headline dominant", "Supporting visual", "Logo bottom corner; hashtag"], baseScene: scene("Phone screen or social media feed mockup", "Digital display, no physical product"), baseGuards: digitalGuards },
  SOCIAL_STORY: { dimensions: dims.story1080x1920, variables: socialVars, baseTags: ["Social", "Stories"], baseLayout: ["Top safe zone for platform UI", "Headline mid-frame", "CTA/swipe indicator bottom"], baseScene: scene("Phone screen showing story", "Vertical digital display"), baseGuards: [...digitalGuards, "Platform UI overlay safe zones"] },
  EMAIL_HEADER: { dimensions: dims.email600, variables: [...coreVars, "headline"], baseTags: ["Digital", "Email"], baseLayout: ["Logo left or centered", "Headline right or below", "Clean, fast-loading"], baseScene: scene("Email client preview", "Digital, optimized for email rendering"), baseGuards: digitalGuards },
  LINKEDIN_BANNER: { dimensions: { size: "1584×396px", dpi: 72, colorMode: "RGB" }, variables: socialVars, baseTags: ["Social", "LinkedIn"], baseLayout: ["Event info centered", "Logo right-safe zone", "Profile photo avoidance left"], baseScene: scene("LinkedIn profile page", "Digital banner"), baseGuards: [...digitalGuards, "Profile photo overlap zone avoidance"] },
  TWITTER_HEADER: { dimensions: dims.header1500x500, variables: socialVars, baseTags: ["Social", "Twitter"], baseLayout: ["Event info centered", "Logo right side", "Avatar overlap avoidance"], baseScene: scene("Twitter/X profile page", "Digital banner"), baseGuards: [...digitalGuards, "Avatar overlap zone avoidance"] },
  YOUTUBE_THUMBNAIL: { dimensions: { size: "1280×720px", dpi: 72, colorMode: "RGB" }, variables: [...socialVars, "speakerName"], baseTags: ["Social", "Video"], baseLayout: ["Face/visual dominant", "Title overlay bold", "Logo small corner"], baseScene: scene("YouTube browse/search results", "Digital thumbnail"), baseGuards: [...digitalGuards, "Readable at 120×67px thumbnail size"] },
  PODCAST_COVER: { dimensions: { size: "3000×3000px", dpi: 72, colorMode: "RGB" }, variables: [...coreVars, "podcastName", "episodeTitle"], baseTags: ["Digital", "Podcast"], baseLayout: ["Show name dominant", "Visual motif", "Logo corner"], baseScene: scene("Podcast app grid", "Digital square cover"), baseGuards: digitalGuards },
  APP_ICON: { dimensions: dims.icon512, variables: coreVars, baseTags: ["Digital", "App"], baseLayout: ["Mark/monogram centered", "Rounded corners platform standard", "No text (too small)"], baseScene: scene("Phone home screen grid", "Digital app icon"), baseGuards: [...digitalGuards, "Readable at 29×29pt minimum"] },
  FAVICON: { dimensions: dims.favicon, variables: coreVars, baseTags: ["Digital", "Web"], baseLayout: ["Simplified mark only", "Maximum contrast", "No text"], baseScene: scene("Browser tab bar", "Tiny digital icon"), baseGuards: [...digitalGuards, "Readable at 16×16px"] },
  ZOOM_BACKGROUND: { dimensions: dims.slide16x9, variables: coreVars, baseTags: ["Digital", "Virtual"], baseLayout: ["Branded but not busy", "Logo bottom-right", "Face-friendly center zone"], baseScene: scene("Video call with person silhouette", "Digital background"), baseGuards: digitalGuards },
  WEBINAR_SLIDE: { dimensions: dims.slide16x9, variables: [...socialVars, "speakerName", "speakerTitle"], baseTags: ["Digital", "Presentations"], baseLayout: ["Title slide: headline center", "Logo corner", "Speaker info lower third"], baseScene: scene("Webinar platform view", "Digital slide"), baseGuards: digitalGuards },
  LIVE_STREAM_OVERLAY: { dimensions: dims.slide16x9, variables: [...coreVars, "speakerName", "topic", "socialHandles"], baseTags: ["Digital", "Streaming"], baseLayout: ["Lower third: name + topic", "Logo corner", "Social handles"], baseScene: scene("Live stream with speaker video", "Transparent overlay on video"), baseGuards: digitalGuards },

  // ─ DOCUMENTS ─
  INVITATION_CARD: { dimensions: dims.card5x7, variables: [...docVars, "time", "dressCode", "rsvpUrl"], baseTags: ["Documents", "Invitations"], baseLayout: ["Event name prominent", "Date/time/location", "RSVP info; logo subtle"], baseScene: scene("Card on desk with envelope", "Thick cardstock, possibly letterpressed"), baseGuards: printGuards },
  RSVP_CARD: { dimensions: { size: '3.5"×5"', dpi: 300, colorMode: "CMYK" }, variables: [...coreVars, "responseOptions", "mealChoices", "qrCode"], baseTags: ["Documents", "RSVP"], baseLayout: ["Response fields", "Meal options if applicable", "QR/URL for digital RSVP"], baseScene: scene("Card on desk or in envelope", "Matching cardstock to invitation"), baseGuards: printGuards },
  PROGRAM_BOOKLET: { dimensions: dims.programBooklet, variables: [...docVars, "schedule", "speakers", "sponsorLogos", "maps"], baseTags: ["Documents", "Program"], baseLayout: ["Cover: event name + logo prominent", "Inside: master grid, sections", "Sponsor pages; map spread"], baseScene: scene("Open booklet on conference table", "Saddle-stitched or perfect-bound"), baseGuards: printGuards },
  CERTIFICATE_AWARD: { dimensions: dims.a4, variables: [...docVars, "recipientName", "awardTitle", "signatories"], baseTags: ["Documents", "Awards"], baseLayout: ["Formal border/frame", "Recipient name prominent", "Seal/signature zone bottom"], baseScene: scene("Certificate in frame or being presented", "Heavy stock with possible foil"), baseGuards: printGuards },
  THANK_YOU_NOTE: { dimensions: dims.card4x6, variables: [...coreVars, "recipientType", "message"], baseTags: ["Documents", "Thanks"], baseLayout: ["Logo top subtle", "Personal message", "Signature zone"], baseScene: scene("Card on desk with pen", "Quality cardstock, possibly letterpress"), baseGuards: printGuards },
  PRESS_RELEASE: { dimensions: dims.a4, variables: [...docVars, "headline", "subheadline", "bodyText", "contact"], baseTags: ["Documents", "PR"], baseLayout: ["Letterhead: logo top-left", "FOR IMMEDIATE RELEASE header", "Standard AP format body"], baseScene: scene("Printed document on desk", "Standard white paper, letterhead"), baseGuards: printGuards },
  MEDIA_KIT: { dimensions: dims.a4, variables: [...docVars, "stats", "photos", "bios", "factSheet"], baseTags: ["Documents", "Media"], baseLayout: ["Cover: premium brand showcase", "Inside: fact sheet, bios, photos", "Contact/download info"], baseScene: scene("Printed folder with inserts or tablet display", "Premium print or digital PDF"), baseGuards: printGuards },
  SPONSOR_PACKAGE: { dimensions: dims.a4, variables: [...docVars, "tiers", "benefits", "pricing", "deadlines"], baseTags: ["Documents", "Sponsors"], baseLayout: ["Cover: premium event showcase", "Tier comparison table", "Benefits + pricing; contact"], baseScene: scene("Printed deck on conference table", "Premium bound or digital"), baseGuards: printGuards },
  FOLDER: { dimensions: dims.folder, variables: coreVars, baseTags: ["Documents", "Stationery"], baseLayout: ["Front cover: logo + event", "Inside: pocket for inserts", "Spine: event name"], baseScene: scene("Folder on desk with documents inside", "Thick stock with pockets; possible spot UV"), baseGuards: printGuards },

  // ─ PRESENTATIONS ─
  PRESENTATION_SLIDE: { dimensions: dims.slide16x9, variables: [...socialVars, "slideContent"], baseTags: ["Presentations"], baseLayout: ["Title: headline center", "Content area with margins", "Logo corner persistent"], baseScene: scene("Projected on screen in conference room", "Digital presentation slide"), baseGuards: digitalGuards },
  AGENDA_HIGHLIGHTS: { dimensions: dims.slide16x9, variables: [...coreVars, "sessions", "tracks", "times"], baseTags: ["Presentations", "Agenda"], baseLayout: ["Schedule grid/list", "Now/Next callout", "Sponsor frame bottom"], baseScene: scene("Digital signage screen in lobby", "Digital display or print poster"), baseGuards: digitalGuards },
  SESSION_EVALUATION: { dimensions: dims.card4x6, variables: [...coreVars, "sessionTitle", "ratingScale", "qrCode"], baseTags: ["Documents", "Feedback"], baseLayout: ["Session title top", "Quick rating bubbles", "QR for digital form"], baseScene: scene("Card on seat or handed out", "Cardstock, pencil-friendly"), baseGuards: printGuards },

  // ─ SPECIALTY ─
  PHOTO_BOOTH_FRAME: { dimensions: { size: '20"×30" frame', dpi: 150, colorMode: "CMYK" }, variables: [...coreVars, "hashtag", "socialHandle"], baseTags: ["Engagement", "Photo"], baseLayout: ["Frame border with branding", "Open center for photos", "Hashtag/handle bottom"], baseScene: scene("Photo booth area with props", "Rigid foam or cardboard frame"), baseGuards: printGuards },
  QR_CODE: { dimensions: { size: "Variable", dpi: 300, colorMode: "CMYK" }, variables: [...coreVars, "url", "label"], baseTags: ["Utility", "QR"], baseLayout: ["QR code centered", "Label/CTA below", "Logo optional center dot"], baseScene: scene("Printed card or signage close-up", "Clean print on quality stock"), baseGuards: [...printGuards, "Quiet zone maintained", "Scan-tested at size"] },
  WIFI_SIGN: { dimensions: { size: '8.5"×11" or 5"×7"', dpi: 300, colorMode: "CMYK" }, variables: [...coreVars, "networkName", "password", "qrCode"], baseTags: ["Utility", "Signage"], baseLayout: ["WiFi icon prominent", "Network/password large readable", "QR for auto-connect"], baseScene: scene("Mounted on wall or table tent", "Printed card or sign"), baseGuards: [...printGuards, "Must be readable from 6+ feet"] },
  NETWORKING_BINGO: { dimensions: dims.a4, variables: [...coreVars, "prompts", "prizeInfo"], baseTags: ["Engagement", "Activity"], baseLayout: ["5×5 bingo grid", "Conversation prompts in cells", "Prize info bottom"], baseScene: scene("Card on table at networking event", "Cardstock with pen space"), baseGuards: printGuards },
  EMERGENCY_GUIDE: { dimensions: dims.card4x6, variables: [...coreVars, "emergencyNumbers", "exitRoutes", "medicalInfo"], baseTags: ["Safety", "Emergency"], baseLayout: ["EMERGENCY GUIDE header bold", "Key numbers + exits", "Medical info"], baseScene: scene("Pocket card or badge back", "Laminated card"), baseGuards: [...printGuards, "Ultra-high contrast", "Multi-language consideration"] },
  ACCESSIBILITY_SIGNAGE: { dimensions: { size: '12"×18"', dpi: 300, colorMode: "CMYK" }, variables: [...coreVars, "accessibilityType", "icon", "directions"], baseTags: ["Safety", "ADA"], baseLayout: ["ADA icon prominent", "Clear directions", "High contrast, large type"], baseScene: scene("Mounted at accessible entrance/facility", "Rigid sign, ADA compliant"), baseGuards: [...printGuards, "ADA compliance", "Tactile/Braille consideration"] },
  DIGITAL_SIGNAGE_LOOP: { dimensions: dims.slide16x9, variables: [...coreVars, "schedule", "announcements", "sponsorLogos"], baseTags: ["Digital", "Signage"], baseLayout: ["Rotating content zones", "Schedule bar", "Sponsor frame"], baseScene: scene("Large screen in lobby", "Digital display"), baseGuards: digitalGuards },
  EVENT_APP_SPLASH: { dimensions: { size: "1290×2796px", dpi: 72, colorMode: "RGB" }, variables: [...coreVars, "tagline"], baseTags: ["Digital", "App"], baseLayout: ["Logo centered", "Tagline below", "Loading indicator bottom"], baseScene: scene("Phone screen showing app launch", "Mobile app splash"), baseGuards: digitalGuards },
  COUNTDOWN_TIMER: { dimensions: dims.slide16x9, variables: [...coreVars, "targetDate"], baseTags: ["Digital", "Timer"], baseLayout: ["Large numerals (days/hours/min/sec)", "Event name", "Logo subtle"], baseScene: scene("Digital display or social share", "Animated digital"), baseGuards: digitalGuards },
  PHOTOREALISTIC_SHOT: { dimensions: dims.slide16x9, variables: [...coreVars, "sceneDescription"], baseTags: ["Marketing", "Photo"], baseLayout: ["Full-scene photo rendering", "Branded elements in situ", "No overlay text"], baseScene: scene("Complete event venue setup", "Photorealistic 3D render"), baseGuards: digitalGuards },
  FLOOR_PLAN: { dimensions: dims.a4, variables: [...coreVars, "rooms", "zones", "legend"], baseTags: ["Utility", "Maps"], baseLayout: ["Plan view centered", "Legend/key", "Logo header"], baseScene: scene("Printed map or digital display", "Print or digital"), baseGuards: printGuards },
  STICKER_SHEET: { dimensions: dims.stickerSheet, variables: [...coreVars, "stickerDesigns"], baseTags: ["Merch", "Stickers"], baseLayout: ["Grid of individual stickers", "Die-cut lines", "Logo sticker included"], baseScene: scene("Sticker sheet on table being peeled", "Vinyl or paper stickers on kiss-cut sheet"), baseGuards: printGuards },

  // ─ BRANDING ─
  PALETTE: { dimensions: { size: "1080×1080px", dpi: 150, colorMode: "RGB" }, variables: coreVars, baseTags: ["Branding"], baseLayout: ["Color swatches with hex/RGB values", "Primary/secondary/accent hierarchy", "Usage notes"], baseScene: scene("Design studio context", "Digital color reference"), baseGuards: digitalGuards },
  LOGO: { dimensions: { size: "2000×2000px", dpi: 300, colorMode: "CMYK" }, variables: coreVars, baseTags: ["Branding", "Logo"], baseLayout: ["Logo centered with clear space", "Multiple lockup options", "Size variations"], baseScene: scene("Logo on various applications", "Brand mark showcase"), baseGuards: printGuards },
  LOGO_MONOCHROME: { dimensions: { size: "2000×2000px", dpi: 300, colorMode: "CMYK" }, variables: coreVars, baseTags: ["Branding", "Logo"], baseLayout: ["Single-color version", "Black and white variants", "Minimum size test"], baseScene: scene("Stamped/embossed applications", "Monochrome reproduction"), baseGuards: printGuards },
  LOGO_REVERSED: { dimensions: { size: "2000×2000px", dpi: 300, colorMode: "CMYK" }, variables: coreVars, baseTags: ["Branding", "Logo"], baseLayout: ["Light-on-dark version", "Contrast protection demo", "Various dark backgrounds"], baseScene: scene("Dark background applications", "Reversed color application"), baseGuards: printGuards },
  SLOGANS: { dimensions: { size: "1080×1080px", dpi: 150, colorMode: "RGB" }, variables: [...coreVars, "slogan"], baseTags: ["Branding", "Copy"], baseLayout: ["Slogan as hero text", "Brand mark supporting", "Typography showcase"], baseScene: scene("Marketing material or signage", "Typography-focused"), baseGuards: digitalGuards },
  STYLE_GUIDE: { dimensions: dims.a4, variables: [...coreVars, "typography", "colorSpecs", "usageRules"], baseTags: ["Branding", "Guidelines"], baseLayout: ["Cover: brand showcase", "Typography specimen", "Color specs; usage dos/donts"], baseScene: scene("Printed guide or tablet display", "Premium document"), baseGuards: printGuards },
  SEAMLESS_PATTERN: { dimensions: { size: "1000×1000px tileable", dpi: 300, colorMode: "CMYK" }, variables: coreVars, baseTags: ["Branding", "Pattern"], baseLayout: ["Seamless tile edges", "Brand motif integration", "Density balanced"], baseScene: scene("Pattern applied to surface", "Tileable swatch"), baseGuards: printGuards },

  // ─ OPERATIONAL ─
  MARKETING_COPY: { dimensions: { size: "N/A — text output", dpi: 72, colorMode: "RGB" }, variables: [...docVars, "wordCount", "tone", "audience"], baseTags: ["Copy", "Marketing"], baseLayout: ["Headline", "Body copy", "CTA"], baseScene: scene("N/A — text content", "Written copy"), baseGuards: ["Grammar check", "Word count adherence", "Brand voice consistency"] },
  SEATING_CHART: { dimensions: dims.tabloid, variables: [...coreVars, "tables", "guests"], baseTags: ["Utility", "Seating"], baseLayout: ["Table map or alphabetical list", "Easy name lookup", "Logo header"], baseScene: scene("Printed poster at reception entrance", "Large format poster"), baseGuards: printGuards },
  RUN_OF_SHOW: { dimensions: dims.a4, variables: [...docVars, "cues", "timings", "personnel"], baseTags: ["Operations", "Production"], baseLayout: ["Time-based grid", "Cue descriptions", "Personnel assignments"], baseScene: scene("Production desk with monitor", "Printed sheet or tablet"), baseGuards: printGuards },
  VIDEO_TEASER: { dimensions: dims.slide16x9, variables: [...coreVars, "duration", "keyMoments"], baseTags: ["Video", "Marketing"], baseLayout: ["Storyboard frames", "Title card", "End card with CTA"], baseScene: scene("Video player or social feed", "Digital video"), baseGuards: digitalGuards },
  NAPKIN_DESIGN: { dimensions: dims.napkin, variables: coreVars, baseTags: ["F&B", "Napkin"], baseLayout: ["Central or corner motif", "Foil or print treatment", "Elegant restraint"], baseScene: scene("Folded napkin on place setting", "Cocktail napkin, printed or foil-stamped"), baseGuards: printGuards },
  COASTER_DESIGN: { dimensions: dims.coaster, variables: [...coreVars, "qrCode", "triviaQuestion"], baseTags: ["F&B", "Coaster"], baseLayout: ["Logo centered or offset", "Supporting content (QR/trivia)", "Die-cut safe zone"], baseScene: scene("Coaster on bar with glass", "Thick absorbent cardboard or cork"), baseGuards: printGuards },
  ANIMATED_LOGO: { dimensions: { size: "1080×1080px", dpi: 72, colorMode: "RGB" }, variables: coreVars, baseTags: ["Branding", "Animation"], baseLayout: ["Logo animation sequence", "Reveal → hold → resolve", "Loopable"], baseScene: scene("Screen display or presentation intro", "Motion graphic"), baseGuards: digitalGuards },
};

/** Get defaults for an asset type, with fallback for unlisted types */
export function getAssetDefaults(assetType: Level5AssetType): AssetDefaults {
  return defaults[assetType] ?? {
    dimensions: dims.social1080,
    variables: coreVars,
    baseTags: ["General"],
    baseLayout: ["Logo prominent", "Event name/headline", "Supporting information"],
    baseScene: scene("Professional event environment", "Appropriate physical or digital medium"),
    baseGuards: digitalGuards,
  };
}
