import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default prompt templates for all asset types
const DEFAULT_PROMPTS: { asset_type: string; template_name: string; prompt_template: string; variables: string[] }[] = [
  // BRANDING & IDENTITY
  {
    asset_type: 'PALETTE',
    template_name: 'Event Color Palette',
    prompt_template: 'Generate a sophisticated color palette for {{eventName}}, a {{eventType}} event. Include 5-6 colors with primary, secondary, and accent colors that evoke {{mood}}. Consider the venue location {{location}} and any cultural significance. Provide hex, RGB, CMYK, and suggested Pantone values.',
    variables: ['eventName', 'eventType', 'mood', 'location']
  },
  {
    asset_type: 'LOGO',
    template_name: 'Primary Event Logo',
    prompt_template: 'Design a professional, memorable logo for {{eventName}}. Style: {{style}}. The logo should work at small and large sizes, be suitable for both print and digital use. Incorporate elements that reflect {{theme}}. Clean, modern design with clear typography. High contrast for visibility.',
    variables: ['eventName', 'style', 'theme']
  },
  {
    asset_type: 'LOGO_MONOCHROME',
    template_name: 'Monochrome Logo Variant',
    prompt_template: 'Create a single-color monochrome version of the {{eventName}} logo. Optimize for one-color printing, embossing, and watermarks. Maintain brand recognition while simplifying to work in black, white, or single brand color.',
    variables: ['eventName']
  },
  {
    asset_type: 'LOGO_REVERSED',
    template_name: 'Reversed Logo Variant',
    prompt_template: 'Design a reversed/knockout version of the {{eventName}} logo for use on dark backgrounds. White or light-colored version that maintains legibility and brand impact on dark surfaces, photos, and gradients.',
    variables: ['eventName']
  },
  {
    asset_type: 'SLOGANS',
    template_name: 'Event Taglines',
    prompt_template: 'Generate 5 compelling taglines/slogans for {{eventName}}, a {{eventType}} about {{theme}}. Make them memorable, action-oriented, and suitable for marketing materials. Include variations for different contexts: formal, casual, call-to-action, and inspirational.',
    variables: ['eventName', 'eventType', 'theme']
  },
  {
    asset_type: 'STYLE_GUIDE',
    template_name: 'Brand Style Guide',
    prompt_template: 'Create comprehensive brand guidelines for {{eventName}} including: logo usage rules, color specifications, typography hierarchy, spacing/clear space requirements, do\'s and don\'ts, tone of voice, and application examples. Professional, detailed documentation.',
    variables: ['eventName']
  },
  {
    asset_type: 'SEAMLESS_PATTERN',
    template_name: 'Brand Pattern',
    prompt_template: 'Design a seamless tileable pattern for {{eventName}} using brand elements and colors {{colors}}. Suitable for backgrounds, merchandise, and packaging. Subtle enough for text overlay but distinctive. Modern, {{style}} aesthetic.',
    variables: ['eventName', 'colors', 'style']
  },
  
  // PRINT & SIGNAGE
  {
    asset_type: 'NAME_TAG',
    template_name: 'Attendee Badge Front',
    prompt_template: 'Design a professional name badge for {{eventName}}. Include space for: attendee name (prominent), company, role/title, and event logo. Use brand colors {{colors}}. Clean, readable typography. 4x3 inch format with 0.125" bleed. Print-ready CMYK.',
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'NAME_TAG_BACK',
    template_name: 'Attendee Badge Back',
    prompt_template: 'Design the back of the name badge for {{eventName}}. Include: event schedule overview, WiFi credentials, emergency contact, venue map, and sponsor logos area. Functional and informative layout.',
    variables: ['eventName']
  },
  {
    asset_type: 'BANNER',
    template_name: 'Large Event Banner',
    prompt_template: 'Create an 8ft x 3ft horizontal event banner for {{eventName}}. Bold, eye-catching design with event logo, name, date {{date}}, and location {{location}}. High visual impact, readable from distance. Brand colors {{colors}}. 150 DPI for large format.',
    variables: ['eventName', 'date', 'location', 'colors']
  },
  {
    asset_type: 'EVENT_SIGNAGE',
    template_name: 'General Directional Sign',
    prompt_template: 'Design clear directional signage for {{eventName}}. Include arrow indicators, room/area names, and event branding. High contrast for accessibility, readable from 20+ feet. 24x36 inch format. ADA-compliant typography.',
    variables: ['eventName']
  },
  {
    asset_type: 'HANGING_SIGNAGE',
    template_name: 'Overhead Hanging Sign',
    prompt_template: 'Create overhead hanging signage for {{eventName}}. Readable from below at angles. Bold typography, event branding, and directional elements. 36x24 inch format. Consider viewing from multiple directions.',
    variables: ['eventName']
  },
  {
    asset_type: 'OUTDOOR_SIGNAGE',
    template_name: 'Exterior Event Sign',
    prompt_template: 'Design weather-resistant outdoor signage for {{eventName}}. Large format 48x72 inch. High visibility, UV-resistant design considerations. Event name, date {{date}}, entry directions. Brand colors with high contrast.',
    variables: ['eventName', 'date']
  },
  {
    asset_type: 'DOOR_SIGNAGE',
    template_name: 'Room Door Sign',
    prompt_template: 'Create 8.5x11 inch door signage for {{eventName}}. Room name/number prominently displayed, session info area, event branding. Clean, professional, easy to update. Print on standard paper.',
    variables: ['eventName']
  },
  {
    asset_type: 'EASEL_SIGNAGE',
    template_name: 'Foam Board Easel Sign',
    prompt_template: 'Design a 22x28 inch easel sign for {{eventName}}. Welcome message, event schedule, or directional info. Freestanding display, professional foam board mounting. Brand colors and logo integration.',
    variables: ['eventName']
  },
  {
    asset_type: 'LOCATION_SIGNAGE',
    template_name: 'Area Location Marker',
    prompt_template: 'Create location identification signage for {{eventName}}. Booth numbers, area names, section markers. Clear numbering/lettering system. 18x24 inch format. Consistent with overall event branding.',
    variables: ['eventName']
  },
  {
    asset_type: 'ROOM_SIGNAGE',
    template_name: 'Conference Room Sign',
    prompt_template: 'Design conference room signage for {{eventName}}. Room name, capacity, current session display area. 11x8.5 inch landscape format. Event branding, professional corporate style.',
    variables: ['eventName']
  },
  {
    asset_type: 'STAND_UP_PILLAR_BANNER',
    template_name: 'Retractable Banner Stand',
    prompt_template: 'Create a 33.5x80 inch retractable banner for {{eventName}}. Vertical layout with logo at top, key messaging, call-to-action, and contact info. Eye-catching, professional, trade show quality.',
    variables: ['eventName']
  },
  {
    asset_type: 'FEATHER_FLAG',
    template_name: 'Outdoor Feather Flag',
    prompt_template: 'Design a feather flag banner for {{eventName}}. Vertical 26x112 inch format. Event logo and name readable while flag moves. Bold colors {{colors}}, simple design. Double-sided printing consideration.',
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'TEARDROP_FLAG',
    template_name: 'Teardrop Banner Flag',
    prompt_template: 'Create a teardrop-shaped flag for {{eventName}}. 27.5x66.5 inch format. Event branding optimized for curved shape. Outdoor durability, high visibility design.',
    variables: ['eventName']
  },
  {
    asset_type: 'MENU',
    template_name: 'Event Menu Card',
    prompt_template: 'Design an elegant menu card for {{eventName}}. List food and beverage options with descriptions. 8.5x11 inch format. Brand colors {{colors}}, sophisticated typography. Space for dietary icons.',
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'FOLDER',
    template_name: 'Presentation Folder',
    prompt_template: 'Create a professional presentation folder for {{eventName}}. 9x12 inch with pockets. Event branding on front, sponsor area on back. Elegant, corporate quality. Die-cut pocket template.',
    variables: ['eventName']
  },
  {
    asset_type: 'THANK_YOU_NOTE',
    template_name: 'Post-Event Thank You',
    prompt_template: 'Design a heartfelt thank you card for {{eventName}} attendees. 5x7 inch format. Appreciation message, event highlights mention, next event teaser. Brand colors, warm and professional tone.',
    variables: ['eventName']
  },
  
  // MERCHANDISE
  {
    asset_type: 'TSHIRT',
    template_name: 'Event T-Shirt Front',
    prompt_template: 'Design a stylish t-shirt front for {{eventName}}. 12x16 inch print area. Event logo, creative graphic treatment, date {{date}}. Appeal to {{audience}}. DTG or screen print ready, max 8 colors for screen.',
    variables: ['eventName', 'date', 'audience']
  },
  {
    asset_type: 'TSHIRT_BACK',
    template_name: 'Event T-Shirt Back',
    prompt_template: 'Create t-shirt back design for {{eventName}}. Sponsor logos, event schedule, or creative graphic. 12x16 inch print area. Complement front design. Consider neckline placement.',
    variables: ['eventName']
  },
  {
    asset_type: 'TSHIRT_SLEEVE',
    template_name: 'T-Shirt Sleeve Print',
    prompt_template: 'Design a small sleeve print for {{eventName}}. 3.5x3.5 inch area. Simple logo, year, or icon. Subtle branding element. One or two colors for cost-effective printing.',
    variables: ['eventName']
  },
  {
    asset_type: 'HAT',
    template_name: 'Embroidered Cap Design',
    prompt_template: 'Create embroidery-ready cap design for {{eventName}}. 4x2.5 inch front panel. Simplified logo optimized for stitching, max 15,000 stitches. Consider thread color limitations.',
    variables: ['eventName']
  },
  {
    asset_type: 'LANYARD',
    template_name: 'Branded Lanyard',
    prompt_template: 'Design a branded lanyard for {{eventName}}. 0.75 inch width, repeating pattern. Event name/logo, sponsor integration. Sublimation print ready. Consider text orientation when worn.',
    variables: ['eventName']
  },
  {
    asset_type: 'SWAG_BAG',
    template_name: 'Event Swag Bag',
    prompt_template: 'Create swag bag design for {{eventName}}. Tote bag format with event branding. Front and back designs. Sustainable messaging optional. Fun, desirable, reusable design.',
    variables: ['eventName']
  },
  {
    asset_type: 'STICKER_SHEET',
    template_name: 'Branded Sticker Set',
    prompt_template: 'Design a sticker sheet for {{eventName}}. Multiple sticker designs: logo, icons, phrases, mascot. Die-cut shapes. Fun, shareable, Instagram-worthy. Vinyl or paper print ready.',
    variables: ['eventName']
  },
  {
    asset_type: 'WATER_BOTTLE',
    template_name: 'Branded Water Bottle',
    prompt_template: 'Create water bottle label/wrap design for {{eventName}}. Event branding, refreshing visuals. Wraparound or front label format. Consider bottle curvature in design.',
    variables: ['eventName']
  },
  
  // DIGITAL ASSETS
  {
    asset_type: 'SOCIAL_POST',
    template_name: 'Social Media Post',
    prompt_template: 'Design an engaging social media post for {{eventName}}. Square 1080x1080px format. Eye-catching, shareable, on-brand. Include event name, date {{date}}, and call-to-action. Optimized for Instagram/Facebook.',
    variables: ['eventName', 'date']
  },
  {
    asset_type: 'SOCIAL_STORY',
    template_name: 'Social Media Story',
    prompt_template: 'Create a vertical social story for {{eventName}}. 1080x1920px format. Dynamic, attention-grabbing within first 3 seconds. Swipe-up CTA area. Instagram/TikTok optimized.',
    variables: ['eventName']
  },
  {
    asset_type: 'EMAIL_HEADER',
    template_name: 'Email Newsletter Header',
    prompt_template: 'Design an email header banner for {{eventName}}. 600px wide, 200px tall. Event branding, date {{date}}, compelling visual. Optimized for email clients, lightweight file size.',
    variables: ['eventName', 'date']
  },
  {
    asset_type: 'PRESENTATION_SLIDE',
    template_name: 'Presentation Template',
    prompt_template: 'Create a presentation slide template for {{eventName}}. 16:9 format. Title slide, content slide, section divider, and closing slide layouts. Brand colors {{colors}}, professional typography.',
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'LINKEDIN_BANNER',
    template_name: 'LinkedIn Cover Image',
    prompt_template: 'Design a LinkedIn banner for {{eventName}}. 1584x396px format. Professional, corporate appeal. Event name, dates, key value proposition. Consider profile picture overlap area.',
    variables: ['eventName']
  },
  {
    asset_type: 'TWITTER_HEADER',
    template_name: 'Twitter/X Header',
    prompt_template: 'Create a Twitter header for {{eventName}}. 1500x500px format. Bold, memorable, brand-forward. Event hashtag, dates. Consider mobile cropping and profile overlap.',
    variables: ['eventName']
  },
  {
    asset_type: 'YOUTUBE_THUMBNAIL',
    template_name: 'YouTube Video Thumbnail',
    prompt_template: 'Design a YouTube thumbnail for {{eventName}} video content. 1280x720px format. High contrast, readable text, compelling imagery. Click-worthy, YouTube algorithm optimized.',
    variables: ['eventName']
  },
  {
    asset_type: 'PODCAST_COVER',
    template_name: 'Podcast Cover Art',
    prompt_template: 'Create podcast cover art for {{eventName}}. Square 3000x3000px format. Readable at small sizes, distinctive, professional. Event branding with audio/podcast visual cues.',
    variables: ['eventName']
  },
  {
    asset_type: 'ZOOM_BACKGROUND',
    template_name: 'Virtual Meeting Background',
    prompt_template: 'Design a Zoom virtual background for {{eventName}}. 1920x1080px format. Professional, not distracting. Event branding subtle but visible. Works with human silhouette overlay.',
    variables: ['eventName']
  },
  {
    asset_type: 'APP_ICON',
    template_name: 'Mobile App Icon',
    prompt_template: 'Create an app icon for {{eventName}} mobile app. 1024x1024px source. Simple, recognizable at small sizes. Event branding distilled to iconic form. iOS and Android optimized.',
    variables: ['eventName']
  },
  {
    asset_type: 'FAVICON',
    template_name: 'Website Favicon',
    prompt_template: 'Design a favicon for {{eventName}} website. 512x512px source, works at 16x16px. Simplified logo or initial. Recognizable in browser tabs. ICO and PNG formats.',
    variables: ['eventName']
  },
  {
    asset_type: 'EVENT_APP_SPLASH',
    template_name: 'App Splash Screen',
    prompt_template: 'Create a mobile app splash screen for {{eventName}}. Full-screen branding moment. Event logo centered, loading indicator area. Both portrait and landscape versions.',
    variables: ['eventName']
  },
  {
    asset_type: 'LIVE_STREAM_OVERLAY',
    template_name: 'Livestream Overlay',
    prompt_template: 'Design a livestream overlay for {{eventName}}. Lower third graphics, frame elements, speaker name cards. Transparent PNG elements. Professional broadcast quality.',
    variables: ['eventName']
  },
  {
    asset_type: 'WEBINAR_SLIDE',
    template_name: 'Webinar Presentation Slide',
    prompt_template: 'Create webinar slide designs for {{eventName}}. 16:9 format. Speaker intro, Q&A, poll, and thank you slides. Screen-share optimized, high contrast for video compression.',
    variables: ['eventName']
  },
  
  // VENUE & EXPERIENCE
  {
    asset_type: 'BACK_WALL',
    template_name: 'Stage Backdrop',
    prompt_template: 'Design a stage backdrop for {{eventName}}. Large format, high impact. Event branding, visual interest for photos. Consider speaker/presenter standing area. LED screen or printed backdrop specs.',
    variables: ['eventName']
  },
  {
    asset_type: 'MAIN_STAGE_BACKDROP',
    template_name: 'Main Stage Design',
    prompt_template: 'Create the main stage backdrop for {{eventName}}. Keynote-worthy, impressive scale. Event branding integrated with scenic design. Photo/video background consideration. {{dimensions}} format.',
    variables: ['eventName', 'dimensions']
  },
  {
    asset_type: 'REGISTRATION_COUNTER',
    template_name: 'Registration Desk Graphics',
    prompt_template: 'Design registration counter graphics for {{eventName}}. Front panel branding, welcome messaging. Clear wayfinding. Counter wrap or modular panel format.',
    variables: ['eventName']
  },
  {
    asset_type: 'REGISTRATION_BACK_WALL',
    template_name: 'Registration Area Backdrop',
    prompt_template: 'Create a backdrop for {{eventName}} registration area. Welcome messaging, event branding, photo opportunity. First impression design. Large format print specs.',
    variables: ['eventName']
  },
  {
    asset_type: 'KIOSK',
    template_name: 'Information Kiosk Graphics',
    prompt_template: 'Design information kiosk graphics for {{eventName}}. Interactive feel, clear UI elements, event branding. Touchscreen-friendly layout consideration. Digital display format.',
    variables: ['eventName']
  },
  {
    asset_type: 'STEP_AND_REPEAT',
    template_name: 'Step and Repeat Banner',
    prompt_template: 'Create a step and repeat banner for {{eventName}}. Logo and sponsor pattern optimized for photography. Proper spacing for head-shot framing. 8x8 or 8x10 foot format.',
    variables: ['eventName']
  },
  {
    asset_type: 'FLOOR_DECAL',
    template_name: 'Floor Graphics',
    prompt_template: 'Design floor decals for {{eventName}}. Wayfinding arrows, logo placements, or interactive elements. Anti-slip print consideration. Durable, high-traffic specs.',
    variables: ['eventName']
  },
  {
    asset_type: 'ELEVATOR_WRAP',
    template_name: 'Elevator Door Wrap',
    prompt_template: 'Create elevator door wrap graphics for {{eventName}}. Split design for opening doors. Event branding, floor directory optional. Removable adhesive application.',
    variables: ['eventName']
  },
  {
    asset_type: 'COLUMN_WRAP',
    template_name: 'Column Wrap Graphics',
    prompt_template: 'Design column wrap graphics for {{eventName}}. 360-degree branding on venue pillars. Event messaging, sponsor integration. Seamless wrap template.',
    variables: ['eventName']
  },
  {
    asset_type: 'CEILING_HANGER',
    template_name: 'Overhead Hanging Banner',
    prompt_template: 'Create ceiling hanger graphics for {{eventName}}. Visible from floor level, readable from angles. Event branding, directional elements. Lightweight material consideration.',
    variables: ['eventName']
  },
  
  // UTILITIES & FUNCTIONAL
  {
    asset_type: 'QR_CODE',
    template_name: 'Branded QR Code',
    prompt_template: 'Generate a branded QR code for {{eventName}} linking to {{url}}. Incorporate brand colors {{colors}}, logo center optional. Ensure scanning reliability. Multiple size exports.',
    variables: ['eventName', 'url', 'colors']
  },
  {
    asset_type: 'WIFI_SIGN',
    template_name: 'WiFi Credentials Sign',
    prompt_template: 'Design a WiFi information sign for {{eventName}}. Network name, password clearly displayed. QR code for easy connection. 8.5x11 or 11x17 inch format. Table tent option.',
    variables: ['eventName']
  },
  {
    asset_type: 'AGENDA_HIGHLIGHTS',
    template_name: 'Schedule Overview',
    prompt_template: 'Create an agenda highlights graphic for {{eventName}}. Key sessions, times, speakers. At-a-glance format. Print and digital versions. Brand colors {{colors}}.',
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'FLOOR_PLAN',
    template_name: 'Venue Floor Plan',
    prompt_template: 'Design a venue floor plan for {{eventName}} at {{location}}. Room layouts, booth locations, key amenities. Wayfinding legend. Print-ready and digital interactive versions.',
    variables: ['eventName', 'location']
  },
  
  // INVITATIONS & TICKETS
  {
    asset_type: 'INVITATION_CARD',
    template_name: 'Event Invitation',
    prompt_template: 'Design an elegant invitation for {{eventName}}. Event details: date {{date}}, location {{location}}, dress code. RSVP information. 5x7 inch print format. Sophisticated, on-brand.',
    variables: ['eventName', 'date', 'location']
  },
  {
    asset_type: 'RSVP_CARD',
    template_name: 'RSVP Response Card',
    prompt_template: 'Create an RSVP card for {{eventName}}. Response options, dietary preferences, plus-one field. 4x6 inch format. Coordinates with invitation design.',
    variables: ['eventName']
  },
  {
    asset_type: 'TICKET_DESIGN',
    template_name: 'Event Ticket',
    prompt_template: 'Design an event ticket for {{eventName}}. Date {{date}}, time, venue, seat/section info. Tear-off stub, barcode/QR area. Collectible quality, anti-counterfeit considerations.',
    variables: ['eventName', 'date']
  },
  {
    asset_type: 'VIP_BADGE',
    template_name: 'VIP Access Badge',
    prompt_template: 'Create a VIP badge design for {{eventName}}. Premium, exclusive feel. Gold/special color treatment. Clear VIP designation. 4x3 inch format. Lanyard-ready.',
    variables: ['eventName']
  },
  {
    asset_type: 'BACKSTAGE_PASS',
    template_name: 'Backstage Access Pass',
    prompt_template: 'Design a backstage pass for {{eventName}}. All-access designation, photo ID area optional. Distinctive from regular badges. Secure, hard to duplicate elements.',
    variables: ['eventName']
  },
  {
    asset_type: 'PARKING_PASS',
    template_name: 'Parking Permit',
    prompt_template: 'Create a parking pass for {{eventName}}. Hang tag or dashboard format. Date, event name, lot designation. Clear, readable from outside vehicle.',
    variables: ['eventName']
  },
  {
    asset_type: 'WRISTBAND_DESIGN',
    template_name: 'Event Wristband',
    prompt_template: 'Design an event wristband for {{eventName}}. Tyvek or fabric format. Event branding, date, access level color coding. Tamper-evident consideration.',
    variables: ['eventName']
  },
  
  // PROGRAM & DOCUMENTS
  {
    asset_type: 'PROGRAM_BOOKLET',
    template_name: 'Event Program Book',
    prompt_template: 'Design a program booklet for {{eventName}}. Cover, schedule pages, speaker bios, sponsor pages, maps. Saddle-stitch format. 5.5x8.5 inch finished size.',
    variables: ['eventName']
  },
  {
    asset_type: 'PRESS_RELEASE',
    template_name: 'Press Release Template',
    prompt_template: 'Create a press release template for {{eventName}}. Professional letterhead, proper formatting, contact information area. Print and digital versions.',
    variables: ['eventName']
  },
  {
    asset_type: 'MEDIA_KIT',
    template_name: 'Press Media Kit',
    prompt_template: 'Design a media kit for {{eventName}}. Fact sheet, high-res logos, executive bios, press release template. Professional folder format or digital PDF.',
    variables: ['eventName']
  },
  {
    asset_type: 'SPONSOR_PACKAGE',
    template_name: 'Sponsorship Prospectus',
    prompt_template: 'Create a sponsorship package for {{eventName}}. Tier levels, benefits, pricing, audience demographics. Compelling sales document. Print and presentation formats.',
    variables: ['eventName']
  },
  {
    asset_type: 'CERTIFICATE_AWARD',
    template_name: 'Award Certificate',
    prompt_template: 'Design an award certificate for {{eventName}}. Formal, prestigious appearance. Space for recipient name, award title, date, signatures. 8.5x11 inch, frame-ready.',
    variables: ['eventName']
  },
  
  // TABLE & DINING
  {
    asset_type: 'PLACE_CARD',
    template_name: 'Table Place Card',
    prompt_template: 'Design table place cards for {{eventName}}. Guest name display, fold format. Elegant, coordinates with event theme. 2x3.5 inch flat size.',
    variables: ['eventName']
  },
  {
    asset_type: 'TABLE_NUMBER',
    template_name: 'Table Number Sign',
    prompt_template: 'Create table number signs for {{eventName}}. Numbers 1-30+, consistent design. Stand-up tent or holder format. Event branding, elegant typography.',
    variables: ['eventName']
  },
  {
    asset_type: 'TABLE_TENT',
    template_name: 'Table Tent Card',
    prompt_template: 'Design table tent cards for {{eventName}}. Two-sided display, sponsor info or event messaging. 4x6 inch format. Self-standing fold design.',
    variables: ['eventName']
  },
  {
    asset_type: 'COASTER_DESIGN',
    template_name: 'Branded Coaster',
    prompt_template: 'Create coaster designs for {{eventName}}. 4 inch round or square. Event branding, fun messaging, or sponsor placement. Print-ready, multiple design variations.',
    variables: ['eventName']
  },
  {
    asset_type: 'NAPKIN_DESIGN',
    template_name: 'Branded Napkin',
    prompt_template: 'Design cocktail napkin graphics for {{eventName}}. Simple logo or pattern. Single or two-color printing typical. Elegant, subtle branding.',
    variables: ['eventName']
  },
  {
    asset_type: 'BAR_MENU',
    template_name: 'Bar/Drink Menu',
    prompt_template: 'Create a bar menu for {{eventName}}. Cocktail list, beer/wine selection, pricing optional. 5x7 inch or table tent format. Sophisticated, readable in low light.',
    variables: ['eventName']
  },
  {
    asset_type: 'CATERING_LABEL',
    template_name: 'Food Station Label',
    prompt_template: 'Design catering labels for {{eventName}}. Dish name, ingredients, dietary icons (V, VG, GF, etc.). Tent card or stake format. Clear, appetizing design.',
    variables: ['eventName']
  },
  {
    asset_type: 'DIETARY_CARD',
    template_name: 'Dietary Information Card',
    prompt_template: 'Create dietary information cards for {{eventName}}. Allergen warnings, ingredient lists, dietary accommodation icons. Clear, safety-focused design.',
    variables: ['eventName']
  },
  
  // PHOTO & ENTERTAINMENT
  {
    asset_type: 'PHOTO_BOOTH_FRAME',
    template_name: 'Photo Booth Frame',
    prompt_template: 'Design a photo booth frame for {{eventName}}. Event branding on border, date, hashtag. Instagram-ready 4x6 or square format. Fun, shareable design.',
    variables: ['eventName']
  },
  {
    asset_type: 'PHOTO_BOOTH_PROPS',
    template_name: 'Photo Booth Props',
    prompt_template: 'Create photo booth prop designs for {{eventName}}. Speech bubbles, mustaches, glasses, themed items. Die-cut ready, stick mounting. Fun, on-theme designs.',
    variables: ['eventName']
  },
  
  // ACCESSIBILITY & SAFETY
  {
    asset_type: 'ACCESSIBILITY_SIGNAGE',
    template_name: 'ADA Accessibility Signs',
    prompt_template: 'Design ADA-compliant accessibility signage for {{eventName}}. Wheelchair access, hearing loop, accessible restrooms. Proper pictograms, braille considerations. Event branding integration.',
    variables: ['eventName']
  },
  {
    asset_type: 'EMERGENCY_GUIDE',
    template_name: 'Emergency Information Card',
    prompt_template: 'Create emergency information cards for {{eventName}}. Emergency exits, first aid, security contact, venue address. Pocket-sized, essential safety information.',
    variables: ['eventName']
  },
  
  // STAFF & CREW
  {
    asset_type: 'VOLUNTEER_VEST',
    template_name: 'Volunteer Vest Design',
    prompt_template: 'Design volunteer vest graphics for {{eventName}}. Front and back identification. "VOLUNTEER" or "STAFF" text, event branding. High visibility, approachable design.',
    variables: ['eventName']
  },
  {
    asset_type: 'SECURITY_BADGE',
    template_name: 'Security Staff Badge',
    prompt_template: 'Create security badge design for {{eventName}}. Clear "SECURITY" identification, photo area, event branding. Official appearance, hard to duplicate.',
    variables: ['eventName']
  },
  {
    asset_type: 'MEDIA_CREDENTIAL',
    template_name: 'Press/Media Badge',
    prompt_template: 'Design a media credential for {{eventName}}. "PRESS" or "MEDIA" designation, outlet name area, photo. Lanyard-ready, professional appearance.',
    variables: ['eventName']
  },
  
  // SESSIONS & ENGAGEMENT
  {
    asset_type: 'BREAKOUT_SESSION_SIGN',
    template_name: 'Breakout Room Sign',
    prompt_template: 'Create breakout session signage for {{eventName}}. Session title, speaker name, time, room number. 8.5x11 or 11x17 inch. Easy to update/swap.',
    variables: ['eventName']
  },
  {
    asset_type: 'SPEAKER_INTRO_CARD',
    template_name: 'Speaker Introduction Card',
    prompt_template: 'Design a speaker introduction card for {{eventName}}. Speaker photo area, bio, session title, social handles. MC/host reference card format.',
    variables: ['eventName']
  },
  {
    asset_type: 'SESSION_EVALUATION',
    template_name: 'Session Feedback Form',
    prompt_template: 'Create a session evaluation form for {{eventName}}. Rating scales, open comments, QR code for digital. 5.5x8.5 inch format. Event branding.',
    variables: ['eventName']
  },
  {
    asset_type: 'NETWORKING_BINGO',
    template_name: 'Networking Bingo Card',
    prompt_template: 'Design a networking bingo card for {{eventName}}. Ice-breaker prompts, attendee interaction challenges. Fun, engaging, encourages mingling. Event branding.',
    variables: ['eventName']
  },
  {
    asset_type: 'SCAVENGER_HUNT_CARD',
    template_name: 'Scavenger Hunt Card',
    prompt_template: 'Create a scavenger hunt card for {{eventName}}. Location clues, sponsor booth visits, photo challenges. Gamified engagement. Prize info area.',
    variables: ['eventName']
  },
  {
    asset_type: 'POLL_CARD',
    template_name: 'Audience Poll Card',
    prompt_template: 'Design audience poll cards for {{eventName}}. Multiple choice options, QR code for digital response. Session engagement tool. Reusable format.',
    variables: ['eventName']
  },
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action } = await req.json();

    if (action === 'seed') {
      // Get existing templates to avoid duplicates
      const { data: existing } = await supabase
        .from('prompt_templates')
        .select('asset_type, template_name');
      
      const existingKeys = new Set(
        (existing || []).map(e => `${e.asset_type}:${e.template_name}`)
      );

      // Filter out already existing templates
      const newTemplates = DEFAULT_PROMPTS.filter(
        t => !existingKeys.has(`${t.asset_type}:${t.template_name}`)
      );

      if (newTemplates.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'All templates already exist',
            inserted: 0,
            total: DEFAULT_PROMPTS.length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert new templates
      const toInsert = newTemplates.map(t => ({
        asset_type: t.asset_type,
        template_name: t.template_name,
        prompt_template: t.prompt_template,
        variables: t.variables,
        is_system: true,
        created_by: user.id,
        usage_count: 0,
        success_rate: 0.5
      }));

      const { error: insertError } = await supabase
        .from('prompt_templates')
        .insert(toInsert);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Seeded ${newTemplates.length} new templates`,
          inserted: newTemplates.length,
          skipped: DEFAULT_PROMPTS.length - newTemplates.length,
          total: DEFAULT_PROMPTS.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'list') {
      return new Response(
        JSON.stringify({ 
          templates: DEFAULT_PROMPTS,
          count: DEFAULT_PROMPTS.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Seed templates error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to seed templates' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
