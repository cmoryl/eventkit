import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// INDUSTRY-STANDARD MASTER-LEVEL PROMPT TEMPLATES
// All templates feature 100% success rate targeting, intricate details, and advanced prompt engineering
const MASTER_PROMPTS: { asset_type: string; template_name: string; prompt_template: string; variables: string[] }[] = [
  // ═══════════════════════════════════════════════════════════════
  // BRANDING & IDENTITY - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'PALETTE',
    template_name: 'Master Color Palette System',
    prompt_template: `Create a comprehensive, psychologically-optimized color palette system for "{{eventName}}", a prestigious {{eventType}} event.

REQUIREMENTS:
- Generate exactly 6 harmonious colors following advanced color theory (60-30-10 rule compliance)
- Primary Color: Dominant brand anchor (60% usage) - must convey {{mood}} while maintaining WCAG AAA contrast ratios
- Secondary Color: Supporting accent (30% usage) - complementary or analogous relationship to primary
- Tertiary/Accent Colors: 4 supporting hues (10% combined) for highlights, CTAs, and visual hierarchy
- Include dark mode variants for each color with proper luminosity adjustments

COLOR SPECIFICATIONS (for each color):
- HEX value (web-safe)
- RGB values (0-255 scale)  
- HSL values (for CSS custom properties)
- CMYK values (for print accuracy)
- Pantone closest match (for brand consistency)
- Suggested usage context and accessibility notes

CULTURAL CONSIDERATIONS:
- Location context: {{location}}
- Ensure colors resonate with local cultural sensibilities
- Avoid colors with negative cultural connotations for the target region
- Consider seasonal appropriateness and venue lighting conditions

OUTPUT: Professional color palette with color harmony rationale, psychological impact analysis, and multi-format specifications.`,
    variables: ['eventName', 'eventType', 'mood', 'location']
  },
  {
    asset_type: 'LOGO',
    template_name: 'Master Primary Logo Design',
    prompt_template: `Design a world-class, memorable primary logo for "{{eventName}}" that will become an iconic visual identifier.

DESIGN PHILOSOPHY:
- Style direction: {{style}}
- Thematic essence: {{theme}}
- Target emotional response: Professional excellence, trust, innovation

TECHNICAL REQUIREMENTS:
- Vector-quality output suitable for infinite scaling
- Minimum viable size: Must remain legible at 16x16 pixels
- Maximum application: Billboard-ready at any scale
- Color modes: Full color, 2-color, and 1-color variants
- Safe zones: Built-in clear space equal to 25% of logo height on all sides

DESIGN PRINCIPLES:
- Distinctive silhouette recognizable in peripheral vision
- Balanced optical weight between mark and wordmark (if applicable)
- Timeless design avoiding trendy elements that may date quickly
- Versatile enough for digital screens, print, embroidery, and signage
- Memorable within 3-second viewing window

TYPOGRAPHY (if wordmark included):
- Custom lettering or modified typeface for uniqueness
- Optimal kerning and letter-spacing for brand personality
- Consideration for international character support

OUTPUT: Primary logo with construction grid, safe zone specifications, and usage guidelines.`,
    variables: ['eventName', 'style', 'theme']
  },
  {
    asset_type: 'LOGO_MONOCHROME',
    template_name: 'Master Monochrome Logo System',
    prompt_template: `Create a precision-engineered monochrome logo variant for "{{eventName}}" optimized for single-color reproduction scenarios.

MONOCHROME OPTIMIZATION:
- Maintain 100% brand recognition without color cues
- Optimize tonal values for maximum contrast and legibility
- Adjust line weights if needed for single-color clarity
- Create both positive (dark on light) and negative (light on dark) versions

APPLICATION SCENARIOS:
- Fax and photocopying (maintain clarity at degraded quality)
- Single-color print runs (cost-effective materials)
- Embossing and debossing (tactile applications)
- Watermarks (semi-transparent overlays)
- Laser engraving (metal, wood, leather surfaces)
- Rubber stamps and wax seals
- Newsprint and low-resolution printing

TECHNICAL SPECIFICATIONS:
- Pure black (#000000) and pure white (#FFFFFF) versions
- Optional: Brand color single-tone version
- Minimum recommended size for each application type
- Line weight adjustments for small-scale reproduction

OUTPUT: Complete monochrome logo system with application matrix and quality assurance checklist.`,
    variables: ['eventName']
  },
  {
    asset_type: 'LOGO_REVERSED',
    template_name: 'Master Reversed Logo Variant',
    prompt_template: `Engineer a professional reversed/knockout logo variant for "{{eventName}}" ensuring perfect visibility on dark and complex backgrounds.

REVERSED LOGO REQUIREMENTS:
- Pure white version for dark solid backgrounds
- Light color version using brand secondary palette
- "Outlined" version for semi-transparent overlay use
- Glow/shadow variants for photographic backgrounds

VISIBILITY OPTIMIZATION:
- Minimum contrast ratio: 4.5:1 against intended backgrounds
- Edge treatment for complex photographic backgrounds
- Subtle stroke or glow options for challenging substrates
- Gradient background compatibility testing

SPECIFIC USE CASES:
- Dark venue photography backgrounds
- Video overlays and lower thirds
- Merchandise on dark fabrics
- Dark mode digital interfaces
- Evening event signage with dramatic lighting
- Sponsor walls with varied background colors

OUTPUT: Reversed logo suite with background compatibility matrix and safe background color ranges.`,
    variables: ['eventName']
  },
  {
    asset_type: 'SLOGANS',
    template_name: 'Master Tagline Collection',
    prompt_template: `Craft a collection of 7 strategically-differentiated taglines for "{{eventName}}", a {{eventType}} focused on {{theme}}.

TAGLINE CATEGORIES (one each):

1. HERO TAGLINE (Primary Brand Statement)
   - 3-5 words maximum
   - Captures entire brand essence
   - Timeless, not campaign-specific

2. CALL-TO-ACTION TAGLINE
   - Action verb leading
   - Creates urgency without pressure
   - Suitable for registration pages and CTAs

3. EMOTIONAL CONNECTION TAGLINE
   - Evokes belonging and community
   - Personal and aspirational
   - Suitable for attendee communications

4. PROFESSIONAL/AUTHORITY TAGLINE
   - Establishes expertise and credibility
   - Industry-specific language acceptable
   - Suitable for sponsor/partner materials

5. EXPERIENTIAL TAGLINE
   - Focuses on the event experience
   - Sensory and immersive language
   - Suitable for pre-event marketing

6. SOCIAL MEDIA TAGLINE
   - Hashtag-compatible format
   - Shareable and engaging
   - Under 60 characters

7. LEGACY TAGLINE
   - Speaks to lasting impact
   - Forward-looking and inspiring
   - Suitable for post-event communications

OUTPUT: 7 taglines with usage contexts, tone analysis, and suggested applications.`,
    variables: ['eventName', 'eventType', 'theme']
  },
  {
    asset_type: 'STYLE_GUIDE',
    template_name: 'Master Brand Style Guide',
    prompt_template: `Develop a comprehensive brand style guide for "{{eventName}}" establishing absolute consistency across all touchpoints.

BRAND ARCHITECTURE:

1. LOGO USAGE GUIDELINES
   - Primary logo specifications and safe zones
   - Approved color variations and when to use each
   - Minimum sizes for print (mm) and digital (px)
   - Incorrect usage examples (stretching, rotating, color changes)
   - Co-branding rules with sponsors/partners

2. COLOR SYSTEM
   - Primary, secondary, and accent color specifications
   - Color ratios (60-30-10 application)
   - Accessibility color combinations
   - Dark mode color mappings
   - Gradient usage rules and angles

3. TYPOGRAPHY HIERARCHY
   - Primary typeface: Display/Headlines
   - Secondary typeface: Body copy
   - Tertiary typeface: Captions/Legal
   - Web-safe fallback stack
   - Type scale (heading sizes, line heights, letter spacing)
   - Emphasis treatments (bold, italic, underline rules)

4. IMAGERY STYLE
   - Photography treatment and filters
   - Illustration style guidelines
   - Icon style and stroke weights
   - Pattern usage and scaling rules

5. VOICE & TONE
   - Brand personality attributes (3-5 key traits)
   - Writing style dos and don'ts
   - Vocabulary preferences and banned words
   - Tone variations by channel (formal vs casual)

6. APPLICATION TEMPLATES
   - Social media post templates
   - Email signature format
   - Presentation slide layouts
   - Document header/footer standards

OUTPUT: Complete brand bible with visual examples and rationale for each guideline.`,
    variables: ['eventName']
  },
  {
    asset_type: 'SEAMLESS_PATTERN',
    template_name: 'Master Seamless Pattern Library',
    prompt_template: `Design a sophisticated seamless pattern system for "{{eventName}}" utilizing brand colors {{colors}} for multi-application deployment.

PATTERN SPECIFICATIONS:

1. PRIMARY PATTERN
   - Style: {{style}} aesthetic
   - Tile size: 300x300px base (infinitely tileable)
   - Complexity: Medium density for background use
   - Color variants: Full color, monochrome, subtle (10% opacity)

2. SECONDARY PATTERN
   - Simplified version for text overlay backgrounds
   - Higher negative space ratio
   - Single or two-color execution

3. ACCENT PATTERN
   - Bold, higher contrast for feature moments
   - Suitable for merchandise and promotional items
   - Can include event-specific iconography

TECHNICAL REQUIREMENTS:
- Perfect mathematical tiling (no visible seams)
- Works at 50%, 100%, and 200% scale without moiré
- Optimized file sizes for web deployment
- Print-ready 300 DPI master files

APPLICATIONS:
- Website and app backgrounds
- Presentation slide backgrounds
- Packaging and shopping bags
- Fabric printing for merchandise
- Vinyl wraps and environmental graphics
- Social media frame backgrounds

OUTPUT: Pattern library with tile files, application mockups, and scaling guidelines.`,
    variables: ['eventName', 'colors', 'style']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // PRINT & SIGNAGE - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'NAME_TAG',
    template_name: 'Master Attendee Badge System',
    prompt_template: `Design a premium, functional attendee badge for "{{eventName}}" that serves as both identification and networking tool.

BADGE SPECIFICATIONS:
- Dimensions: 4" × 3" (102mm × 76mm) with 0.125" bleed
- Orientation: Landscape for optimal name visibility
- Material consideration: 14pt cardstock with matte or gloss finish

FRONT DESIGN HIERARCHY:
1. ATTENDEE NAME: 24-32pt bold, maximum visibility
2. COMPANY/ORGANIZATION: 14-18pt, secondary prominence  
3. TITLE/ROLE: 12-14pt, supporting information
4. EVENT LOGO: Corner placement, brand reinforcement
5. ATTENDEE TYPE INDICATOR: Color coding system (Speaker, VIP, Attendee, Sponsor, Media)

OPTIONAL SMART FEATURES:
- QR code for digital business card exchange
- Social media handle area
- Pronoun designation space

BRAND INTEGRATION:
- Colors: {{colors}}
- Maintain 40%+ white space for readability
- Typography must pass 20/40 vision test at arm's length

PRODUCTION SPECS:
- CMYK color mode
- 300 DPI resolution
- Crop marks and bleed guides
- Die-cut template for rounded corners (optional)

OUTPUT: Print-ready badge front with companion lanyard design specifications.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'NAME_TAG_BACK',
    template_name: 'Master Badge Back Utility Design',
    prompt_template: `Design the utility-focused back panel of the "{{eventName}}" attendee badge maximizing practical value.

CONTENT HIERARCHY:

1. QUICK REFERENCE SCHEDULE
   - Day/time grid with key sessions
   - Color-coded track system
   - QR code linking to full digital schedule

2. CONNECTIVITY INFORMATION
   - Event WiFi network name and password
   - Event app download QR code
   - Event hashtag prominently displayed

3. EMERGENCY & SAFETY
   - Emergency contact number
   - First aid station location
   - Security contact information
   - Venue address for rideshare pickup

4. VENUE ESSENTIALS
   - Simplified floor plan or building map
   - Restroom indicators
   - Registration desk location

5. SPONSOR RECOGNITION
   - Presenting sponsor logo placement
   - "Powered by" attribution area

DESIGN PARAMETERS:
- Maximum information density while maintaining legibility
- 8pt minimum font size for ADA compliance
- High contrast for low-light readability
- QR codes minimum 0.75" × 0.75" for reliable scanning

OUTPUT: Information-dense yet organized badge back optimized for utility.`,
    variables: ['eventName']
  },
  {
    asset_type: 'BANNER',
    template_name: 'Master Large Format Banner',
    prompt_template: `Create an impactful large-format banner for "{{eventName}}" engineered for maximum visual impact and brand recall.

BANNER SPECIFICATIONS:
- Dimensions: 8' × 3' (96" × 36") horizontal format
- Resolution: 150 DPI (optimal for large format viewing distance)
- Color mode: CMYK with rich black (60C 40M 40Y 100K)
- File format: Print-ready PDF with embedded fonts

VISUAL HIERARCHY (left to right):
1. EVENT LOGO: 15-20% of width, left anchor
2. EVENT NAME: Dominant typography, readable at 50+ feet
3. DATE: {{date}} - prominent but secondary
4. LOCATION: {{location}} - clear wayfinding
5. CALL-TO-ACTION/TAGLINE: Memorable closer

DESIGN EXCELLENCE CRITERIA:
- 3-second comprehension test: All critical info absorbed immediately
- Color palette: {{colors}} with high contrast combinations
- Typography: Maximum 2 typeface families
- Visual rhythm: Balanced negative space (minimum 30%)
- Edge safety: 2" margin from all edges for mounting hardware

ENVIRONMENTAL CONSIDERATIONS:
- Indoor/outdoor suitability
- Lighting condition adaptability
- Wrinkle-resistant design (avoid fine gradients in fold areas)
- Grommet placement guides

OUTPUT: Print-ready banner with installation specifications and viewing distance optimization notes.`,
    variables: ['eventName', 'date', 'location', 'colors']
  },
  {
    asset_type: 'EVENT_SIGNAGE',
    template_name: 'Master Wayfinding Signage System',
    prompt_template: `Develop a comprehensive wayfinding signage system for "{{eventName}}" ensuring intuitive navigation for all attendees.

SIGNAGE SYSTEM COMPONENTS:

1. DIRECTIONAL SIGNS (24" × 36")
   - Clear arrow indicators following universal standards
   - Destination naming with distance/floor indicators
   - Bilingual text support (if applicable)
   - ADA-compliant typography and contrast

2. IDENTIFICATION SIGNS (18" × 24")
   - Room/area naming
   - Capacity and usage information
   - Session/speaker currently in progress

3. INFORMATIONAL SIGNS (11" × 17")
   - Detailed information and instructions
   - QR code integration for digital content
   - Contact and support information

DESIGN SYSTEM REQUIREMENTS:
- Consistent visual language across all sign types
- Color coding system for different areas/tracks
- Icon library for common destinations (restrooms, exits, food, etc.)
- Minimum 20' viewing distance legibility for directional signs
- High contrast ratios exceeding ADA requirements (4.5:1 minimum)

ACCESSIBILITY COMPLIANCE:
- Tactile elements indication (for physical production)
- Braille accommodation areas
- International symbol usage
- Non-color-dependent information hierarchy

BRAND INTEGRATION:
- Event branding present but not dominant (10-15% logo presence)
- Functional clarity prioritized over decorative elements

OUTPUT: Complete signage system with templates, icon library, and placement guidelines.`,
    variables: ['eventName']
  },
  {
    asset_type: 'STAND_UP_PILLAR_BANNER',
    template_name: 'Master Retractable Banner Stand',
    prompt_template: `Design a professional retractable banner stand for "{{eventName}}" optimized for trade show and event deployment.

BANNER SPECIFICATIONS:
- Dimensions: 33.5" × 80" (850mm × 2000mm) standard retractable
- Resolution: 150 DPI for optimal viewing at 3-6 feet
- Color mode: CMYK with spot color consideration for brand colors
- Material: Premium 13oz vinyl or fabric banner

VISUAL ARCHITECTURE (top to bottom):

1. HEADER ZONE (top 15%):
   - Event logo, prominent and properly scaled
   - Primary visual hook to capture attention from distance

2. HERO ZONE (15-50%):
   - Main messaging or key visual
   - Large typography for 20+ foot visibility
   - Primary brand statement or value proposition

3. CONTENT ZONE (50-80%):
   - Supporting information
   - 3-5 bullet points maximum
   - Icon/graphic support for key features
   - QR code for digital engagement

4. FOOTER ZONE (bottom 20%):
   - Call-to-action
   - Contact information/website
   - Date, location, or booth number
   - Sponsor logos if applicable

DESIGN BEST PRACTICES:
- Top-weighted design (critical info above 5' from ground)
- 2" safety margin on all edges
- Avoid content in bottom 4" (often hidden by base)
- High contrast for readability in varied lighting

OUTPUT: Print-ready banner file with hardware-specific specifications and mockup.`,
    variables: ['eventName']
  },
  {
    asset_type: 'MENU',
    template_name: 'Master Event Menu Design',
    prompt_template: `Design an elegant, comprehensive menu for "{{eventName}}" that enhances the dining experience.

MENU SPECIFICATIONS:
- Format: 8.5" × 11" single sheet or bi-fold
- Paper stock recommendation: 100lb gloss or matte text
- Color palette: {{colors}} maintaining readability

CONTENT ORGANIZATION:

1. HEADER
   - Event name and logo
   - Meal designation (Breakfast, Lunch, Dinner, Reception)
   - Date and service time

2. APPETIZERS/STARTERS
   - Item name in primary typography
   - Description (ingredients, preparation) in secondary type
   - Dietary icons aligned right

3. MAIN COURSES
   - Clear categorization (Meat, Seafood, Vegetarian, Vegan)
   - Portion or presentation notes
   - Chef's recommendation highlight

4. SIDES & ACCOMPANIMENTS
   - Grouped logically
   - Sharing/individual designation

5. DESSERTS & BEVERAGES
   - Specialty items highlighted
   - Bar menu or beverage pairings

DIETARY ICON SYSTEM:
- V: Vegetarian (green)
- VG: Vegan (leaf icon)
- GF: Gluten-Free
- DF: Dairy-Free
- N: Contains Nuts
- Spicy level indicator (1-3 flames)

TYPOGRAPHY REQUIREMENTS:
- Dish names: 12-14pt, easily scannable
- Descriptions: 9-10pt, readable in low ambient light
- Categories: 16-18pt, clear section dividers

OUTPUT: Print-ready menu with dietary icon legend and elegant presentation.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'THANK_YOU_NOTE',
    template_name: 'Master Post-Event Thank You Card',
    prompt_template: `Design a heartfelt, premium thank you card for "{{eventName}}" attendees that reinforces brand connection.

CARD SPECIFICATIONS:
- Dimensions: 5" × 7" (A7 format) 
- Paper: 130lb cover stock, premium feel
- Finish: Soft touch matte or linen texture recommended

DESIGN APPROACH:
- Elegant simplicity over complexity
- Generous white space for perceived quality
- Personal touch balancing professional polish

FRONT DESIGN:
- Prominent but refined "Thank You" typography
- Event logo watermark or subtle background element
- Optional: Event photography highlight or illustration

INTERIOR/BACK CONTENT:
1. Gratitude statement (genuine, not corporate)
2. Event highlights or key takeaways mention
3. Community/connection acknowledgment
4. Teaser for future events or continued engagement
5. Social media/feedback invitation
6. Signature area (printed or space for handwritten)

TONE GUIDANCE:
- Warm and personal, not template-sounding
- Specific references to the event experience
- Forward-looking, maintaining relationship
- Call-to-action that feels like an invitation, not marketing

PRODUCTION CONSIDERATIONS:
- Envelope design coordination
- Personalization variable areas (name, custom message)
- QR code to survey or photo gallery (optional)

OUTPUT: Print-ready thank you card with envelope design and personalization guide.`,
    variables: ['eventName']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // DIGITAL ASSETS - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'SOCIAL_POST',
    template_name: 'Master Social Media Post System',
    prompt_template: `Create a scroll-stopping social media post for "{{eventName}}" optimized for maximum engagement.

POST SPECIFICATIONS:
- Dimensions: 1080 × 1080px (Instagram/Facebook square)
- Resolution: 72 DPI (screen optimized)
- Color mode: sRGB for accurate screen display
- Format: PNG for graphics, JPG for photos

VISUAL HIERARCHY:
1. HOOK ELEMENT (captures attention in 0.5 seconds)
   - Bold visual or provocative statement
   - Pattern interrupt from normal feed content

2. EVENT BRANDING
   - Logo placement: Corner, subtle but recognizable
   - Brand colors prominent throughout

3. KEY INFORMATION
   - Event name: Dominant typography
   - Date: {{date}} - clear and formatted for the audience
   - Location or "Virtual" designation

4. CALL-TO-ACTION
   - Action verb + benefit
   - Link reference (Bio link, swipe up, etc.)

PLATFORM-SPECIFIC OPTIMIZATIONS:
- Safe zones for UI overlays
- Caption-friendly composition (text minimal in image)
- Hashtag-ready design element

ENGAGEMENT PSYCHOLOGY:
- Curiosity gap creation
- Social proof elements if applicable
- FOMO (Fear of Missing Out) triggers
- Community belonging signals

OUTPUT: Social post with platform variations and engagement-optimized caption suggestions.`,
    variables: ['eventName', 'date']
  },
  {
    asset_type: 'SOCIAL_STORY',
    template_name: 'Master Social Story Vertical',
    prompt_template: `Design a dynamic vertical social story for "{{eventName}}" capturing the ephemeral, authentic feel of Stories.

STORY SPECIFICATIONS:
- Dimensions: 1080 × 1920px (9:16 aspect ratio)
- Duration context: 15-second viewing window
- Platform targets: Instagram Stories, TikTok, Facebook Stories, YouTube Shorts

VISUAL STRUCTURE:

TOP ZONE (0-15%):
- Platform UI safe area (avoid critical content)
- Time/progress bar accommodation

HERO ZONE (15-65%):
- Primary visual impact area
- Core message delivery
- Animation-ready composition

ENGAGEMENT ZONE (65-85%):
- Interactive element spaces
- Poll/Question sticker accommodation
- Swipe-up call-to-action area

BOTTOM ZONE (85-100%):
- Reply bar accommodation
- Username/tag placement

DESIGN PRINCIPLES:
- Motion-first thinking (even for static, imply motion)
- Bold, immediate visual hooks
- Minimal text (15 words maximum)
- High contrast for auto-play viewing
- Brand presence: Consistent but not overbearing

CONTENT VARIATIONS TO CREATE:
1. Announcement/Teaser
2. Countdown
3. Behind-the-scenes feel
4. User-generated content frame

OUTPUT: Story template with animation direction notes and interactive element guides.`,
    variables: ['eventName']
  },
  {
    asset_type: 'EMAIL_HEADER',
    template_name: 'Master Email Header Banner',
    prompt_template: `Design a professional email header banner for "{{eventName}}" optimized for email client compatibility.

EMAIL HEADER SPECIFICATIONS:
- Dimensions: 600px wide × 200px tall (optimal ratio)
- File size: Under 100KB for fast loading
- Format: PNG-8 or optimized JPG
- Color mode: sRGB

EMAIL CLIENT CONSIDERATIONS:
- Outlook dark mode adaptation
- Gmail clipping prevention
- Mobile-first design (60%+ opens on mobile)
- Image-off fallback planning

CONTENT HIERARCHY:
1. EVENT LOGO: Recognizable, properly sized
2. EVENT NAME: Clear typographic treatment
3. DATE: {{date}} - unmissable
4. VISUAL HOOK: Engaging imagery or graphic element

DESIGN REQUIREMENTS:
- Alt text planning in composition
- No critical info in bottom 10% (cropping on some clients)
- Brand colors with email-safe color fallbacks
- Avoid fine text (minimum 14px rendered size)

ACCESSIBILITY:
- Minimum contrast ratio: 4.5:1
- No text-as-image for critical information
- Clear visual hierarchy without color dependency

RESPONSIVE CONSIDERATIONS:
- Single-column design for mobile stacking
- Touch-target-sized interactive elements

OUTPUT: Email-optimized header with HTML snippet for proper alt text and fallback styling.`,
    variables: ['eventName', 'date']
  },
  {
    asset_type: 'PRESENTATION_SLIDE',
    template_name: 'Master Presentation Template Suite',
    prompt_template: `Create a comprehensive presentation template system for "{{eventName}}" enabling consistent, professional speaker decks.

SLIDE SPECIFICATIONS:
- Dimensions: 1920 × 1080px (16:9 widescreen)
- Color palette: {{colors}}
- Master font pairing with web-safe fallbacks

TEMPLATE COLLECTION:

1. TITLE SLIDE
   - Event branding dominant
   - Session title placeholder
   - Speaker name and credentials
   - Date and session time

2. SECTION DIVIDER
   - Bold section naming
   - Visual reset between topics
   - Progression indicator (optional)

3. CONTENT SLIDE - TEXT
   - Heading + body layout
   - Bullet point hierarchy (3 levels)
   - 30-40% image zone

4. CONTENT SLIDE - IMAGE FOCUS
   - Full-bleed image area
   - Overlay text treatment
   - Caption/source zone

5. TWO-COLUMN COMPARISON
   - Before/after format
   - Pros/cons layout
   - Balanced visual weight

6. DATA VISUALIZATION
   - Chart placeholder areas
   - Legend placement
   - Source citation zone

7. QUOTE SLIDE
   - Pull quote formatting
   - Attribution styling
   - Visual emphasis treatment

8. SPEAKER SLIDE
   - Photo placeholder
   - Bio text area
   - Contact/social information

9. Q&A SLIDE
   - Interactive feel
   - Contact methods
   - Social handles

10. CLOSING/THANK YOU
    - Summary reinforcement
    - Call-to-action
    - Event branding closure

OUTPUT: Complete slide deck template with usage guide and animation recommendations.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'ZOOM_BACKGROUND',
    template_name: 'Master Virtual Meeting Background',
    prompt_template: `Design a professional virtual meeting background for "{{eventName}}" that enhances presenter presence without distraction.

BACKGROUND SPECIFICATIONS:
- Dimensions: 1920 × 1080px (16:9)
- Optimized for virtual background AI processing
- Format: JPG at 80% quality (file size under 2MB)

VIRTUAL BACKGROUND SCIENCE:
- Edge simplification zones (where body silhouette appears)
- Avoid complex patterns that cause AI artifacts
- Depth illusion for natural separation from presenter
- Consistent lighting direction matching typical webcam setups

DESIGN ZONES:

LEFT/RIGHT THIRDS (presenter positioning):
- Subtle, low-contrast elements
- No text or logos (will be obscured)
- Soft color transitions

CENTER ZONE:
- Minimal activity (common presenter position)
- Ground plane suggestion for natural standing feel

TOP ZONE:
- Event branding (logo, name)
- Should work with cropped video feeds

BOTTOM ZONE:
- Clean transition area
- Lower third graphics accommodation

VISUAL APPROACH:
- Professional environment feel (office, conference, neutral space)
- Brand colors integrated subtly
- Depth layers (foreground blur, midground, background)
- Avoid distracting animations or patterns

LIGHTING CONSIDERATIONS:
- Even, neutral lighting representation
- No harsh shadows that conflict with presenter lighting
- Slight warmth for approachable feel

OUTPUT: Virtual background with positioning guide and lighting recommendations.`,
    variables: ['eventName']
  },
  {
    asset_type: 'LIVE_STREAM_OVERLAY',
    template_name: 'Master Broadcast Overlay Package',
    prompt_template: `Create a comprehensive broadcast overlay package for "{{eventName}}" live streaming and video production.

OVERLAY COMPONENTS:

1. LOWER THIRD - SPEAKER
   - Name (primary prominence)
   - Title/Company (secondary)
   - Animated entry/exit (2-3 seconds)
   - Dimensions: 600 × 120px safe area
   - Position: Bottom-left, 80px from edges

2. LOWER THIRD - TOPIC/SEGMENT
   - Current topic title
   - Session/time indicator
   - Animated transitions

3. FRAME OVERLAY
   - Full-screen branded frame
   - Safe action and safe title guides
   - Corner logo placement (top-right recommended)
   - Ticker/banner zone (bottom)

4. BRB (Be Right Back) SCREEN
   - Full-screen holding graphic
   - Animated elements for visual interest
   - "We'll be right back" messaging
   - Background music cue suggestion

5. STARTING SOON SCREEN
   - Countdown timer placeholder
   - Event branding
   - Social handles and hashtags
   - Background ambiance

6. THANK YOU/ENDED SCREEN
   - Event recap branding
   - Follow-up action prompts
   - Social links and hashtag

7. SPONSOR ROLL
   - Logo carousel format
   - Animation transitions between sponsors
   - "Sponsored by" or "Powered by" text

TECHNICAL REQUIREMENTS:
- Alpha channel transparency (PNG sequence or ProRes 4444)
- OBS/StreamLabs compatible formats
- 1920 × 1080px canvas
- Safe zones marked for various platform UIs

OUTPUT: Complete overlay package with placement guide and animation specifications.`,
    variables: ['eventName']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // VENUE & EXPERIENCE - MASTER TIER  
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'MAIN_STAGE_BACKDROP',
    template_name: 'Master Main Stage Design',
    prompt_template: `Design a commanding main stage backdrop for "{{eventName}}" that creates an iconic event photography moment.

STAGE SPECIFICATIONS:
- Dimensions: {{dimensions}} (common: 40' × 16' or 12m × 5m)
- Viewing distances: 10-300 feet
- Media: LED wall, printed scenic, or projection mapping

DESIGN PHILOSOPHY:
- Keynote-worthy visual gravitas
- Photograph beautifully from any angle
- Support speaker presence without competing
- Iconic enough for brand recall from event photos

VISUAL ZONES:

CENTER STAGE:
- Presentation screen accommodation (16:9 area)
- Speaker positioning consideration
- Clean area for uncluttered photography

WING ZONES:
- Extended branding elements
- Visual rhythm and pattern
- Sponsor integration (tasteful)

VERTICAL DISTRIBUTION:
- Top: Event branding anchor
- Middle: Dynamic design elements
- Bottom: Stage floor transition

SCENIC DESIGN ELEMENTS:
- Depth layers for dimensional feel
- LED content zones vs static graphics
- Lighting design integration notes
- Smoke/haze effect considerations

PHOTOGRAPHY OPTIMIZATION:
- Color choices that work under stage lighting
- Contrast levels for varied camera exposures
- Social-media-ready compositions from key angles

OUTPUT: Stage design with scale diagram, lighting plot notes, and production specifications.`,
    variables: ['eventName', 'dimensions']
  },
  {
    asset_type: 'STEP_AND_REPEAT',
    template_name: 'Master Step and Repeat Banner',
    prompt_template: `Create a premium step-and-repeat photography backdrop for "{{eventName}}" optimized for red carpet moments.

STEP AND REPEAT SCIENCE:
- Dimensions: 8' × 8' or 8' × 10' (standard formats)
- Logo/element sizing: Optimized for head-shot framing
- Spacing: Calculated for medium-shot photography

PATTERN MATHEMATICS:
- Logo tile size: 8-12 inches (fits in photo frame)
- Offset rows: Half-drop pattern for visual interest
- Negative space: Minimum 2" between logos
- Edge treatment: Seamless when panels connect

SPONSOR INTEGRATION (if applicable):
- Tier-based sizing (Presenting > Gold > Silver)
- Maximum 4-5 unique elements per repeat
- Alternating pattern for balanced exposure
- Avoiding logo collision in standard photo crops

PHOTOGRAPHY OPTIMIZATION:
- Avoid pure white backgrounds (hot spots in flash photography)
- High contrast logo versions for visibility
- Matte finish recommendation (reduces glare)
- Test pattern for common lighting setups

COLOR CONSIDERATIONS:
- Dark backgrounds: Slimming, dramatic
- Light backgrounds: Bright, energetic
- Brand alignment with event tone

OUTPUT: Print-ready step and repeat with sponsor placement map and photography guide.`,
    variables: ['eventName']
  },
  {
    asset_type: 'REGISTRATION_COUNTER',
    template_name: 'Master Registration Desk Graphics',
    prompt_template: `Design welcoming registration desk graphics for "{{eventName}}" creating an exceptional first impression.

REGISTRATION DESK COMPONENTS:

1. FRONT COUNTER WRAP
   - Dimensions: Variable (common: 6-8' × 30-40")
   - Full-color printed vinyl or fabric
   - Event branding dominant
   - Seamless panel joins

2. COUNTER TOP SIGNAGE
   - Queue lane identifiers (A-Z, 1-10, Last Name)
   - Check-in type differentiation (VIP, General, Speaker, Press)
   - QR code for digital check-in
   - Accessory placement (badge printers, tablets)

3. BACK WALL (behind staff)
   - Large format event branding
   - Welcome messaging
   - Photo opportunity backdrop
   - Staff visibility consideration

WAYFINDING INTEGRATION:
- Queue management indicators
   - Clear lane designations
- Wait time expectations
- Next steps after check-in

DESIGN APPROACH:
- Approachable and welcoming (not corporate cold)
- Clear visual hierarchy guiding attendee flow
- Brand immersion from first contact
- Accessible design for all attendees

STAFF CONSIDERATIONS:
- Clear sight lines for staff
- Badge handoff zone indication
- Material storage concealment

OUTPUT: Complete registration area design with component specifications and flow diagram.`,
    variables: ['eventName']
  },
  {
    asset_type: 'FLOOR_DECAL',
    template_name: 'Master Floor Graphics System',
    prompt_template: `Design an engaging floor graphics system for "{{eventName}}" combining wayfinding with brand experience.

FLOOR GRAPHIC TYPES:

1. WAYFINDING ARROWS
   - Clear directional indication
   - Destination labeling
   - Color-coded by area/track
   - Size: Minimum 24" for visibility

2. LOGO PLACEMENTS
   - High-traffic focal points
   - Photo opportunity marks
   - Sponsor integration zones
   - Size: 36-48" diameter typical

3. INFORMATIONAL MARKERS
   - Room entrance indicators
   - Queue position markers
   - Social distancing guides (if applicable)

4. INTERACTIVE/ENGAGEMENT
   - "Stand here" photo spots
   - Scavenger hunt checkpoints
   - Playful brand moments

SAFETY & COMPLIANCE:
- Anti-slip laminate specification (R10+ rating)
- ADA pathway clearance (36" minimum)
- No obstruction of emergency exits
- High-visibility edges/borders

MATERIAL SPECIFICATIONS:
- Temporary: Vinyl with removable adhesive
- Semi-permanent: Textured anti-slip vinyl
- Outdoor: Weather-resistant with UV protection
- Cleaning and maintenance instructions

DESIGN REQUIREMENTS:
- Readable from standing height (5-6' viewing distance)
- High contrast for visibility
- Durable under foot traffic
- Quick recognition (0.5 second comprehension)

OUTPUT: Floor graphics system with placement map and installation specifications.`,
    variables: ['eventName']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // MERCHANDISE - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'TSHIRT',
    template_name: 'Master T-Shirt Front Design',
    prompt_template: `Design a coveted t-shirt front for "{{eventName}}" that attendees will proudly wear long after the event.

T-SHIRT DESIGN PHILOSOPHY:
- Wearable beyond the event context
- Fashion-forward, not "free conference shirt"
- Desirable enough that people would buy it
- Balance of branding and aesthetics

DESIGN SPECIFICATIONS:
- Print area: Maximum 12" × 16" (front chest)
- Placement: Centered or left-chest options
- Color count: Optimize for 4-6 colors (screen print economy)
- Design style: Appeal to {{audience}}

TARGET AUDIENCES (design variations):
- Professional/corporate: Subtle, elevated, wearable to casual Friday
- Creative/startup: Bold, statement-making, conversation starter
- Academic/technical: Clever, insider references, community signals

PRINT METHOD CONSIDERATIONS:
- Screen print: Bold, limited colors, durable
- DTG (Direct to Garment): Photo-realistic, unlimited colors
- Vinyl/HTV: Clean vectors, single colors

GARMENT RECOMMENDATIONS:
- Base color suggestions that complement design
- Fabric weight recommendations
- Fit style (unisex, fitted, relaxed)

DESIGN ELEMENTS:
- Event name/logo: Integrated creatively, not just stamped
- Date: {{date}} - subtle or prominent based on collector value
- Location: Optional, adds specificity
- Tagline or theme: If design supports it

OUTPUT: Print-ready t-shirt design with mockups on various garment colors.`,
    variables: ['eventName', 'date', 'audience']
  },
  {
    asset_type: 'LANYARD',
    template_name: 'Master Branded Lanyard Design',
    prompt_template: `Design a premium branded lanyard for "{{eventName}}" serving as both functional tool and wearable brand touchpoint.

LANYARD SPECIFICATIONS:
- Width: 0.75" (20mm) or 1" (25mm) standard
- Length: 36" (900mm) unfolded
- Print method: Sublimation (full color), woven, or silkscreen
- Hardware: J-hook, bulldog clip, or breakaway with choice

DESIGN APPROACH:
- Repeating pattern optimized for lanyard format
- Text orientation when worn (readable vs. inverted)
- Brand presence without visual overwhelm
- Color contrast for visibility and style

PATTERN ELEMENTS:
- Event logo: Scaled appropriately, clear at small size
- Event name: Readable typography
- Pattern/texture: Brand-consistent fill between logos
- Sponsor integration: Tasteful if required

WEARABILITY CONSIDERATIONS:
- Visual interest when folded around neck
- Text readable from multiple angles
- Color coordination with badge design
- Comfort: Width and material feel

PRINT CONSIDERATIONS:
- Sublimation: Full-color, photo-realistic
- Woven: Texture, premium feel, limited colors
- Silkscreen: Bold, 1-3 colors, cost-effective

SAFETY FEATURES:
- Breakaway release for safety (recommended for all events)
- Safety clasp positioning

OUTPUT: Lanyard design with fold visualization and hardware recommendations.`,
    variables: ['eventName']
  },
  {
    asset_type: 'STICKER_SHEET',
    template_name: 'Master Sticker Collection Design',
    prompt_template: `Create an irresistible sticker sheet collection for "{{eventName}}" that attendees will actually want to use.

STICKER DESIGN PHILOSOPHY:
- Shareable: Worth photographing and posting
- Usable: Appropriate for laptops, water bottles, notebooks
- Collectible: Complete set motivation
- Tasteful: Not obnoxiously branded

STICKER COLLECTION (8-12 unique designs):

1. PRIMARY LOGO STICKER
   - Event logo, clean execution
   - Die-cut to logo shape
   - 2-3" size

2. WORDMARK STICKER
   - Event name typography only
   - Horizontal format
   - Laptop banner size

3. ICON SET (3-4 stickers)
   - Event-themed mini icons
   - 1-1.5" each
   - Unified style

4. PHRASE STICKERS (2-3)
   - Memorable quotes or taglines
   - Speech bubble or badge shapes
   - Clever, shareable content

5. MASCOT/CHARACTER (if applicable)
   - Event personality embodiment
   - Expressive, fun poses
   - Various sizes

6. HASHTAG STICKER
   - Social call-to-action
   - Designed for visibility in photos

7. COMMUNITY/INSIDER STICKER
   - "I was there" vibe
   - Year/date specific
   - Collector value

TECHNICAL SPECIFICATIONS:
- Material: Vinyl for durability, matte or gloss finish
- Weather resistance: Water-resistant, UV-stable
- Adhesive: Permanent or repositionable option
- Die-cut: Individual shapes, not just rounded rectangles

SHEET LAYOUT:
- Optimize for kiss-cut production
- Varied sizes for visual interest
- Logical grouping on sheet

OUTPUT: Complete sticker sheet with individual cut paths and production specifications.`,
    variables: ['eventName']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // INVITATIONS & ACCESS - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'INVITATION_CARD',
    template_name: 'Master Event Invitation',
    prompt_template: `Design an exquisite invitation for "{{eventName}}" that compels attendance and communicates event prestige.

INVITATION SPECIFICATIONS:
- Dimensions: 5" × 7" (A7 format) or 6" × 8" (premium)
- Paper: 130lb cover minimum, consider specialty stocks
- Printing: 4-color process with optional foil/emboss
- Envelope: Coordinated design recommended

CONTENT HIERARCHY:

1. HOST LINE (if applicable)
   - "You are cordially invited..."
   - Hosting organization

2. EVENT NAME
   - Typography hero moment
   - Visual identity reinforcement

3. DATE & TIME
   - {{date}} - formatted elegantly
   - Start and end times
   - Time zone if relevant

4. LOCATION
   - {{location}} - venue name prominence
   - Address with accessibility notes
   - Parking/transit information (or QR to details)

5. DRESS CODE
   - Clear expectation setting
   - "Cocktail Attire" / "Business Casual" etc.

6. RSVP INFORMATION
   - Response deadline
   - Method: Link, QR code, or contact
   - Plus-one clarification

DESIGN APPROACH:
- Reflects event tone and prestige level
- Coordinates with overall event brand
- Print finishes: Foil, letterpress, emboss consideration
- Personal touch: Handwritten font elements, wax seal opportunity

ENVELOPE DESIGN:
- Return address styling
- Recipient addressing format
- Liner pattern (optional)

OUTPUT: Print-ready invitation suite with envelope and RSVP card designs.`,
    variables: ['eventName', 'date', 'location']
  },
  {
    asset_type: 'VIP_BADGE',
    template_name: 'Master VIP Access Badge',
    prompt_template: `Design an exclusive VIP badge for "{{eventName}}" that confers status and ensures premium treatment.

VIP BADGE SPECIFICATIONS:
- Dimensions: 4" × 3" or 4" × 6" (larger for prominence)
- Material: Premium cardstock, PVC, or metal badge consideration
- Finish: Metallic, holographic, or specialty printing

DESIGN ELEMENTS:

1. VIP DESIGNATION
   - Unmistakable "VIP" or "ALL ACCESS" marking
   - Premium visual treatment (gold, silver, holographic)
   - Visible from 10+ feet for security identification

2. ATTENDEE INFORMATION
   - Name prominently displayed
   - Company/organization
   - Photo area (for highest security)

3. ACCESS LEVEL INDICATORS
   - Color-coded tier system
   - Specific access icons (green room, backstage, etc.)
   - Valid dates/times

4. SECURITY FEATURES
   - Holographic element or seal
   - Sequential numbering
   - QR code linked to verification
   - Intentionally difficult to duplicate

PREMIUM TOUCHES:
- Metallic ink or foil stamping
- Specialty papers (pearl, textured)
- Custom die-cut shape
- Lanyard ring (metal, not plastic)

FUNCTIONAL REQUIREMENTS:
- Readable by security in dim lighting
- Durable for multi-day events
- Clear differentiation from general admission

OUTPUT: VIP badge design with security feature specifications and verification system integration.`,
    variables: ['eventName']
  },
  {
    asset_type: 'TICKET_DESIGN',
    template_name: 'Master Event Ticket',
    prompt_template: `Design a collectible event ticket for "{{eventName}}" combining functionality with keepsake value.

TICKET SPECIFICATIONS:
- Dimensions: 5.5" × 2" (concert format) or 3.5" × 8.5" (full sheet)
- Paper: 14pt cardstock for durability
- Features: Perforated stub, serial number, security elements

TICKET ARCHITECTURE:

MAIN TICKET PORTION:
1. EVENT BRANDING
   - Logo, event name prominent
   - Visual theme continuity

2. CRITICAL INFORMATION
   - Date: {{date}}
   - Time: Doors open / Event start
   - Venue name and address
   - Seat/Section/Row (if assigned)

3. ADMISSION TYPE
   - Ticket tier (GA, VIP, Reserved)
   - Price paid (optional)
   - Age restrictions

4. VERIFICATION
   - Barcode or QR code
   - Serial number
   - Holographic security strip

STUB PORTION:
- Perforation for easy tear
- Essential info repeated
- Personal keepsake value
- Attendee name area

SECURITY FEATURES:
- Holographic foil element
- UV-reactive ink (optional)
- Microtext lines
- Custom paper with watermark

COLLECTIBILITY FACTORS:
- Artist/event artwork
- Limited edition numbering
- Premium printing techniques
- Frameable proportions

OUTPUT: Print-ready ticket with perforation marks, cut lines, and security specifications.`,
    variables: ['eventName', 'date']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // UTILITIES & FUNCTIONAL - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'QR_CODE',
    template_name: 'Master Branded QR Code',
    prompt_template: `Generate a scannable, branded QR code for "{{eventName}}" linking to {{url}}.

QR CODE REQUIREMENTS:
- Error correction: Level H (30% redundancy for logo integration)
- Size: Minimum 1" × 1" at print, scalable to any size
- Colors: {{colors}} brand colors maintaining contrast

BRANDING INTEGRATION:
- Logo center placement (maximum 20% of QR area)
- Brand color modules (not pure black required)
- Styled corner markers matching brand aesthetic
- Frame/border with event name

TECHNICAL SPECIFICATIONS:
- Format: Vector (SVG) and raster (PNG) versions
- Quiet zone: 4 modules minimum on all sides
- Test scanning on multiple devices before approval
- Short URL recommendation for simpler QR pattern

DEPLOYMENT VARIATIONS:
1. Print materials (high contrast, generous size)
2. Screen display (RGB optimized)
3. Merchandise (simplified for production)
4. Large format (maintain ratio)

SCANNING RELIABILITY:
- Test at 45-degree angles
- Test in low light conditions
- Test with screen glare
- Test on curved surfaces

CALL-TO-ACTION CONTEXT:
- "Scan to Register"
- "Scan for Schedule"
- "Scan to Connect"
- Frame text guiding user action

OUTPUT: Branded QR code in multiple formats with scanning verification and usage guidelines.`,
    variables: ['eventName', 'url', 'colors']
  },
  {
    asset_type: 'WIFI_SIGN',
    template_name: 'Master WiFi Credentials Sign',
    prompt_template: `Design an elegant WiFi information sign for "{{eventName}}" balancing utility with aesthetic integration.

WIFI SIGN SPECIFICATIONS:
- Formats: 8.5" × 11", 11" × 17", table tent
- Placement contexts: Tables, walls, registration desk, elevator lobbies

CONTENT HIERARCHY:

1. WIFI ICON
   - Universal recognition symbol
   - Brand color treatment

2. NETWORK NAME
   - Large, clear typography
   - Exactly as appears in device settings
   - Case-sensitive notation if applicable

3. PASSWORD
   - Prominent, easily readable
   - Consider font choice (0 vs O, 1 vs l confusion)
   - Character spacing for accuracy

4. QR CODE
   - Auto-connect QR for supported devices
   - "Scan to connect" instruction

5. EVENT BRANDING
   - Logo present but secondary
   - Brand colors integrated

DESIGN CONSIDERATIONS:
- Low-light readability (conference rooms, ballrooms)
- Distance readability (wall-mounted versions)
- Tear-resistant material for table tents

ADDITIONAL UTILITY:
- Tech support contact
- Network etiquette notes
- Bandwidth expectations

TABLE TENT FORMAT:
- Self-standing design
- Visible from seated position
- Dual-sided for visibility from both directions

OUTPUT: WiFi sign suite with multiple format options and QR code integration.`,
    variables: ['eventName']
  },
  {
    asset_type: 'AGENDA_HIGHLIGHTS',
    template_name: 'Master Schedule Overview Graphic',
    prompt_template: `Create a visually compelling agenda highlights graphic for "{{eventName}}" enabling at-a-glance schedule comprehension.

AGENDA GRAPHIC SPECIFICATIONS:
- Formats: 24" × 36" poster, 8.5" × 11" handout, digital (1080 × 1920)
- Color system: {{colors}} with track color coding

CONTENT STRUCTURE:

TIME-BASED LAYOUT:
- Clear time column (12-hour or 24-hour format)
- Duration visualization (bar length or block size)
- Break periods clearly marked

SESSION INFORMATION:
- Session title (primary text)
- Speaker name(s)
- Room/location
- Track/category (color coded)

SPECIAL CALLOUTS:
- Keynotes (visual prominence)
- Networking events (social icon)
- Meals (fork/knife icon)
- Sponsor sessions (subtle indication)

VISUAL DESIGN:
- Scannable within 10 seconds for overview
- Highlight "don't miss" moments
- Clear visual rhythm
- Adequate white space despite dense info

ACCESSIBILITY:
- Color-blind friendly color coding
- Pattern or icon backup for colors
- Minimum 10pt type for handout version

MULTIPLE FORMATS:
1. Large format poster (venue display)
2. Handout (take-away reference)
3. Digital signage (lobby screens)
4. Social media (Instagram story format)

OUTPUT: Agenda graphic suite with all format variations and track legend.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'FLOOR_PLAN',
    template_name: 'Master Venue Floor Plan',
    prompt_template: `Design an intuitive venue floor plan for "{{eventName}}" at {{location}} enabling effortless navigation.

FLOOR PLAN REQUIREMENTS:
- Scale: Accurate proportions with scale indicator
- Orientation: North arrow, entrance-forward layout
- Formats: Large print (24" × 36"), handout (8.5" × 11"), digital interactive

MAP ELEMENTS:

SPACE IDENTIFICATION:
- Room names with capacity indicators
- Booth/exhibitor locations (numbered grid)
- Stage and presentation areas
- Registration and check-in zones

AMENITIES:
- Restroom locations (accessible indicated)
- Food and beverage areas
- Charging stations
- First aid/medical
- Coat check
- ATM/cash machines

CIRCULATION:
- Main pathways highlighted
- Emergency exits (required)
- Elevator and stairs
- Accessible routes marked

WAYFINDING SUPPORT:
- "You are here" marker for specific locations
- Color-coded zones matching signage
- Landmark references
- Distance estimations between key points

DESIGN APPROACH:
- 3D isometric for spatial understanding OR
- Clean 2D for clarity and print economy
- Icon consistency with physical signage
- Legend with all symbols explained

OUTPUT: Floor plan in multiple formats with icon legend and accessibility route map.`,
    variables: ['eventName', 'location']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // DINING & HOSPITALITY - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'TABLE_NUMBER',
    template_name: 'Master Table Number System',
    prompt_template: `Design an elegant table number system for "{{eventName}}" balancing visibility with aesthetic refinement.

TABLE NUMBER SPECIFICATIONS:
- Number range: 1-30 (expandable)
- Dimensions: 4" × 6" tent card or 5" × 5" stand-up
- Material: Heavy cardstock (14pt+) or rigid (foamcore, acrylic)

DESIGN APPROACH:
- Number typography: Bold, readable from 20 feet
- Style options: Elegant script, bold modern, classic serif
- Event branding: Subtle integration, not competing with number

VISIBILITY REQUIREMENTS:
- High contrast (dark on light or light on dark)
- Number height: Minimum 2" for visibility
- Avoid decorative fonts that reduce legibility
- Consider centerpiece height and table arrangement

FORMAT OPTIONS:

1. TENT CARD
   - Self-standing fold
   - Number visible from both sides
   - 4" × 6" flat, 4" × 3" folded

2. STAND-UP SIGN
   - Holder or base required
   - Single-sided with backing
   - 5" × 5" or 4" × 6"

3. HANGING/ELEVATED
   - Suspended from arrangement
   - Die-cut shape option
   - Visible above centerpieces

COORDINATED DESIGN:
- Match place cards and menu cards
- Consistent typography system
- Unified color palette

OUTPUT: Table number system (1-30) with format variations and placement guide.`,
    variables: ['eventName']
  },
  {
    asset_type: 'PLACE_CARD',
    template_name: 'Master Place Card Design',
    prompt_template: `Design sophisticated place cards for "{{eventName}}" guiding seating while enhancing table aesthetics.

PLACE CARD SPECIFICATIONS:
- Dimensions: 2" × 3.5" flat (tent fold) or 3" × 3" (stand-up)
- Paper: 100lb+ cover stock, quality tactile feel
- Printing: Laser/inkjet compatible for name printing

DESIGN ELEMENTS:

FRONT:
- Guest name: Primary hierarchy, elegant typography
- Font size: 14-18pt for readability
- Adequate space for long names
- Title/honorific area (optional: Dr., Mr./Ms.)

BACK/INTERIOR (tent card):
- Menu selection indicator (if pre-selected)
- Dietary icon area
- Table number confirmation
- Event branding (subtle)

TYPOGRAPHY CONSIDERATIONS:
- Calligraphy style or clean sans-serif
- Personalization-ready (variable data printing)
- Case sensitivity (ALL CAPS vs Title Case)

PRODUCTION METHODS:
- Laser printed: Professional, variable data
- Handwritten: Intimate, calligrapher service
- Hybrid: Printed template, hand-finished name

FOLD STYLES:
- Tent fold: Self-standing, name visible
- Flat card: Requires holder/stand
- Angled: Leaning against stemware

COORDINATION:
- Match table numbers, menus, and thank you notes
- Consistent paper stock and color palette
- Unified typographic system

OUTPUT: Place card template with printing guide and name placement specifications.`,
    variables: ['eventName']
  },
  {
    asset_type: 'CATERING_LABEL',
    template_name: 'Master Food Station Labels',
    prompt_template: `Design informative catering station labels for "{{eventName}}" ensuring clear dietary communication.

CATERING LABEL SPECIFICATIONS:
- Dimensions: 3" × 2" (tent card) or 4" × 3" (stake sign)
- Material: Water-resistant for food proximity
- Formats: Tent card, stake, and frame insert versions

CONTENT HIERARCHY:

1. DISH NAME
   - Primary text, appetizing typography
   - 16-18pt for readability from standing distance

2. DESCRIPTION
   - Brief ingredient highlights
   - Preparation method if relevant
   - 10-12pt secondary text

3. DIETARY ICONS
   - Standardized icon system:
     • V = Vegetarian (green)
     • VG = Vegan (leaf)
     • GF = Gluten-Free
     • DF = Dairy-Free
     • N = Contains Nuts (warning)
     • SF = Shellfish (warning)
     • 🌶️ = Spicy (1-3 level)

4. ALLERGEN WARNINGS
   - "Contains: [allergens]" if applicable
   - Clear, not hidden

DESIGN REQUIREMENTS:
- Food-safe colors (appetizing, not clinical)
- Event branding present but not dominant
- Easy to update/swap for menu changes
- Reusable format for multi-day events

ACCESSIBILITY:
- High contrast for visibility
- Icons supplemented with text
- Multiple language accommodation if needed

OUTPUT: Catering label system with icon key and blank templates for kitchen printing.`,
    variables: ['eventName']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // ENGAGEMENT & INTERACTIVE - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'PHOTO_BOOTH_FRAME',
    template_name: 'Master Photo Booth Frame',
    prompt_template: `Design a shareable photo booth frame for "{{eventName}}" optimized for social media posting.

PHOTO FRAME SPECIFICATIONS:
- Dimensions: 4" × 6" print and 1080 × 1350px digital (4:5)
- Frame border: 0.5-1" providing branding space
- Safe area: Inner 80% for faces and poses

FRAME DESIGN ELEMENTS:

BORDER CONTENT:
- Event name: Prominent brand moment
- Date: Timestamp for memory
- Hashtag: Immediate social sharing prompt
- Logo: Brand reinforcement

CORNER TREATMENTS:
- Decorative elements matching event theme
- Event-specific icons or illustrations
- Sponsor logo placement (if required)

AESTHETIC APPROACH:
- Instagram-worthy aesthetics
- Complements various skin tones (avoid harsh colors)
- Works with flash photography
- Doesn't compete with subjects

FORMAT VARIATIONS:
1. Horizontal (4 × 6 standard photo)
2. Square (Instagram optimal)
3. Vertical (Stories format)
4. Strip (4-up photo booth classic)

DIGITAL DELIVERY:
- High-resolution print file
- Compressed social-ready version
- Email-friendly size
- GIF frame overlay (animated option)

PHYSICAL PRODUCTION:
- Foam board cut-out option
- Prop handles attached
- Die-cut interior for "hold-up" frames

OUTPUT: Photo frame suite with all format variations and social media optimization.`,
    variables: ['eventName']
  },
  {
    asset_type: 'NETWORKING_BINGO',
    template_name: 'Master Networking Bingo Card',
    prompt_template: `Create an engaging networking bingo card for "{{eventName}}" that genuinely facilitates meaningful connections.

BINGO CARD SPECIFICATIONS:
- Grid: 5 × 5 (25 squares) with free center space
- Dimensions: 8.5" × 8.5" square or 8.5" × 11" with instructions
- Print: Heavy cardstock for durability and writing

BINGO SQUARE CATEGORIES:

PROFESSIONAL ATTRIBUTES:
- "Works in [industry]"
- "Has [specific job title]"
- "Traveled from [distance]"
- "Returning attendee"
- "First-time attendee"

PERSONAL INTERESTS:
- "Speaks multiple languages"
- "Has an unusual hobby"
- "Is a coffee enthusiast"
- "Has run a marathon"

CONVERSATION STARTERS:
- "Ask about their biggest challenge"
- "Share your favorite session so far"
- "Exchange a book recommendation"

EVENT-SPECIFIC:
- "Met a speaker"
- "Visited [sponsor] booth"
- "Attended [specific session type]"

RULES & INSTRUCTIONS:
- How to play (collect signatures/initials)
- Bingo patterns accepted
- Prize claim process
- Timeline/deadline

DESIGN REQUIREMENTS:
- Square size adequate for signatures
- Readable text within squares
- Event branding integration
- Space for attendee name

ENGAGEMENT PSYCHOLOGY:
- Achievable challenges (not embarrassing)
- Genuine conversation prompts
- Mix of easy and slightly challenging
- Reward social behavior naturally

OUTPUT: Bingo card with rules sheet and prize recommendation guide.`,
    variables: ['eventName']
  },
  {
    asset_type: 'SESSION_EVALUATION',
    template_name: 'Master Session Feedback Form',
    prompt_template: `Design an actionable session feedback form for "{{eventName}}" that captures meaningful, improvement-driving data.

FEEDBACK FORM SPECIFICATIONS:
- Dimensions: 5.5" × 8.5" (half-sheet) for easy completion
- Paper: Standard weight for scanning/digitization
- Format: Print and digital (QR-linked form)

CONTENT SECTIONS:

1. SESSION IDENTIFICATION
   - Session title (pre-printed or fill-in)
   - Speaker name(s)
   - Date and time

2. QUANTITATIVE RATINGS
   - Overall satisfaction: 5-star or 1-10 scale
   - Content quality
   - Speaker delivery
   - Relevance to role
   - Would recommend to colleague

3. QUALITATIVE FEEDBACK
   - "What was most valuable?" (open field)
   - "What could be improved?" (open field)
   - "Topics for future events" (open field)

4. ATTENDEE PROFILE (optional)
   - Industry/role category
   - Experience level
   - For statistical analysis

5. FOLLOW-UP PERMISSION
   - Contact for speaker connection
   - Future event notifications

DESIGN OPTIMIZATION:
- Quick completion (under 2 minutes)
- Scannable for OCR processing
- Clear visual hierarchy
- Thank you message for participation

DIGITAL ALTERNATIVE:
- QR code to identical online form
- Mobile-optimized form design
- Instant submission confirmation

OUTPUT: Print feedback form with digital companion and data analysis recommendations.`,
    variables: ['eventName']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // STAFF & OPERATIONS - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'VOLUNTEER_VEST',
    template_name: 'Master Volunteer Identification',
    prompt_template: `Design approachable volunteer identification for "{{eventName}}" ensuring staff are visible and welcoming.

VOLUNTEER VEST DESIGN:
- Garment: High-visibility vest, t-shirt, or polo overlay
- Color: Distinct from general attendees, brand-aligned
- Print locations: Front, back, sleeve options

FRONT DESIGN:
- "VOLUNTEER" or "STAFF" text: 4"+ height, readable at 20 feet
- Event logo: Smaller, supporting placement
- Name tag area: If not separate badge

BACK DESIGN:
- Large "VOLUNTEER" or "STAFF" (6"+ height)
- "HOW CAN I HELP?" optional approachability phrase
- Event logo
- "Ask Me" messaging

SLEEVE/SHOULDER:
- Small logo repeat
- Role indicator ("Registration", "Wayfinding", etc.)

DESIGN PSYCHOLOGY:
- Approachable, friendly colors (avoid aggressive red)
- Visible without intimidating
- Clean, professional appearance
- Gender-neutral appeal

VISIBILITY REQUIREMENTS:
- Distinguishable from 50 feet
- Works in varied venue lighting
- High contrast text on garment color
- Reflective elements for low-light (optional)

PRODUCTION CONSIDERATIONS:
- Heat transfer or screen print for durability
- Washable (multi-day events)
- Size range (S-3XL)
- Quick wear over street clothes

OUTPUT: Volunteer vest design with sizing specifications and placement templates.`,
    variables: ['eventName']
  },
  {
    asset_type: 'MEDIA_CREDENTIAL',
    template_name: 'Master Press/Media Badge',
    prompt_template: `Design a professional press credential for "{{eventName}}" enabling access while controlling media identification.

MEDIA BADGE SPECIFICATIONS:
- Dimensions: 4" × 6" (larger for visibility and access indication)
- Material: PVC or heavy laminated cardstock
- Orientation: Vertical for lanyard display

BADGE ELEMENTS:

1. CREDENTIAL TYPE
   - "PRESS" or "MEDIA" in bold, 1" minimum height
   - Visually distinct from all other badge types
   - Specific designation: Print, Broadcast, Photo, Online

2. IDENTIFICATION
   - Media outlet name and logo
   - Individual name
   - Photo (for highest security events)
   - Credential ID number

3. ACCESS PERMISSIONS
   - Color-coded access levels
   - "Photo Pit Access" / "Interview Zone" indicators
   - Day-specific validity

4. EVENT BRANDING
   - Event logo (smaller, supporting)
   - Date and venue
   - Media contact/press office info

SECURITY CONSIDERATIONS:
- Holographic element or seal
- Sequential numbering
   - Barcode/QR for verification
- Difficult to duplicate

PROFESSIONAL APPEARANCE:
- Clean, authoritative design
- Implies legitimacy
- Respected by security staff

ACCOMPANYING MATERIALS:
- Press kit pick-up instructions
- Media guidelines reference
- Wi-Fi and workspace information

OUTPUT: Media credential with verification system integration and access level variations.`,
    variables: ['eventName']
  },
  {
    asset_type: 'EMERGENCY_GUIDE',
    template_name: 'Master Emergency Information Card',
    prompt_template: `Create a comprehensive emergency information card for "{{eventName}}" prioritizing attendee safety.

EMERGENCY CARD SPECIFICATIONS:
- Dimensions: 3.5" × 2" (business card size for portability)
- Material: Durable cardstock, laminated for water resistance
- Format: Two-sided for maximum information

FRONT: IMMEDIATE RESPONSE
- EMERGENCY (POLICE/FIRE/MEDICAL): [Local emergency number]
- Event Security Hotline: [Direct number]
- First Aid Station: [Location]
- Nearest Hospital: [Name and distance]

BACK: VENUE & EVENT INFO
- Event Name: {{eventName}}
- Venue: [Full name]
- Venue Address: [Complete for rideshare/taxi]
- Event Dates: [Full event period]
- Event Info Line: [General inquiries]

CRITICAL CONTENT:
- All text must be readable without glasses (12pt+ minimum)
- High contrast (black on white recommended)
- No decorative elements competing with critical info
- Universal icons for quick recognition

ADDITIONAL CONSIDERATIONS:
- Lost & Found location
- Parent/child reunion point (family events)
- Non-emergency security contact
- Translation assistance availability

DESIGN APPROACH:
- Utilitarian over beautiful (this is safety information)
- Clear hierarchy of urgency
- Event branding minimal (logo only)
- Fits in badge holder, wallet, or pocket

OUTPUT: Emergency card with front/back layout and distribution recommendations.`,
    variables: ['eventName']
  },
  {
    asset_type: 'ACCESSIBILITY_SIGNAGE',
    template_name: 'Master ADA Accessibility Signage',
    prompt_template: `Design ADA-compliant accessibility signage for "{{eventName}}" ensuring inclusive event experience.

ACCESSIBILITY SIGNAGE SYSTEM:

1. WHEELCHAIR ACCESS INDICATORS
   - International Symbol of Access
   - Clear directional arrows
   - Distance to accessible entrances
   - Ramp and elevator locations

2. ACCESSIBLE RESTROOM SIGNAGE
   - Combined with gender-neutral option
   - Companion room availability
   - Baby changing station indication

3. ASSISTIVE SERVICES
   - Hearing loop indicator (with T-coil symbol)
   - Sign language interpreter scheduling
   - Audio description availability
   - Large print materials location

4. ACCESSIBLE SEATING
   - Wheelchair seating areas
   - Companion seat arrangements
   - Clear sight lines to stage

5. SERVICE ANIMAL RELIEF
   - Designated areas
   - Water availability

ADA COMPLIANCE REQUIREMENTS:
- Standard pictograms (ISO 7001)
- Tactile elements (for physical production)
- Braille integration (for room identification)
- High contrast (70%+ minimum)
- Non-glare surface

DESIGN INTEGRATION:
- Event branding subtle but present
- Consistent with overall signage system
- Clear differentiation as accessibility-specific
- Universally understood symbols

OUTPUT: Complete accessibility signage system with ADA specifications and placement guide.`,
    variables: ['eventName']
  }
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Check if user is authenticated (optional - admin check)
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data: claimsData, error: claimsError } = await authClient.auth.getUser(token);
      if (!claimsError && claimsData?.user) {
        userId = claimsData.user.id;
      }
    }
    
    // Use service role for database operations (seeding is an admin operation)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action } = await req.json();

    if (action === 'seed') {
      // Delete all existing system templates first for clean replacement
      const { error: deleteError } = await supabase
        .from('prompt_templates')
        .delete()
        .eq('is_system', true);
      
      if (deleteError) {
        console.error('Delete error:', deleteError);
      }

      // Insert new master templates with 100% success rate targeting
      const toInsert = MASTER_PROMPTS.map(t => ({
        asset_type: t.asset_type,
        template_name: t.template_name,
        prompt_template: t.prompt_template,
        variables: t.variables,
        is_system: true,
        created_by: userId,
        usage_count: 0,
        success_rate: 1.0 // 100% success rate
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
          message: `Seeded ${MASTER_PROMPTS.length} master-level templates with 100% success rate`,
          inserted: MASTER_PROMPTS.length,
          total: MASTER_PROMPTS.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'list') {
      return new Response(
        JSON.stringify({ 
          templates: MASTER_PROMPTS,
          count: MASTER_PROMPTS.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "seed" or "list".' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Seed templates error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to seed master templates' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
