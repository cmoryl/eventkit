import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// INDUSTRY-STANDARD MASTER-LEVEL PROMPT TEMPLATES
// All templates feature 100% success rate targeting, intricate details, and advanced prompt engineering
// Comprehensive coverage for ALL 137 asset types with 5 examples each where applicable

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
    asset_type: 'HANGING_SIGNAGE',
    template_name: 'Master Overhead Hanging Sign',
    prompt_template: `Design impactful overhead hanging signage for "{{eventName}}" optimized for visibility from distance and multiple angles.

SPECIFICATIONS:
- Double-sided design for 360° visibility
- Dimensions: 4' × 2' standard overhead format
- Material: Lightweight rigid substrate or fabric
- Viewing distance: 50-100 feet optimal

DESIGN REQUIREMENTS:
- Bold, simplified graphics readable from below
- Large typography (minimum 6" letter height)
- High contrast color combinations
- Clear directional or identification messaging
- Brand colors: {{colors}}

CONTENT OPTIONS:
- Area/zone identification
- Track/session indicators
- Sponsor recognition zones
- Wayfinding directional arrows

INSTALLATION CONSIDERATIONS:
- Weight limits for venue rigging
- Lighting conditions (backlit options)
- Wind/air movement for fabric signs
- Safety cable attachment points

OUTPUT: Print-ready hanging sign with rigging specifications and placement guide.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'OUTDOOR_SIGNAGE',
    template_name: 'Master Outdoor Event Signage',
    prompt_template: `Create weather-resistant outdoor signage for "{{eventName}}" designed for maximum durability and visibility.

SPECIFICATIONS:
- Dimensions: Variable (24"×36" to 4'×8')
- Material considerations: Coroplast, aluminum, vinyl, fabric
- Weather resistance: UV-resistant inks, waterproof substrates
- Wind rating: Design for wind load at location {{location}}

DESIGN REQUIREMENTS:
- High contrast for daylight visibility
- Reflective elements for evening events (optional)
- Large, bold typography (minimum 1" per 10' viewing distance)
- Simplified graphics without fine details
- Colors: {{colors}} optimized for outdoor conditions

CONTENT TYPES:
- Event entrance identification
- Parking directional signs
- Venue approach wayfinding
- Safety/regulatory compliance

DURABILITY SPECIFICATIONS:
- UV resistance rating
- Waterproof seal requirements
- Wind load calculations
- Stake/ground mount systems

OUTPUT: Print-ready outdoor signage with material specifications and installation guidelines.`,
    variables: ['eventName', 'location', 'colors']
  },
  {
    asset_type: 'DOOR_SIGNAGE',
    template_name: 'Master Door and Room Signage',
    prompt_template: `Design professional door signage for "{{eventName}}" rooms and spaces ensuring clear identification and information.

SPECIFICATIONS:
- Dimensions: 8.5" × 11" or 11" × 8.5" (portrait/landscape)
- Material: Rigid PVC, acrylic, or heavy cardstock
- Mounting: Adhesive strips, magnetic, or sleeve insert

CONTENT HIERARCHY:
1. Room/Space name (primary - largest type)
2. Current session/activity (changeable insert option)
3. Capacity information
4. Accessibility indicators
5. Event branding (subtle - corner placement)

DESIGN ELEMENTS:
- Color coding by track/category
- Clear, readable sans-serif typography
- ADA-compliant contrast ratios
- Icon system for room types (breakout, workshop, lounge)
- QR code for schedule/room details

VARIANTS NEEDED:
- Standard room signs
- "Session in Progress" indicators
- "Do Not Disturb" / "Open" reversible signs
- VIP/Private room designation

OUTPUT: Complete door signage system with templates and insert sheets.`,
    variables: ['eventName']
  },
  {
    asset_type: 'EASEL_SIGNAGE',
    template_name: 'Master Easel Display Signage',
    prompt_template: `Design elegant easel-mounted signage for "{{eventName}}" suitable for registration, welcome areas, and key information points.

SPECIFICATIONS:
- Dimensions: 22" × 28" (fits standard easel)
- Material: Foam board, gator board, or framed print
- Orientation: Portrait for maximum text, landscape for graphics

DESIGN HIERARCHY:
1. Event logo and branding header
2. Primary message/welcome text
3. Supporting information (schedule, wifi, etc.)
4. Call-to-action or QR code
5. Sponsor recognition footer

STYLE DIRECTION:
- Premium, professional appearance
- Colors: {{colors}}
- Typography: Elegant, readable at 6-10 feet
- Visual balance between information and white space

CONTENT APPLICATIONS:
- Welcome/registration greeting
- Schedule overview
- Sponsor recognition
- Menu/food station identification
- Session room indicators

PRODUCTION NOTES:
- Matte finish to reduce glare
- Easel compatibility verification
- Weight considerations for stability

OUTPUT: Print-ready easel sign with multiple content variants.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'LOCATION_SIGNAGE',
    template_name: 'Master Location Wayfinding Signs',
    prompt_template: `Create a comprehensive location signage system for "{{eventName}}" at {{location}} ensuring seamless attendee navigation.

SIGN TYPES:

1. ENTRANCE SIGNS (large format)
   - Event branding and welcome messaging
   - Registration direction
   - Accessibility entrance indicators

2. DIRECTIONAL SIGNS (medium format)
   - Arrow-based navigation
   - Distance indicators
   - Floor/level information

3. AREA IDENTIFICATION (zone markers)
   - Networking areas
   - Food/beverage stations
   - Rest areas and amenities

4. EMERGENCY/SAFETY
   - Exit pathways
   - Emergency assembly points
   - First aid locations

DESIGN SYSTEM:
- Consistent icon library
- Color-coded zones
- Bilingual text (if applicable)
- ADA-compliant sizing and contrast
- Brand colors: {{colors}}

OUTPUT: Complete location signage kit with placement map and specifications.`,
    variables: ['eventName', 'location', 'colors']
  },
  {
    asset_type: 'ROOM_SIGNAGE',
    template_name: 'Master Room Identification System',
    prompt_template: `Design a professional room identification system for "{{eventName}}" covering all venue spaces.

SIGN SPECIFICATIONS:
- Dimensions: 8" × 10" standard room plates
- Material: Acrylic, aluminum, or rigid PVC
- Mounting: Wall-mounted with ADA-compliant placement

INFORMATION ARCHITECTURE:
1. Room name/number (primary)
2. Room type icon (session, workshop, lounge, etc.)
3. Capacity indicator
4. Accessibility symbols
5. Track/category color code
6. Event branding (subtle)

FUNCTIONALITY:
- Changeable session insert option
- "In Session" / "Available" indicators
- QR code for room schedule
- Emergency exit pathway indicator

DESIGN REQUIREMENTS:
- High contrast for visibility
- Tactile elements for accessibility
- Consistent with overall event signage system
- Colors: {{colors}}

OUTPUT: Complete room signage system with templates for all room types.`,
    variables: ['eventName', 'colors']
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
- Colors: {{colors}}
- Maintain strong visual hierarchy
- Bottom 6" typically hidden in stand mechanism
- Allow for natural viewing eye-level placement

OUTPUT: Print-ready banner with stand specifications and setup guide.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'FEATHER_FLAG',
    template_name: 'Master Feather Flag Design',
    prompt_template: `Design dynamic feather flag banners for "{{eventName}}" optimized for outdoor visibility and movement.

SPECIFICATIONS:
- Dimensions: 15' height (standard) or 12' (medium)
- Shape: Curved feather profile
- Material: Knitted polyester for durability and movement
- Print: Dye-sublimation for vivid colors

DESIGN CONSIDERATIONS:
- Single or double-sided printing
- Mirror or different designs for double-sided
- Allow for pole sleeve (2-3" lost on edge)
- Bottom 10" may be hidden in base
- Design for flag flutter and movement

VISUAL ELEMENTS:
- Event logo (top section, most visible)
- Bold colors: {{colors}}
- Minimal text (readable while moving)
- Strong graphic elements
- Consider how design looks when furled

DEPLOYMENT:
- Cross base for hard surfaces
- Ground spike for soft ground
- Water bag base for stability
- Indoor/outdoor versatility

OUTPUT: Print-ready feather flag design with hardware specifications.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'TEARDROP_FLAG',
    template_name: 'Master Teardrop Banner Design',
    prompt_template: `Create eye-catching teardrop banner flags for "{{eventName}}" designed for maximum brand visibility.

SPECIFICATIONS:
- Dimensions: 11' height (large) or 8' (medium)
- Shape: Teardrop/sail profile
- Material: Durable outdoor polyester
- Hardware: Aluminum poles with swivel base

DESIGN REQUIREMENTS:
- Logo placement in widest section (upper-middle)
- Bold, simplified graphics
- Colors: {{colors}} for maximum pop
- Minimal text (event name, date only)
- Design for 360° rotation visibility

LAYOUT ZONES:
1. TOP POINT: Small detail or brand element
2. WIDE MIDDLE: Primary logo and event name
3. LOWER SECTION: Date, location, or tagline
4. POLE EDGE: Account for 2" sleeve

APPLICATIONS:
- Event entrance markers
- Parking lot wayfinding
- Outdoor registration paths
- Sponsor visibility areas

OUTPUT: Print-ready teardrop flag with mirror/reverse for double-sided printing.`,
    variables: ['eventName', 'colors']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // MERCHANDISE & SWAG - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'TSHIRT',
    template_name: 'Master T-Shirt Front Design',
    prompt_template: `Design a premium wearable t-shirt front graphic for "{{eventName}}" that attendees will proudly wear beyond the event.

DESIGN PHILOSOPHY:
- Create apparel people want to wear, not just event memorabilia
- Balance brand visibility with fashion appeal
- Consider trending streetwear and graphic tee aesthetics

PRINT SPECIFICATIONS:
- Print area: 12" × 16" maximum chest area
- Colors: Limited to 4-6 for screen printing cost efficiency
- Resolution: 300 DPI vector-preferred
- Color separation ready

DESIGN APPROACHES:
1. STATEMENT PIECE: Bold typography with artistic treatment
2. ICONIC GRAPHIC: Memorable visual with subtle branding
3. MINIMAL MARK: Small left-chest logo placement
4. FULL GRAPHIC: Artistic interpretation of event theme

BRAND INTEGRATION:
- Event logo: Can be primary or secondary element
- Event date: Optional, consider longevity
- Colors: {{colors}} adapted for fabric printing
- Tagline integration if applicable

FABRIC CONSIDERATIONS:
- Design for dark AND light shirt options
- Account for fabric texture and stretch
- DTG vs screen print color vibrancy

OUTPUT: Print-ready t-shirt front design with color separations and size scaling guide.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'TSHIRT_BACK',
    template_name: 'Master T-Shirt Back Design',
    prompt_template: `Design the back panel graphic for "{{eventName}}" t-shirts complementing the front design.

BACK DESIGN SPECIFICATIONS:
- Print area: 12" × 16" full back or 4" × 4" upper back
- Placement: Centered, upper back, or lower back options

DESIGN OPTIONS:

1. SPONSOR RECOGNITION BACK
   - Sponsor logos arranged by tier
   - "Presented by" or "Powered by" designation
   - Clean grid layout for multiple logos

2. SCHEDULE/INFO BACK
   - Key event dates and times
   - Venue information
   - Stylized as part of the design

3. GRAPHIC CONTINUATION
   - Extension of front design concept
   - Creates cohesive front-to-back visual story

4. SOCIAL/ENGAGEMENT
   - Event hashtag prominently displayed
   - QR code (if size permits)
   - Community messaging

DESIGN RULES:
- Complement, don't compete with front
- Maintain readability at arm's length
- Colors: {{colors}} consistent with front
- Account for shirt seams and collar

OUTPUT: Print-ready t-shirt back design with alignment guides.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'TSHIRT_SLEEVE',
    template_name: 'Master Sleeve Print Design',
    prompt_template: `Design subtle sleeve accent graphics for "{{eventName}}" t-shirts adding premium detailing.

SLEEVE SPECIFICATIONS:
- Print area: 3" × 3" maximum per sleeve
- Placement: Upper outer sleeve (most common)
- Single color recommended for cost efficiency

DESIGN APPROACHES:

1. LOGO MARK
   - Simplified event icon/symbol
   - Works at small scale

2. EVENT IDENTIFIER
   - Year/date marking
   - Event edition number (if recurring)

3. SPONSOR HIGHLIGHT
   - Presenting sponsor small logo
   - Premium placement recognition

4. DECORATIVE ELEMENT
   - Pattern or texture sample
   - Subtle brand reinforcement

TECHNICAL CONSIDERATIONS:
- Design for curved surface
- Maintain visibility when arm moves
- Consistent with front/back aesthetic
- Colors: {{colors}} single color preferred

OUTPUT: Print-ready sleeve design with placement guide.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'LANYARD',
    template_name: 'Master Lanyard Design System',
    prompt_template: `Design a premium lanyard for "{{eventName}}" that serves as both functional badge holder and brand ambassador.

LANYARD SPECIFICATIONS:
- Width: 3/4" (20mm) or 1" (25mm)
- Length: 36" standard with adjustable breakaway
- Material: Polyester, satin, or eco-friendly options
- Hardware: Metal or plastic clip, breakaway safety release

DESIGN ELEMENTS:
- Repeat pattern or continuous design
- Event name/logo at regular intervals
- Legible from normal viewing distance
- Colors: {{colors}} as primary palette

PRINTING OPTIONS:
1. SCREEN PRINT: 1-4 colors, most economical
2. SUBLIMATION: Full color, photos possible
3. WOVEN: Premium look, durable, subtle

BRANDING STRATEGY:
- Event logo every 6-8 inches
- Sponsor logos as secondary elements
- Tagline or date integration
- Website/hashtag optional

FUNCTIONAL FEATURES:
- Badge holder attachment point
- Phone/key holder secondary hook
- Safety breakaway clasp

OUTPUT: Print-ready lanyard design with repeat tile and hardware specifications.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'SWAG_BAG',
    template_name: 'Master Swag Bag Design',
    prompt_template: `Design a premium reusable swag bag for "{{eventName}}" that attendees will use long after the event.

BAG SPECIFICATIONS:
- Type: Tote bag, drawstring, or messenger style
- Dimensions: 15" × 16" tote / 14" × 18" drawstring typical
- Material: Canvas, non-woven, cotton, or eco-friendly options

DESIGN PHILOSOPHY:
- Create a bag worth keeping and reusing
- Balance branding with aesthetic appeal
- Consider sustainable, eco-friendly messaging

PRINT AREAS:
- Front panel: Primary design
- Back panel: Secondary/sponsor area
- Side panels: Subtle branding
- Bottom: Optional pattern

DESIGN ELEMENTS:
- Event logo (prominent but stylish)
- Event date (subtle integration)
- Colors: {{colors}}
- Artistic interpretation of event theme
- Avoid overly "promotional" appearance

SUSTAINABILITY MESSAGING:
- Recyclable/reusable callouts
- Eco-friendly material highlights
- Brand values alignment

OUTPUT: Print-ready swag bag design with all panel templates.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'STICKER_SHEET',
    template_name: 'Master Sticker Collection',
    prompt_template: `Design a collectible sticker sheet for "{{eventName}}" with varied designs for different applications.

SHEET SPECIFICATIONS:
- Sheet size: 4" × 6" or 5" × 7"
- Individual stickers: Mix of sizes (0.5" to 2")
- Material: Vinyl, paper, or holographic options
- Finish: Matte, gloss, or die-cut

STICKER COLLECTION (8-12 pieces):

1. LOGO STICKER (2)
   - Primary event logo
   - Simplified icon version

2. TYPOGRAPHIC (2)
   - Event name stylized
   - Tagline or hashtag

3. ICONIC ELEMENTS (3-4)
   - Event theme symbols
   - Industry/topic icons
   - Mascot or character (if applicable)

4. PLAYFUL/FUN (2-3)
   - Expressions or quotes
   - Emoji-style graphics
   - Humorous elements

DESIGN REQUIREMENTS:
- Each sticker works independently
- Cohesive color palette: {{colors}}
- Mix of shapes (circles, squares, die-cut)
- Varied sizes for different uses (laptop, water bottle, phone)

OUTPUT: Print-ready sticker sheet with individual die-cut lines and bleed.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'HAT',
    template_name: 'Master Cap Embroidery Design',
    prompt_template: `Design premium headwear graphics for "{{eventName}}" optimized for embroidery and print applications.

HAT SPECIFICATIONS:
- Style: Baseball cap, snapback, dad hat, or beanie
- Front embroidery area: 4" × 2" maximum
- Side/back areas: 1.5" × 1.5" typical

EMBROIDERY DESIGN REQUIREMENTS:
- Maximum 8 thread colors (cost consideration)
- Minimum 0.25" line width for clean stitching
- Avoid tiny details that won't translate
- Vector artwork with stitch direction indicators
- PMS color matches for thread selection

DESIGN OPTIONS:

1. FRONT PANEL
   - Event logo (simplified for embroidery)
   - Text-based design
   - Icon/symbol mark

2. SIDE PANEL
   - Secondary logo or sponsor
   - Year/date marking
   - Small icon element

3. BACK PANEL
   - Adjustable strap area branding
   - Website or hashtag

BRAND ELEMENTS:
- Colors: {{colors}} matched to thread colors
- Simplified artwork for stitch quality
- Premium, wearable aesthetic

OUTPUT: Embroidery-ready cap design with stitch count and color specifications.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'WATER_BOTTLE',
    template_name: 'Master Water Bottle Design',
    prompt_template: `Design a premium branded water bottle for "{{eventName}}" that becomes a valued everyday item.

BOTTLE SPECIFICATIONS:
- Type: Stainless steel, plastic, or aluminum
- Size: 20-24 oz typical
- Print area: Wraparound or single-sided
- Print method: Screen print, laser engrave, or full wrap

DESIGN CONSIDERATIONS:
- Cylindrical surface (design will curve)
- 360° viewing angles
- Handle/grip area clearance
- Lid/cap color coordination

DESIGN ELEMENTS:
- Event logo (prominent but elegant)
- Clean, modern aesthetic
- Colors: {{colors}}
- Minimal text for premium feel
- Pattern or texture options for wrap

BRANDING STRATEGIES:
1. MINIMAL: Small logo, large color field
2. BOLD: Full wrap graphic design
3. PREMIUM: Engraved/etched metal effect
4. PLAYFUL: Illustrated pattern with branding

FUNCTIONAL CONSIDERATIONS:
- Dishwasher-safe print methods
- Durability for daily use
- Gift-worthy presentation

OUTPUT: Print-ready water bottle design with wrap template and specifications.`,
    variables: ['eventName', 'colors']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // DIGITAL & SOCIAL - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'SOCIAL_POST',
    template_name: 'Master Social Media Post',
    prompt_template: `Create a scroll-stopping social media post for "{{eventName}}" optimized for engagement and brand recognition.

PLATFORM SPECIFICATIONS:
- Instagram/Facebook: 1080 × 1080px (square) or 1080 × 1350px (portrait)
- LinkedIn: 1200 × 1200px or 1200 × 627px
- Twitter/X: 1200 × 675px
- Resolution: 72 DPI RGB

CONTENT HIERARCHY:
1. VISUAL HOOK: Eye-catching graphic or photo treatment
2. HEADLINE: Bold, concise messaging (under 10 words)
3. SUPPORTING INFO: Date, location, or key details
4. CALL-TO-ACTION: Clear next step
5. BRANDING: Logo and event identity

DESIGN EXCELLENCE:
- Platform-native aesthetic (feels organic, not ad-like)
- Colors: {{colors}} optimized for screen
- Typography: Large, mobile-readable (minimum 24pt)
- Strong contrast for visibility
- Thumb-stopping first impression

CONTENT TYPES:
- Announcement posts
- Speaker/session highlights
- Countdown posts
- Behind-the-scenes
- User-generated content templates

OUTPUT: Social media post with platform-specific variations and caption suggestions.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'SOCIAL_STORY',
    template_name: 'Master Story/Reel Template',
    prompt_template: `Design an engaging vertical story format for "{{eventName}}" optimized for Stories, Reels, and TikTok.

SPECIFICATIONS:
- Dimensions: 1080 × 1920px (9:16 aspect ratio)
- Safe zones: 150px from top/bottom for UI elements
- Duration consideration: Design for 5-15 second viewing

STORY TEMPLATE SYSTEM:

1. ANNOUNCEMENT STORY
   - Bold event branding
   - Key date/info
   - Swipe-up CTA area

2. COUNTDOWN STORY
   - Days remaining prominent
   - Event details
   - Urgency messaging

3. SPEAKER FEATURE
   - Photo/headshot area
   - Name and title
   - Session info

4. ENGAGEMENT STORY
   - Poll/question placement
   - Interactive elements
   - Community focus

DESIGN ELEMENTS:
- Full-bleed imagery or bold colors
- Animated-ready (motion consideration)
- Colors: {{colors}}
- Typography: Vertical-optimized, large scale
- Platform sticker/GIF friendly areas

OUTPUT: Story template series with animation suggestions and interactive element placement.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'EMAIL_HEADER',
    template_name: 'Master Email Header System',
    prompt_template: `Design a professional email header system for "{{eventName}}" communications ensuring consistent brand recognition.

SPECIFICATIONS:
- Dimensions: 600px wide × 150-200px tall (email standard)
- File size: Under 100KB for load speed
- Format: PNG or JPG (avoid complex CSS)
- Retina: Provide 2x version (1200px wide)

HEADER VARIATIONS:

1. PRIMARY HEADER
   - Full event branding
   - For major announcements
   - Maximum visual impact

2. NEWSLETTER HEADER
   - Lighter branding
   - Date/issue number integration
   - Regular communication series

3. TRANSACTIONAL HEADER
   - Minimal, professional
   - Confirmation/receipt emails
   - High deliverability priority

4. REMINDER HEADER
   - Urgency elements
   - Countdown or date prominent
   - Action-oriented

DESIGN REQUIREMENTS:
- Works on white and colored email backgrounds
- Colors: {{colors}}
- Logo always visible and legible
- Mobile-responsive consideration
- Alt text friendly (not text-as-image dependent)

OUTPUT: Email header system with responsive considerations and usage guidelines.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'LINKEDIN_BANNER',
    template_name: 'Master LinkedIn Banner',
    prompt_template: `Design a professional LinkedIn banner for "{{eventName}}" optimized for corporate visibility and B2B engagement.

SPECIFICATIONS:
- Dimensions: 1584 × 396px (personal) or 1128 × 191px (company)
- Safe zone: Avoid profile photo overlap area (left side)
- Resolution: 72 DPI RGB

PROFESSIONAL DESIGN ELEMENTS:
- Event branding (prominent but professional)
- Date and location information
- Industry-appropriate imagery
- Colors: {{colors}} in professional tones
- Website or registration URL

LAYOUT CONSIDERATIONS:
- Profile photo overlap (left 200px for personal)
- Mobile cropping (center-focused design)
- Text readability at various sizes
- Professional photography or abstract graphics

CONTENT HIERARCHY:
1. Event name/logo (right-center focus)
2. Date and year
3. Location or virtual indicator
4. Tagline or value proposition
5. Website/CTA (subtle)

OUTPUT: LinkedIn banner with safe zone guides and mobile preview.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'TWITTER_HEADER',
    template_name: 'Master Twitter/X Header',
    prompt_template: `Design an impactful Twitter/X header for "{{eventName}}" optimized for the platform's unique layout.

SPECIFICATIONS:
- Dimensions: 1500 × 500px
- Safe zone: Avoid bottom-left (profile photo overlap)
- Mobile: Bottom portion may be cropped

DESIGN REQUIREMENTS:
- Bold, attention-grabbing visual
- Minimal text (platform is text-heavy)
- Colors: {{colors}} high contrast for visibility
- Event branding integration
- Timeline-friendly aesthetic

LAYOUT STRATEGY:
- Center-right focus for main content
- Avoid critical info in bottom-left quadrant
- Consider how it pairs with profile photo
- Seasonal/campaign variant options

CONTENT ELEMENTS:
- Event logo/name
- Date (subtle integration)
- Hashtag (if prominent)
- Graphic representation of event theme

OUTPUT: Twitter header with overlay guide and mobile crop preview.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'YOUTUBE_THUMBNAIL',
    template_name: 'Master YouTube Thumbnail',
    prompt_template: `Design a high-click-rate YouTube thumbnail for "{{eventName}}" content optimized for search and browse visibility.

SPECIFICATIONS:
- Dimensions: 1280 × 720px (16:9 aspect ratio)
- File size: Under 2MB
- Format: JPG or PNG

THUMBNAIL OPTIMIZATION:
- Large, readable text (fills 1/3 of frame)
- High contrast colors: {{colors}}
- Face/human element when possible
- Emotion-provoking imagery
- Curiosity gap creation

DESIGN ELEMENTS:
- 3-5 word max headline
- Event branding (subtle, corner placement)
- Bold outlines around text
- Contrasting background
- Avoid red/gray (blends with YouTube UI)

CLICK-THROUGH OPTIMIZATION:
- A/B testing variants
- Consistent series branding
- Thumbnail-title synergy
- Avoid clickbait while maximizing curiosity

CONTENT TYPES:
- Event promo videos
- Speaker sessions
- Highlights/recaps
- Tutorial/educational content

OUTPUT: YouTube thumbnail with text-safe zones and variant suggestions.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'PODCAST_COVER',
    template_name: 'Master Podcast Cover Art',
    prompt_template: `Design a professional podcast cover for "{{eventName}}" content that stands out in podcast directories.

SPECIFICATIONS:
- Dimensions: 3000 × 3000px (Apple/Spotify requirement)
- Format: RGB JPG or PNG
- File size: Under 5MB

DESIGN REQUIREMENTS:
- Readable at 55px × 55px (smallest display)
- Bold, simple graphics
- Maximum 3-4 words of text
- Colors: {{colors}} high contrast
- Avoid fine details

VISUAL HIERARCHY:
1. Show/event name (largest element)
2. Key visual or logo mark
3. Subtle branding elements
4. Background treatment

BEST PRACTICES:
- Test at small size first
- Avoid gradients that blur at small sizes
- Strong silhouette/shape recognition
- Consistent with event brand system
- Series variants for different content types

OUTPUT: Podcast cover art with small-size preview and episode variant template.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'APP_ICON',
    template_name: 'Master App Icon Design',
    prompt_template: `Design a distinctive app icon for "{{eventName}}" optimized for iOS and Android platforms.

SPECIFICATIONS:
- iOS: 1024 × 1024px master (auto-scales down)
- Android: 512 × 512px with optional adaptive icon
- Format: PNG with no transparency (iOS)

DESIGN PRINCIPLES:
- Instant recognition at 29px × 29px
- Simple, bold shape or symbol
- Limited color palette (2-3 colors max)
- No text (or 1-2 letters maximum)
- Distinct silhouette

ICON APPROACHES:
1. SYMBOL: Event icon simplified to essence
2. LETTERMARK: First letter(s) of event name
3. ABSTRACT: Geometric representation of theme
4. MASCOT: Character-based (if applicable)

TECHNICAL REQUIREMENTS:
- No transparency (iOS requirement)
- Avoid pure black/white edges
- Test on light/dark wallpapers
- Adaptive icon for Android (separate layers)
- Colors: {{colors}} adapted for icon use

OUTPUT: App icon with all size variants and adaptive icon assets.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'FAVICON',
    template_name: 'Master Favicon Design',
    prompt_template: `Design a pixel-perfect favicon for "{{eventName}}" optimized for browser tabs and bookmarks.

SPECIFICATIONS:
- Primary: 32 × 32px and 16 × 16px
- Apple Touch: 180 × 180px
- Android: 192 × 192px
- MS Tile: 150 × 150px

DESIGN CONSTRAINTS:
- Must be legible at 16px
- Simple shape or letter only
- 2-3 colors maximum
- Strong contrast against browser chrome
- Distinct from common favicons

APPROACHES:
1. SINGLE LETTER: First letter of event name
2. SYMBOL: Simplified event icon
3. ABSTRACT SHAPE: Unique geometric mark
4. COLOR BLOCK: Bold color in simple shape

TECHNICAL REQUIREMENTS:
- .ico format for legacy support
- PNG for modern browsers
- SVG for scalable version
- Transparent background option
- Colors: {{colors}} simplified

OUTPUT: Complete favicon package with all size variants and format files.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'ZOOM_BACKGROUND',
    template_name: 'Master Virtual Background',
    prompt_template: `Design a professional virtual meeting background for "{{eventName}}" suitable for video conferencing.

SPECIFICATIONS:
- Dimensions: 1920 × 1080px (16:9)
- Format: JPG or PNG (no video initially)
- File size: Under 5MB for platform upload

DESIGN CONSIDERATIONS:
- Person will be composited in foreground
- Avoid busy patterns in center-left (speaker area)
- Colors: {{colors}} that complement skin tones
- Subtle branding (not distracting)

BACKGROUND TYPES:

1. BRANDED OFFICE
   - Professional environment
   - Subtle event branding
   - Plants, shelves, windows

2. EVENT VENUE
   - Stylized venue representation
   - Stage or exhibition feel
   - Immersive experience

3. ABSTRACT BRANDED
   - Color gradients or patterns
   - Prominent but elegant logo
   - Corporate-ready

4. MINIMAL
   - Solid color or subtle gradient
   - Small corner logo
   - Maximum speaker focus

BEST PRACTICES:
- Test with real video capture
- Avoid green/blue (chroma key conflicts)
- Keep right side cleaner for speaker

OUTPUT: Virtual background set with usage guidelines and video call mockups.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'WEBINAR_SLIDE',
    template_name: 'Master Webinar Slide Template',
    prompt_template: `Design a professional webinar slide template for "{{eventName}}" optimized for online presentations.

SPECIFICATIONS:
- Dimensions: 1920 × 1080px (16:9 widescreen)
- Format: PowerPoint/Keynote compatible
- Resolution: 96 DPI for screen

SLIDE TYPES NEEDED:

1. TITLE SLIDE
   - Session title prominent
   - Speaker info with photo
   - Event branding

2. AGENDA SLIDE
   - Numbered topic list
   - Time indicators
   - Clean hierarchy

3. CONTENT SLIDE
   - Header/title area
   - Body content zone
   - Footer with branding

4. SPEAKER SLIDE
   - Large photo area
   - Bio text zone
   - Social handles

5. Q&A SLIDE
   - Interactive indicator
   - Questions prompt
   - Contact info

6. THANK YOU/CLOSE
   - Call-to-action
   - Contact info
   - Next steps

DESIGN ELEMENTS:
- Consistent header/footer system
- Colors: {{colors}}
- Large, screen-readable typography (24pt minimum)
- Minimal visual clutter

OUTPUT: Complete webinar slide deck template with all slide types.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'LIVE_STREAM_OVERLAY',
    template_name: 'Master Live Stream Graphics',
    prompt_template: `Design a professional live stream overlay package for "{{eventName}}" for use on YouTube, Twitch, or custom streaming platforms.

SPECIFICATIONS:
- Resolution: 1920 × 1080px
- Format: PNG with transparency
- Elements: Lower thirds, frames, transitions

OVERLAY COMPONENTS:

1. FULL FRAME OVERLAY
   - Decorative border/frame
   - Logo placement (corner)
   - Safe zone for video content

2. LOWER THIRD
   - Speaker name area
   - Title/topic zone
   - Event branding
   - Animated-ready design

3. BRB/STANDBY SCREEN
   - Full-screen holding graphic
   - "Starting Soon" / "Be Right Back" variants
   - Countdown timer placeholder

4. END SCREEN
   - Thank you messaging
   - Social follow CTAs
   - Sponsor recognition

DESIGN REQUIREMENTS:
- Consistent with event brand: {{colors}}
- Clean, broadcast-quality aesthetic
- Easy to read on various devices
- Animation-friendly elements

OUTPUT: Complete stream overlay package with animation specifications.`,
    variables: ['eventName', 'colors']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // VENUE & ENVIRONMENTAL - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'MAIN_STAGE_BACKDROP',
    template_name: 'Master Stage Backdrop Design',
    prompt_template: `Design a stunning main stage backdrop for "{{eventName}}" creating maximum visual impact for speakers and presentations.

SPECIFICATIONS:
- Dimensions: Typically 40' × 16' or custom to venue
- Resolution: 72-100 DPI (viewing distance 20+')
- Format: PDF with bleed for seamless panels

DESIGN ZONES:

1. CENTER STAGE
   - Primary branding element
   - Event name/logo
   - Keynote-worthy presence

2. FLANKING AREAS
   - Supporting graphics
   - Pattern or imagery
   - Sponsor integration zones

3. BOTTOM EDGE
   - Speaker podium clearance
   - Lower third safe zone
   - Stage monitor considerations

DESIGN ELEMENTS:
- Colors: {{colors}} in dramatic execution
- Large-scale typography
- Photographic or abstract imagery
- LED-friendly (if applicable)
- Photography backdrop consideration

TECHNICAL REQUIREMENTS:
- Panel break guides
- Color consistency across panels
- Fabric vs rigid print specifications
- Lighting interaction consideration

OUTPUT: Print-ready stage backdrop with panel guides and lighting recommendations.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'BACK_WALL',
    template_name: 'Master Background Wall Design',
    prompt_template: `Design an impressive branded background wall for "{{eventName}}" suitable for photo opportunities and general branding.

SPECIFICATIONS:
- Dimensions: 8' × 10' typical (scalable)
- Resolution: 100-150 DPI
- Material: Fabric, vinyl, or tension wall system

DESIGN APPROACHES:

1. LOGO REPEAT
   - Step-and-repeat pattern
   - Sponsor logo integration
   - Photo-friendly sizing

2. SOLID BRANDED
   - Single large logo/graphic
   - Bold color background: {{colors}}
   - Statement piece

3. SCENIC/IMMERSIVE
   - Photo backdrop style
   - On-theme imagery
   - Instagram-worthy aesthetic

4. HYBRID
   - Mix of branding and scenery
   - Subtle pattern with focal point
   - Versatile applications

PHOTO CONSIDERATIONS:
- Lighting compatibility
- Flash reflection avoidance
- Skin tone complement
- Social media sharing appeal

OUTPUT: Print-ready background wall with mockups and lighting suggestions.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'STEP_AND_REPEAT',
    template_name: 'Master Step and Repeat Banner',
    prompt_template: `Design a professional step-and-repeat press wall for "{{eventName}}" optimized for VIP photography and media coverage.

SPECIFICATIONS:
- Dimensions: 8' × 8' or 10' × 8' typical
- Logo repeat size: 12-18" per logo
- Resolution: 100 DPI minimum

PATTERN DESIGN:
- Event logo as primary element
- Sponsor logos by tier (size hierarchy)
- Optimal spacing for photography
- Offset rows for visual interest

SPONSOR INTEGRATION:
- Title sponsor: Largest placement
- Gold sponsors: Second tier size
- Silver/Bronze: Smaller, more frequent
- All logos proportionally scaled

TECHNICAL REQUIREMENTS:
- Colors: {{colors}}
- High contrast for photography
- Avoid colors that cause skin tone issues
- No reflective finishes

PHOTOGRAPHY CONSIDERATIONS:
- Logo readable in cropped photos
- Works with different lighting setups
- Flattering backdrop for subjects
- Red carpet/media wall ready

OUTPUT: Print-ready step-and-repeat with sponsor placement guide and size specifications.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'REGISTRATION_COUNTER',
    template_name: 'Master Registration Counter Graphics',
    prompt_template: `Design impactful registration counter graphics for "{{eventName}}" creating a welcoming, branded check-in experience.

COUNTER SPECIFICATIONS:
- Front panel: 6' × 3' typical
- Side panels: 2' × 3' each
- Counter top: 6' × 2' work surface

DESIGN HIERARCHY:

1. FRONT PANEL
   - Event logo and name (primary)
   - Welcome messaging
   - Brand pattern/imagery
   - Colors: {{colors}}

2. SIDE PANELS
   - Directional cues if needed
   - Secondary branding
   - Sponsor recognition

3. COUNTER TOP
   - Organization zones
   - Badge pickup areas
   - Information zones

FUNCTIONAL ELEMENTS:
- "Registration" identification
- Line queue category markers
- Accessibility signage
- Staff identification

PRODUCTION SPECS:
- Contour-cut capable design
- Durable surface finish
- Easy-clean materials

OUTPUT: Complete registration counter graphics package with all panel templates.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'KIOSK',
    template_name: 'Master Information Kiosk Graphics',
    prompt_template: `Design comprehensive information kiosk graphics for "{{eventName}}" maximizing attendee self-service capability.

KIOSK SPECIFICATIONS:
- Header panel: 48" × 12"
- Side panels: Variable by kiosk type
- Screen surround: Device-specific

CONTENT HIERARCHY:

1. HEADER
   - Kiosk purpose identification
   - Event branding integration
   - Approaching visibility

2. INSTRUCTIONAL
   - Step-by-step guidance
   - Icon-based navigation
   - Multi-language support

3. INFORMATION DISPLAY
   - Schedule/agenda
   - Map/wayfinding
   - FAQ quick reference

4. BRANDING
   - Colors: {{colors}}
   - Consistent with event identity
   - Sponsor integration opportunities

ACCESSIBILITY REQUIREMENTS:
- ADA-compliant text sizing
- High contrast options
- Clear iconography
- Touch-target sizing for interactive

OUTPUT: Complete kiosk graphics package with installation guide.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'FLOOR_DECAL',
    template_name: 'Master Floor Graphic Design',
    prompt_template: `Design durable floor graphics for "{{eventName}}" optimized for wayfinding, branding, and engagement.

SPECIFICATIONS:
- Material: Slip-resistant vinyl or carpet graphics
- Finish: Anti-slip laminate required
- Resolution: 100 DPI (viewing from above)

FLOOR GRAPHIC TYPES:

1. DIRECTIONAL ARROWS
   - Clear wayfinding indicators
   - Destination labels
   - Color-coded routes

2. LOGO PLACEMENT
   - Event branding at key locations
   - Photo opportunity markers
   - Sponsor recognition spots

3. ZONE IDENTIFICATION
   - Area demarcation
   - Queue line markers
   - Social distancing indicators

4. INTERACTIVE/ENGAGEMENT
   - Photo spots with frames
   - Gamification elements
   - Augmented reality triggers

DESIGN REQUIREMENTS:
- Colors: {{colors}} visible against venue floor
- High contrast for safety
- Directional orientation
- Wear-resistant design (avoid fine details)

SAFETY COMPLIANCE:
- Slip coefficient standards
- Edge treatment specifications
- Installation guidelines

OUTPUT: Floor graphic collection with installation and safety specifications.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'ELEVATOR_WRAP',
    template_name: 'Master Elevator Graphics',
    prompt_template: `Design immersive elevator wrap graphics for "{{eventName}}" creating branded transitional experiences.

SPECIFICATIONS:
- Interior dimensions: Varies by elevator (measure required)
- Door panels: Standard 42" × 84" each
- Side walls: Full height, variable width
- Resolution: 150 DPI

DESIGN ZONES:

1. DOOR PANELS (PRIORITY)
   - High-impact graphics
   - Works split and together
   - Event messaging

2. INTERIOR WALLS
   - Immersive branding
   - Information displays
   - Engagement prompts

3. CEILING (OPTIONAL)
   - Overhead branding
   - Continuation of theme

DESIGN CONSIDERATIONS:
- Alignment across opening doors
- Floor indicator visibility
- Emergency information preservation
- ADA button accessibility

BRAND INTEGRATION:
- Colors: {{colors}}
- Full brand immersion
- Campaign or theme messaging
- Sponsor integration

INSTALLATION SPECS:
- Removable adhesive requirements
- Button/panel cutouts
- Safety signage preservation

OUTPUT: Complete elevator wrap template with panel guides and installation specifications.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'COLUMN_WRAP',
    template_name: 'Master Column Wrap Design',
    prompt_template: `Design impactful column wrap graphics for "{{eventName}}" maximizing vertical branding opportunities.

SPECIFICATIONS:
- Column circumference: Varies (20"-60" typical)
- Height: Floor to ceiling or partial
- Resolution: 100-150 DPI

DESIGN APPROACHES:

1. FULL BRAND WRAP
   - Event branding dominant
   - Logo repeating vertically
   - Pattern integration

2. INFORMATION COLUMNS
   - Schedule display
   - Wayfinding role
   - Sponsor recognition

3. THEMATIC/IMMERSIVE
   - Photo-realistic imagery
   - Theme extension
   - Artistic interpretation

4. DIRECTIONAL
   - Arrows and wayfinding
   - Zone identification
   - Floor indicators

DESIGN CONSIDERATIONS:
- 360° viewing angles
- Seamless wrap alignment
- Lighting conditions
- Colors: {{colors}}

TECHNICAL REQUIREMENTS:
- Seam placement strategy
- Curved surface adaptation
- Installation access

OUTPUT: Column wrap templates with circumference calculator and installation guide.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'CEILING_HANGER',
    template_name: 'Master Ceiling Hanger Design',
    prompt_template: `Design attention-grabbing ceiling hanger graphics for "{{eventName}}" visible throughout the venue space.

SPECIFICATIONS:
- Types: Blade signs, circles, triangles, custom shapes
- Size: 24" to 48" diameter typical
- Material: Lightweight rigid or fabric
- Viewing: 360° visibility from below

DESIGN ELEMENTS:
- Bold, simplified graphics
- Readable from distance and below
- Double-sided or multi-sided options
- Colors: {{colors}} high visibility

CONTENT FOCUS:
- Area identification
- Wayfinding assistance
- Sponsor branding
- Event theming

HANGING CONFIGURATIONS:
- Single hanger placement
- Grouped cluster installations
- Linear row arrangements
- Random artistic scatters

TECHNICAL REQUIREMENTS:
- Weight limitations
- Rigging point specifications
- Fire retardancy requirements
- Installation height guidelines

OUTPUT: Ceiling hanger designs with rigging specifications and placement guide.`,
    variables: ['eventName', 'colors']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // FOOD & BEVERAGE - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'MENU',
    template_name: 'Master Event Menu Design',
    prompt_template: `Design an elegant event menu for "{{eventName}}" that enhances the dining experience and reflects event quality.

SPECIFICATIONS:
- Size: 4" × 9" or 5" × 7" typical
- Material: Heavy cardstock, single or multi-fold
- Finish: Matte, soft-touch, or specialty

MENU CONTENT STRUCTURE:

1. HEADER
   - Event branding
   - Meal designation (Lunch, Dinner, Reception)
   - Date if multi-day event

2. COURSES
   - Course names
   - Dish descriptions
   - Dietary indicators

3. BEVERAGE
   - Wine pairings
   - Specialty cocktails
   - Non-alcoholic options

4. FOOTER
   - Chef attribution
   - Dietary legend
   - Venue/caterer credit

DESIGN ELEMENTS:
- Colors: {{colors}} elegant application
- Typography: Readable, elegant
- White space for premium feel
- Subtle branding integration

DIETARY ACCOMMODATIONS:
- Icon system for allergies
- Vegetarian/vegan indicators
- Gluten-free, nut-free labels

OUTPUT: Print-ready menu with dietary icon set and variants.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'BAR_MENU',
    template_name: 'Master Bar Menu Design',
    prompt_template: `Design a stylish bar menu for "{{eventName}}" showcasing beverages and signature cocktails.

SPECIFICATIONS:
- Size: Table tent, poster, or individual cards
- Material: Durable, spill-resistant options
- Lighting: Consider bar lighting conditions

MENU SECTIONS:

1. SIGNATURE COCKTAILS
   - Event-themed specialties
   - Ingredient highlights
   - Pricing or inclusive indicators

2. WINE & CHAMPAGNE
   - By-the-glass offerings
   - Bottle selections

3. BEER & CIDER
   - Draft and bottled options
   - Local/craft highlights

4. NON-ALCOHOLIC
   - Mocktails
   - Specialty sodas
   - Coffee/tea service

5. SPIRITS
   - Premium offerings
   - Mixers available

DESIGN STYLE:
- Colors: {{colors}} bar-appropriate
- Mood: Sophisticated or playful per event
- Easy-to-scan layout
- Low-light readability

OUTPUT: Bar menu in multiple formats with signature drink features.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'TABLE_TENT',
    template_name: 'Master Table Tent Design',
    prompt_template: `Design versatile table tents for "{{eventName}}" for information display and table branding.

SPECIFICATIONS:
- Size: 4" × 6" tri-fold standard
- Material: Heavy cardstock or plastic
- Construction: Self-standing tri-fold

CONTENT APPLICATIONS:

1. MENU HIGHLIGHT
   - Special dishes
   - Daily features
   - Signature drinks

2. EVENT INFORMATION
   - Schedule highlights
   - WiFi credentials
   - Event app QR code

3. SPONSOR RECOGNITION
   - Table sponsor attribution
   - Partner messaging

4. ENGAGEMENT PROMPT
   - Social media hashtags
   - Photo sharing CTAs
   - Survey QR codes

DESIGN ELEMENTS:
- Double-sided content
- Colors: {{colors}}
- Table-height visibility
- Premium finish options

OUTPUT: Table tent template with multiple content variants.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'PLACE_CARD',
    template_name: 'Master Place Card Design',
    prompt_template: `Design elegant place cards for "{{eventName}}" for seated dining and assigned seating events.

SPECIFICATIONS:
- Size: 2" × 3.5" or 3" × 4" folded
- Material: Premium cardstock
- Construction: Tent-fold, flat, or standing

CONTENT HIERARCHY:
1. Guest name (calligraphy-style or printed)
2. Table number (if applicable)
3. Meal selection indicator
4. Event branding (subtle)

DESIGN OPTIONS:

1. FORMAL/CLASSIC
   - Elegant script typography
   - Subtle borders
   - Premium embellishments

2. MODERN/MINIMAL
   - Clean sans-serif type
   - Bold color accents
   - Simple geometry

3. THEMATIC
   - Event theme integration
   - Illustrative elements
   - Unique shapes

FINISHING OPTIONS:
- Letterpress
- Foil stamping
- Edge painting
- Die-cut shapes
- Colors: {{colors}}

OUTPUT: Place card template with print-ready files and handwriting guide.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'TABLE_NUMBER',
    template_name: 'Master Table Number Design',
    prompt_template: `Design distinctive table numbers for "{{eventName}}" combining functionality with decorative appeal.

SPECIFICATIONS:
- Size: 4" × 6" or 5" × 7" typical
- Material: Cardstock, acrylic, wood, or mixed media
- Display: Standing, framed, or integrated

DESIGN APPROACHES:

1. NUMBERED
   - Bold numeral focus
   - Event branding integration
   - Clear visibility from distance

2. NAMED
   - Table names instead of numbers
   - Theme-appropriate naming
   - Unique personality per table

3. HYBRID
   - Number with themed name
   - Both identification methods

DESIGN ELEMENTS:
- Large, readable numerals
- Colors: {{colors}}
- Decorative borders/frames
- Event logo integration
- Photography-friendly

PRODUCTION OPTIONS:
- Flat print cards
- Laser-cut materials
- Illuminated numbers
- Vintage frame integration

OUTPUT: Table number templates with production specifications.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'CATERING_LABEL',
    template_name: 'Master Catering Labels',
    prompt_template: `Design professional catering labels for "{{eventName}}" ensuring clear food identification and dietary compliance.

SPECIFICATIONS:
- Size: 2" × 3" or 3" × 5" typical
- Material: Cardstock or tent cards
- Position: Buffet line, station labels

LABEL CONTENT:

1. DISH NAME
   - Clear, appetizing title
   - Accurate description

2. INGREDIENTS CALLOUT
   - Key ingredients listed
   - Preparation method

3. DIETARY INDICATORS
   - Icon system for allergens
   - V, VG, GF, DF symbols
   - Nut warnings

4. STATION IDENTIFICATION
   - Cuisine type
   - Course category

DESIGN ELEMENTS:
- High legibility typography
- Colors: {{colors}}
- Icon library for dietary
- Consistent formatting
- Stand holder compatible

DIETARY ICON SYSTEM:
- Vegetarian, Vegan
- Gluten-free, Dairy-free
- Contains nuts, Shellfish
- Spicy indicator

OUTPUT: Catering label system with dietary icons and templates.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'DIETARY_CARD',
    template_name: 'Master Dietary Card System',
    prompt_template: `Design a comprehensive dietary card system for "{{eventName}}" ensuring safe, informed dining for all guests.

SPECIFICATIONS:
- Size: 2.5" × 3.5" (business card size) for personal
- Size: 4" × 6" for table display
- Material: Durable, reusable options

DIETARY CATEGORIES:

1. ALLERGIES
   - Nuts, Shellfish, Dairy
   - Eggs, Soy, Wheat/Gluten
   - Sesame, Fish

2. PREFERENCES
   - Vegetarian, Vegan
   - Pescatarian
   - Halal, Kosher

3. RESTRICTIONS
   - Low sodium
   - Diabetic-friendly
   - Low-fat

CARD DESIGN:
- Clear color coding by category
- Universal dietary symbols
- Multi-language text
- Colors: {{colors}} integrated

USAGE TYPES:
- Guest identification cards
- Buffet station markers
- Kitchen communication
- Server reference cards

OUTPUT: Complete dietary card system with universal symbols and usage guide.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'NAPKIN_DESIGN',
    template_name: 'Master Custom Napkin Design',
    prompt_template: `Design custom branded napkins for "{{eventName}}" adding premium touches to dining experiences.

SPECIFICATIONS:
- Types: Cocktail (5×5"), Dinner (20×20"), Linen
- Imprint: 1-2 color foil stamp or print
- Materials: Paper, linen, or quality disposable

DESIGN APPROACHES:

1. LOGO STAMP
   - Event logo centered or corner
   - Single color foil (gold, silver, custom)
   - Elegant simplicity

2. MONOGRAM
   - Event initials
   - Decorative frame
   - Classic elegance

3. PATTERN
   - Custom pattern print
   - Event theme integration
   - All-over design

4. MESSAGE
   - Tagline or phrase
   - Date commemoration
   - Personalization

DESIGN CONSIDERATIONS:
- Fold visibility
- Print method limitations
- Colors: {{colors}} in foil or print
- Folding presentation options

OUTPUT: Napkin design with fold guides and print specifications.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'COASTER_DESIGN',
    template_name: 'Master Coaster Design',
    prompt_template: `Design custom coasters for "{{eventName}}" providing functional branding at every table.

SPECIFICATIONS:
- Size: 3.5" or 4" square/round
- Material: Cardboard, cork, stone, leather
- Print: Single or double-sided

DESIGN APPROACHES:

1. LOGO FOCUSED
   - Centered event branding
   - Clean, minimal design
   - Color: {{colors}}

2. INFORMATIONAL
   - WiFi password
   - Event hashtag
   - QR code for app

3. ARTISTIC
   - Illustration or pattern
   - Collectible series
   - Event theme interpretation

4. INTERACTIVE
   - Trivia questions
   - Networking prompts
   - Icebreaker games

DESIGN CONSIDERATIONS:
- Moisture resistance
- Print durability
- Stackable design appeal
- Keepsake potential

PRODUCTION OPTIONS:
- Print on absorbent stock
- Laminated for reuse
- Die-cut shapes
- Embossing/debossing

OUTPUT: Coaster design collection with production specifications.`,
    variables: ['eventName', 'colors']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // DOCUMENTS & COMMUNICATIONS - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'INVITATION_CARD',
    template_name: 'Master Event Invitation',
    prompt_template: `Design a compelling event invitation for "{{eventName}}" that creates anticipation and drives registration.

SPECIFICATIONS:
- Size: 5" × 7" or A5 standard
- Format: Digital and print-ready
- Material: Premium cardstock for print

CONTENT HIERARCHY:

1. HEADLINE/HOOK
   - Compelling invitation phrase
   - Sets tone and expectation

2. EVENT DETAILS
   - Event name prominently
   - Date: {{date}}
   - Location: {{location}}
   - Time information

3. VALUE PROPOSITION
   - Why attend
   - Key highlights
   - Featured speakers/activities

4. CALL-TO-ACTION
   - Registration URL/QR code
   - RSVP deadline
   - Contact information

DESIGN ELEMENTS:
- Colors: {{colors}}
- Premium typography
- Event branding integration
- Whitespace for elegance
- Optional: Envelope design

OUTPUT: Print-ready invitation with digital version and envelope design.`,
    variables: ['eventName', 'date', 'location', 'colors']
  },
  {
    asset_type: 'RSVP_CARD',
    template_name: 'Master RSVP Response Card',
    prompt_template: `Design an elegant RSVP response card for "{{eventName}}" facilitating easy guest response.

SPECIFICATIONS:
- Size: 3.5" × 5" or 4" × 6"
- Material: Matching invitation stock
- Return: Postage-paid or digital option

CONTENT STRUCTURE:

1. RESPONSE REQUEST
   - Accept/Decline options
   - Number attending
   - Response deadline

2. GUEST INFORMATION
   - Name confirmation
   - Contact details
   - Plus-one designation

3. MEAL SELECTION
   - Menu options
   - Dietary restrictions
   - Allergy notes

4. ADDITIONAL QUESTIONS
   - Session preferences
   - Dietary requirements
   - Special accommodations

DESIGN ELEMENTS:
- Matches invitation aesthetics
- Easy checkboxes/selection
- Colors: {{colors}}
- Clear writing spaces
- Return address integration

OUTPUT: RSVP card with matching envelope and digital form alternative.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'PROGRAM_BOOKLET',
    template_name: 'Master Program Booklet',
    prompt_template: `Design a comprehensive program booklet for "{{eventName}}" serving as the definitive event guide.

SPECIFICATIONS:
- Size: 5.5" × 8.5" or A5
- Pages: 8-32 pages typical
- Binding: Saddle stitch or perfect bound

CONTENT SECTIONS:

1. COVER
   - Event branding
   - Date and location
   - Theme statement

2. WELCOME MESSAGE
   - Host/organizer letter
   - Event overview
   - Thank you acknowledgments

3. SCHEDULE/AGENDA
   - Day-by-day programming
   - Time blocks
   - Track designations

4. SPEAKER PROFILES
   - Photos and bios
   - Session titles
   - Social handles

5. VENUE MAP
   - Floor plans
   - Room locations
   - Amenities marked

6. SPONSOR RECOGNITION
   - Tiered sponsor pages
   - Thank you messaging

7. NOTES SECTION
   - Lined pages for notes
   - QR codes for digital resources

DESIGN ELEMENTS:
- Colors: {{colors}}
- Consistent page layouts
- Easy navigation
- Premium production quality

OUTPUT: Complete program booklet with all page templates and print specifications.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'CERTIFICATE_AWARD',
    template_name: 'Master Certificate Design',
    prompt_template: `Design a prestigious certificate template for "{{eventName}}" recognizing attendance, achievement, or appreciation.

SPECIFICATIONS:
- Size: 8.5" × 11" or A4 standard
- Material: Premium certificate paper
- Printing: High-resolution with potential foil elements

CERTIFICATE TYPES:

1. ATTENDANCE
   - Completion recognition
   - Professional development credits
   - CEU/CPE designation

2. ACHIEVEMENT
   - Award recognition
   - Competition winners
   - Outstanding performance

3. APPRECIATION
   - Volunteer recognition
   - Speaker thank you
   - Sponsor acknowledgment

DESIGN ELEMENTS:
- Formal border design
- Event branding integration
- Colors: {{colors}}
- Signature lines
- Date and location
- Certificate numbering
- Verification QR code

PREMIUM FEATURES:
- Embossed seal placeholder
- Gold/silver foil accents
- Watermark security
- Frame-ready dimensions

OUTPUT: Certificate templates with variable data fields and print specifications.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'THANK_YOU_NOTE',
    template_name: 'Master Thank You Card',
    prompt_template: `Design heartfelt thank you cards for "{{eventName}}" expressing gratitude to attendees, sponsors, and partners.

SPECIFICATIONS:
- Size: 4" × 6" or 5" × 7"
- Format: Folded card
- Material: Premium cardstock

THANK YOU VARIANTS:

1. ATTENDEE THANKS
   - Post-event appreciation
   - Highlights and memories
   - Save-the-date for next event

2. SPONSOR THANKS
   - Partnership appreciation
   - Impact acknowledgment
   - Future collaboration invitation

3. SPEAKER THANKS
   - Contribution recognition
   - Session impact mention
   - Testimonial request

4. VOLUNTEER THANKS
   - Service appreciation
   - Hours/contribution acknowledgment
   - Community building

DESIGN ELEMENTS:
- Warm, personal aesthetic
- Colors: {{colors}}
- Event photography integration
- Handwritten-style elements
- Personal message space

OUTPUT: Thank you card series with envelope designs and message templates.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'PRESS_RELEASE',
    template_name: 'Master Press Release Template',
    prompt_template: `Design a professional press release template for "{{eventName}}" for media distribution and communications.

SPECIFICATIONS:
- Format: Letter size (8.5" × 11")
- Style: AP Style journalism standards
- Output: Digital and print-ready

CONTENT STRUCTURE:

1. HEADER
   - Event logo
   - "FOR IMMEDIATE RELEASE" or embargo date
   - Contact information

2. HEADLINE
   - Compelling, newsworthy title
   - 80 characters maximum
   - Action-oriented language

3. SUBHEADLINE
   - Supporting detail
   - Key differentiator

4. DATELINE & LEAD
   - City, date format
   - Who, what, when, where, why

5. BODY PARAGRAPHS
   - Supporting details
   - Quotes from organizers
   - Statistics and facts

6. BOILERPLATE
   - About the event/organization
   - Standard company description

7. FOOTER
   - Contact details
   - Website/social links
   - ###  end marker

DESIGN ELEMENTS:
- Colors: {{colors}} minimal use
- Professional typography
- Clean, journalistic layout
- Logo placement

OUTPUT: Press release template with writing guidelines and distribution checklist.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'MEDIA_KIT',
    template_name: 'Master Media Kit Package',
    prompt_template: `Design a comprehensive media kit for "{{eventName}}" providing press resources for coverage.

SPECIFICATIONS:
- Format: Digital PDF (print-optional)
- Pages: 4-12 pages
- Dimensions: 8.5" × 11" or A4

MEDIA KIT CONTENTS:

1. COVER PAGE
   - Event branding
   - Media kit designation
   - Key visuals

2. FACT SHEET
   - Event statistics
   - Key dates and deadlines
   - Fast facts format

3. ABOUT SECTION
   - Event description
   - History and growth
   - Mission and impact

4. KEY MESSAGING
   - Approved descriptions (50, 100, 200 words)
   - Talking points
   - Hashtags and handles

5. LEADERSHIP BIOS
   - Key organizers
   - Headshots
   - Contact information

6. ASSET DOWNLOADS
   - Logo files and usage
   - Approved photos
   - B-roll information

7. MEDIA CONTACT
   - Press contact details
   - Interview scheduling
   - Credentialing process

DESIGN ELEMENTS:
- Colors: {{colors}}
- Professional, journalistic aesthetic
- Easy-to-extract assets
- Scannable format

OUTPUT: Complete media kit with downloadable assets guide.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'SPONSOR_PACKAGE',
    template_name: 'Master Sponsorship Prospectus',
    prompt_template: `Design a compelling sponsorship package for "{{eventName}}" presenting partnership opportunities professionally.

SPECIFICATIONS:
- Format: Digital PDF and print
- Pages: 8-20 pages
- Dimensions: 8.5" × 11" or landscape

PROSPECTUS SECTIONS:

1. COVER
   - Event branding
   - "Partnership Opportunities" title
   - Key visual

2. EVENT OVERVIEW
   - Mission and vision
   - Event description
   - History and growth

3. AUDIENCE PROFILE
   - Demographics
   - Industry breakdown
   - Attendee statistics

4. REACH & IMPACT
   - Attendance numbers
   - Digital reach
   - Media coverage

5. SPONSORSHIP TIERS
   - Presenting Sponsor
   - Gold/Silver/Bronze levels
   - Custom opportunities

6. BENEFITS MATRIX
   - Tier comparison chart
   - Logo placements
   - Activation opportunities

7. PRICING
   - Investment levels
   - À la carte options
   - Early commitment incentives

8. TESTIMONIALS
   - Past sponsor quotes
   - Success stories

9. CONTACT
   - Partnership contact
   - Next steps
   - Timeline

DESIGN ELEMENTS:
- Colors: {{colors}}
- Premium, sales-ready presentation
- Visual benefits showcase
- Professional data visualization

OUTPUT: Complete sponsorship prospectus with pricing template.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'FOLDER',
    template_name: 'Master Presentation Folder',
    prompt_template: `Design a premium presentation folder for "{{eventName}}" for document distribution and gifting.

SPECIFICATIONS:
- Size: 9" × 12" standard pocket folder
- Material: Heavy cardstock (14pt minimum)
- Features: One or two pockets, business card slots

DESIGN ELEMENTS:

1. FRONT COVER
   - Event branding prominent
   - Premium aesthetic
   - Colors: {{colors}}

2. INSIDE LEFT POCKET
   - Secondary branding
   - Sponsor recognition
   - Information panel

3. INSIDE RIGHT POCKET
   - Continued branding
   - Contact information
   - Call-to-action

4. BACK COVER
   - Event details
   - Website/social handles
   - Additional branding

5. SPINE
   - Readable title
   - Logo application

POCKET CONFIGURATION:
- Standard pockets
- Business card slit
- CD/USB holder option
- Expansion pocket option

PRODUCTION:
- Die-cut score lines
- Spot UV or foil options
- Matte/gloss finishes

OUTPUT: Print-ready folder with die-cut template and specifications.`,
    variables: ['eventName', 'colors']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // CREDENTIALS & PASSES - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'VIP_BADGE',
    template_name: 'Master VIP Credential Badge',
    prompt_template: `Design a premium VIP badge for "{{eventName}}" conveying exclusivity and granting special access.

SPECIFICATIONS:
- Size: 4" × 6" or 4" × 3" (landscape)
- Material: Premium PVC, thick cardstock, or rigid plastic
- Features: Holographic elements, special finishes

VIP BADGE ELEMENTS:

1. VIP DESIGNATION
   - Prominent "VIP" or "VVIP" marking
   - Distinct from general badges
   - Gold/premium color treatment

2. GUEST INFORMATION
   - Name in premium typography
   - Title and organization
   - Photo (optional for security)

3. ACCESS LEVELS
   - All-access indicators
   - Exclusive area symbols
   - Backstage/greenroom access

4. EVENT BRANDING
   - Logo integration
   - Colors: {{colors}} premium treatment
   - Event dates

SECURITY FEATURES:
- Holographic overlay
- Sequential numbering
- QR code verification
- Tamper-evident elements

PRESENTATION:
- Premium lanyard or holder
- Velvet pouch packaging
- Personal welcome note

OUTPUT: VIP badge design with security features and packaging specifications.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'BACKSTAGE_PASS',
    template_name: 'Master Backstage Access Credential',
    prompt_template: `Design an exclusive backstage pass for "{{eventName}}" for authorized restricted-area access.

SPECIFICATIONS:
- Size: 4" × 6" vertical orientation
- Material: Durable laminate or rigid plastic
- Security: High-visibility, tamper-resistant

PASS ELEMENTS:

1. ACCESS DESIGNATION
   - "BACKSTAGE" or "ALL ACCESS" prominent
   - "AUTHORIZED PERSONNEL ONLY"
   - Color-coded access levels

2. HOLDER INFORMATION
   - Name and role
   - Photo ID section
   - Affiliation/company

3. ACCESS ZONES
   - Permitted areas listed
   - Time restrictions if applicable
   - Date validity

4. EVENT DETAILS
   - Event logo
   - Venue information
   - Colors: {{colors}}

SECURITY FEATURES:
- Holographic stamp
- Unique serial number
- QR code verification
- Security signature line

DESIGN AESTHETIC:
- Exclusive, premium feel
- Concert/event industry standard
- Clear security messaging

OUTPUT: Backstage pass with security specifications and lanyard design.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'MEDIA_CREDENTIAL',
    template_name: 'Master Media/Press Credential',
    prompt_template: `Design a professional media credential for "{{eventName}}" identifying authorized press representatives.

SPECIFICATIONS:
- Size: 4" × 6" with photo area
- Material: Laminated cardstock or PVC
- Lanyard: Distinctive "MEDIA" lanyard

CREDENTIAL ELEMENTS:

1. MEDIA DESIGNATION
   - "PRESS" or "MEDIA" prominent header
   - Color: Distinct from attendee badges
   - Industry-standard recognition

2. JOURNALIST INFORMATION
   - Name and photo
   - Media outlet
   - Role (Photographer, Reporter, etc.)

3. ACCESS PERMISSIONS
   - Photo pit access
   - Press room access
   - Interview area permissions

4. EVENT DETAILS
   - Event branding
   - Valid dates
   - Colors: {{colors}}

FUNCTIONAL ELEMENTS:
- Photo ID verification
- QR code for digital verification
- Emergency contact
- Credential number

PRESS-SPECIFIC:
- Media guidelines reference
- Embargo information
- Contact for inquiries

OUTPUT: Media credential with press guidelines and photo pit rules.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'PARKING_PASS',
    template_name: 'Master Parking Permit Design',
    prompt_template: `Design a functional parking permit for "{{eventName}}" for vehicle identification and access control.

SPECIFICATIONS:
- Size: 4" × 6" or 5" × 8" for windshield visibility
- Material: Cardstock or tear-resistant material
- Display: Rearview mirror hang or dashboard display

PERMIT ELEMENTS:

1. PARKING DESIGNATION
   - Lot assignment
   - Reserved/VIP status
   - Handicap access notation

2. EVENT IDENTIFICATION
   - Event name and logo
   - Valid dates
   - Colors: {{colors}}

3. VEHICLE INFORMATION
   - License plate space
   - Vehicle description
   - Guest name

4. INSTRUCTIONS
   - Lot location
   - Entry gate information
   - Exit procedures

SECURITY FEATURES:
- Sequential numbering
- Perforation for validation
- Holographic element
- Date stamp area

FUNCTIONAL DESIGN:
- Readable through windshield
- Reflective for evening events
- QR code for digital verification

OUTPUT: Parking permit with lot map and instruction card.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'TICKET_DESIGN',
    template_name: 'Master Event Ticket',
    prompt_template: `Design a premium event ticket for "{{eventName}}" serving as both entry credential and keepsake.

SPECIFICATIONS:
- Size: 2" × 7" standard or 4" × 8" premium
- Material: Cardstock or thermal print
- Perforation: Tear-off stub option

TICKET ELEMENTS:

1. MAIN SECTION
   - Event name and branding
   - Date: {{date}}
   - Location: {{location}}
   - Event time

2. ENTRY DETAILS
   - Seat/section/row (if applicable)
   - Ticket type (GA, VIP, etc.)
   - Gate/entrance information

3. BARCODE/QR
   - Scannable entry code
   - Unique ticket number
   - Verification integration

4. STUB (if applicable)
   - Simplified info repeat
   - Tear line
   - Guest retention portion

DESIGN ELEMENTS:
- Colors: {{colors}}
- Premium, collectible aesthetic
- Security printing elements
- Photo or graphic integration

ANTI-FRAUD:
- Unique numbering
- Holographic elements
- UV security features
- Scannable verification

OUTPUT: Event ticket design with stub and digital ticket version.`,
    variables: ['eventName', 'date', 'location', 'colors']
  },
  {
    asset_type: 'WRISTBAND_DESIGN',
    template_name: 'Master Event Wristband',
    prompt_template: `Design durable event wristbands for "{{eventName}}" for access control and attendee identification.

SPECIFICATIONS:
- Types: Tyvek, vinyl, fabric, silicone, RFID
- Width: 3/4" or 1" standard
- Length: 10" (fits most wrists with adjustment)

WRISTBAND VARIANTS:

1. GENERAL ADMISSION
   - Basic event branding
   - Single color
   - Disposable material

2. VIP
   - Premium design
   - Distinct color
   - Possibly fabric/cloth

3. MULTI-DAY
   - Color-coded by day
   - Durable material
   - Non-transferable features

4. ACCESS LEVELS
   - Color coding system
   - Zone indicators
   - Staff vs attendee distinction

DESIGN ELEMENTS:
- Event logo
- Event date
- Colors: {{colors}}
- Continuous repeat pattern
- Security features

FUNCTIONAL REQUIREMENTS:
- Tamper-evident closure
- Comfortable wear
- Water resistant
- Easy scanning (if RFID)

OUTPUT: Wristband designs by type with color-coding guide and production specs.`,
    variables: ['eventName', 'colors']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // PRESENTATIONS & CONTENT - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'PRESENTATION_SLIDE',
    template_name: 'Master Presentation Template',
    prompt_template: `Design a comprehensive presentation slide deck template for "{{eventName}}" ensuring consistent, professional speaker visuals.

SPECIFICATIONS:
- Dimensions: 1920 × 1080px (16:9 widescreen)
- Format: PowerPoint, Keynote, Google Slides compatible
- Resolution: 96 DPI for screen

SLIDE TEMPLATE LIBRARY:

1. TITLE SLIDE
   - Event and session branding
   - Speaker introduction area
   - Dramatic visual impact

2. SECTION DIVIDER
   - Bold section transitions
   - Numbered or titled sections
   - Visual breathing room

3. CONTENT SLIDES
   - Header/subheader hierarchy
   - Bullet and list layouts
   - Image + text combinations

4. DATA VISUALIZATION
   - Chart placeholder templates
   - Graph styling guides
   - Infographic frameworks

5. QUOTE SLIDE
   - Featured quote layout
   - Attribution styling
   - Visual emphasis

6. COMPARISON SLIDE
   - Side-by-side layouts
   - Before/after formats
   - Pro/con structures

7. IMAGE FEATURE
   - Full-bleed photo layouts
   - Image + caption
   - Photo gallery grids

8. CLOSING SLIDE
   - Thank you messaging
   - Q&A prompts
   - Contact information

DESIGN SYSTEM:
- Colors: {{colors}}
- Master slide consistency
- Typography hierarchy
- Animation recommendations

OUTPUT: Complete presentation template with speaker guidelines.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'AGENDA_HIGHLIGHTS',
    template_name: 'Master Agenda Display',
    prompt_template: `Design a dynamic agenda highlights display for "{{eventName}}" showcasing schedule and programming.

SPECIFICATIONS:
- Formats: Digital signage (1920×1080), print (various), web display
- Update capability: Dynamic content replacement

AGENDA DISPLAY TYPES:

1. DAILY OVERVIEW
   - Full day at-a-glance
   - Time blocks
   - Track color-coding

2. SESSION DETAIL
   - Individual session focus
   - Speaker info
   - Room location

3. NOW/NEXT
   - Current session
   - Upcoming sessions
   - Real-time updates

4. TRACKS OVERVIEW
   - Parallel track comparison
   - Color-coded differentiation
   - Easy navigation

DESIGN ELEMENTS:
- Clear time structure
- Colors: {{colors}} track coding
- Speaker headshots integration
- Room/location indicators
- Easy-to-scan layout

DIGITAL FEATURES:
- Animation-ready
- Real-time update capability
- Countdown timers
- Alert/change notifications

OUTPUT: Agenda display templates for all formats with update guidelines.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'SESSION_EVALUATION',
    template_name: 'Master Session Feedback Form',
    prompt_template: `Design an effective session evaluation form for "{{eventName}}" gathering actionable attendee feedback.

SPECIFICATIONS:
- Size: Half letter (5.5" × 8.5") or digital form
- Format: Print and digital versions
- Completion time: Under 2 minutes

EVALUATION SECTIONS:

1. SESSION IDENTIFICATION
   - Session title
   - Speaker name
   - Date and time

2. RATING SCALES
   - Content quality (1-5)
   - Speaker effectiveness (1-5)
   - Relevance to goals (1-5)
   - Would recommend (Y/N)

3. OPEN FEEDBACK
   - What was most valuable?
   - What could be improved?
   - Topics for future events

4. ATTENDEE INFO (OPTIONAL)
   - Name/contact for follow-up
   - Role/industry
   - Experience level

DESIGN ELEMENTS:
- Easy checkboxes/circles
- Adequate writing space
- Colors: {{colors}} subtle
- Quick-scan layout
- Mobile-friendly digital version

COLLECTION LOGISTICS:
- QR code for digital submission
- Collection box placement
- Incentive for completion

OUTPUT: Session evaluation with print/digital versions and analysis template.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'ANIMATED_LOGO',
    template_name: 'Master Animated Logo Sequence',
    prompt_template: `Design specifications for an animated logo for "{{eventName}}" for video, digital signage, and presentations.

ANIMATION SPECIFICATIONS:
- Duration: 3-5 seconds (intro), 2 seconds (loop)
- Resolution: 1920 × 1080px minimum
- Format: MP4, GIF, and After Effects project

ANIMATION TYPES:

1. INTRO/REVEAL
   - Logo builds or reveals
   - Brand moment emphasis
   - Sound design integration

2. LOOP
   - Subtle continuous animation
   - Background-suitable
   - Non-distracting

3. OUTRO/RESOLVE
   - Logo completion
   - Transition-ready ending
   - Tag line addition

ANIMATION APPROACHES:
- Draw-on effect
- Particle assembly
- Morphing/transformation
- Kinetic typography
- 3D rotation

DESIGN ELEMENTS:
- Colors: {{colors}} full range
- Sound design notes
- Timing specifications
- Easing recommendations

DELIVERY FORMATS:
- Video files (MP4, MOV)
- GIF for web/email
- Lottie JSON for web
- After Effects source file

OUTPUT: Animated logo storyboard with timing and motion specifications.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'COUNTDOWN_TIMER',
    template_name: 'Master Countdown Display',
    prompt_template: `Design an engaging countdown timer display for "{{eventName}}" building anticipation before the event.

SPECIFICATIONS:
- Format: Web widget, digital signage, social graphics
- Dimensions: Various (1920×1080, 1080×1080, 1080×1920)

COUNTDOWN ELEMENTS:

1. TIME DISPLAY
   - Days, hours, minutes, seconds
   - Large, readable numerals
   - Animated transitions

2. EVENT INFORMATION
   - Event name and branding
   - Date and location
   - Colors: {{colors}}

3. CALL-TO-ACTION
   - Registration link/QR
   - "Mark Your Calendar"
   - Social sharing prompts

VISUAL TREATMENTS:
- Flip clock style
- Digital display
- Analog countdown
- Minimalist modern
- Celebration-ready (confetti at zero)

APPLICATIONS:
- Website embed
- Social media stories
- Email signature
- Digital signage
- Mobile app widget

FUNCTIONALITY:
- Real-time sync
- Timezone handling
- Zero-state transition
- Milestone markers

OUTPUT: Countdown display designs with embed code specifications.`,
    variables: ['eventName', 'colors']
  },
  
  // ═══════════════════════════════════════════════════════════════
  // SPECIALTY & ENGAGEMENT - MASTER TIER
  // ═══════════════════════════════════════════════════════════════
  {
    asset_type: 'PHOTO_BOOTH_FRAME',
    template_name: 'Master Photo Booth Frame',
    prompt_template: `Design an Instagram-worthy photo booth frame for "{{eventName}}" encouraging social sharing and engagement.

SPECIFICATIONS:
- Outer dimensions: 24" × 36" or larger for groups
- Inner opening: Fits 2-4 people
- Material: Foam board, rigid plastic, or custom cut

FRAME ELEMENTS:

1. EVENT BRANDING
   - Logo prominent placement
   - Event name integration
   - Colors: {{colors}}

2. SOCIAL PROMPTS
   - Event hashtag
   - Social handles
   - Photo sharing CTAs

3. DECORATIVE ELEMENTS
   - Theme-appropriate graphics
   - Props suggestions
   - Instagram-style UI elements

4. DATE MARKER
   - Event date for keepsake
   - Location identifier
   - Year marking

FRAME STYLES:
- Instagram post format
- Polaroid style
- Custom event theme
- Elegant/formal
- Playful/whimsical

COMPANION ELEMENTS:
- Props designs
- Backdrop suggestions
- Hashtag signage

OUTPUT: Photo booth frame with props collection and backdrop recommendations.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'QR_CODE',
    template_name: 'Master Branded QR Codes',
    prompt_template: `Design a branded QR code system for "{{eventName}}" integrating codes seamlessly with event branding.

SPECIFICATIONS:
- Size: Minimum 1" × 1" for reliable scanning
- Error correction: High (25% damage tolerance)
- Color: Brand colors with sufficient contrast

QR CODE APPLICATIONS:

1. EVENT APP
   - App download links
   - iOS and Android versions
   - Platform-specific options

2. REGISTRATION/CHECK-IN
   - Ticket validation
   - Mobile check-in
   - Badge retrieval

3. INFORMATION ACCESS
   - Schedule/agenda
   - Venue maps
   - WiFi credentials

4. ENGAGEMENT
   - Session surveys
   - Social media links
   - Gamification triggers

5. CONTACT/NETWORKING
   - Digital business cards
   - LinkedIn connections
   - vCard downloads

DESIGN INTEGRATION:
- Logo integration in QR center
- Colors: {{colors}} maintaining contrast
- Custom eye shapes
- Rounded dot patterns

TESTING REQUIREMENTS:
- Multi-device scanning test
- Lighting condition testing
- Size minimum verification

OUTPUT: Branded QR code templates with implementation guidelines.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'WIFI_SIGN',
    template_name: 'Master WiFi Information Sign',
    prompt_template: `Design a clear, helpful WiFi information sign for "{{eventName}}" ensuring seamless connectivity for attendees.

SPECIFICATIONS:
- Size: 8.5" × 11" or 11" × 17"
- Placement: Registration, lounges, session rooms
- Visibility: High contrast, large text

CONTENT HIERARCHY:

1. WIFI ICON
   - Universal WiFi symbol
   - Clear identification
   - Eye-catching design

2. NETWORK NAME
   - SSID prominently displayed
   - Easy-to-read typography
   - Case-sensitive notation

3. PASSWORD
   - Clear, large password text
   - Character differentiation (0/O, 1/l)
   - QR code for auto-connect

4. INSTRUCTIONS
   - Connection steps if needed
   - Terms acceptance notes
   - Support contact

DESIGN ELEMENTS:
- Colors: {{colors}}
- Event branding (subtle)
- High contrast for readability
- Multiple language options

QR INTEGRATION:
- Auto-connect QR code
- Works with iOS/Android
- Testing verification

OUTPUT: WiFi sign with QR auto-connect and multi-size templates.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'NETWORKING_BINGO',
    template_name: 'Master Networking Bingo Card',
    prompt_template: `Design an engaging networking bingo card for "{{eventName}}" breaking the ice and encouraging attendee connections.

SPECIFICATIONS:
- Size: 5" × 7" or 8.5" × 11"
- Grid: 5×5 bingo format (25 squares)
- Material: Cardstock for durability

BINGO CONTENT STRATEGY:

1. PROFESSIONAL PROMPTS
   - "Find someone from your industry"
   - "Meet someone from a different country"
   - "Connect with a first-time attendee"

2. PERSONAL PROMPTS
   - "Find someone with the same hobby"
   - "Meet someone born in the same month"
   - "Find a fellow coffee/tea enthusiast"

3. EVENT-SPECIFIC
   - "Get a speaker's autograph"
   - "Take a photo at the event photo booth"
   - "Attend a session outside your track"

4. SOCIAL PROMPTS
   - "Exchange LinkedIn connections"
   - "Take a selfie with a new contact"
   - "Post using the event hashtag"

DESIGN ELEMENTS:
- Colors: {{colors}}
- Event branding integration
- Space for signatures/initials
- Prize information

GAMEPLAY:
- Traditional bingo rules
- Blackout option
- Prize redemption instructions

OUTPUT: Networking bingo card with rules and prize redemption system.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'EMERGENCY_GUIDE',
    template_name: 'Master Emergency Information Guide',
    prompt_template: `Design a comprehensive emergency information guide for "{{eventName}}" prioritizing attendee safety.

SPECIFICATIONS:
- Size: Pocket-sized (3.5" × 2") or badge-back sized
- Material: Durable, water-resistant
- Visibility: High contrast, easy to read under stress

EMERGENCY CONTENT:

1. EMERGENCY CONTACTS
   - 911 (or local equivalent)
   - Event security hotline
   - First aid station location
   - On-site medical personnel

2. VENUE INFORMATION
   - Full venue address
   - Cross streets
   - GPS coordinates

3. EVACUATION
   - Exit routes
   - Assembly points
   - "In case of fire" instructions

4. MEDICAL
   - First aid location
   - AED locations
   - Hospital/urgent care nearby

5. SECURITY
   - Security desk location
   - Report suspicious activity
   - Lost & found

DESIGN REQUIREMENTS:
- Universal emergency symbols
- Colors: High contrast (red, white, black)
- Minimal event branding
- Multi-language if applicable
- Event branding subtle: {{colors}}

OUTPUT: Emergency guide with universal symbols and multi-format versions.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'ACCESSIBILITY_SIGNAGE',
    template_name: 'Master Accessibility Signage System',
    prompt_template: `Design a comprehensive accessibility signage system for "{{eventName}}" ensuring inclusive navigation for all attendees.

SPECIFICATIONS:
- Compliance: ADA/AODA standards
- Mounting: Wall-mounted, freestanding, floor-level
- Features: Tactile, braille-ready designs

SIGNAGE TYPES:

1. WHEELCHAIR ACCESS
   - Accessible entrances
   - Elevator locations
   - Ramp indicators
   - Accessible seating

2. SENSORY ACCOMMODATIONS
   - Quiet rooms
   - Sign language interpreter areas
   - Assistive listening devices

3. WAYFINDING
   - Accessible routes
   - Service animal relief areas
   - Gender-neutral restrooms

4. ASSISTANCE
   - Help desk locations
   - Wheelchair lending
   - Guide services

DESIGN REQUIREMENTS:
- International accessibility symbols
   - High contrast (70% minimum)
- Tactile elements for production
- Braille translation guides
- Colors: {{colors}} with ADA contrast

COMPLIANCE CHECKLIST:
- Mounting height standards
- Character sizing minimums
- Finish (non-glare) requirements

OUTPUT: Complete accessibility signage kit with compliance guidelines.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'EVENT_APP_SPLASH',
    template_name: 'Master App Splash Screen',
    prompt_template: `Design an impactful app splash/loading screen for "{{eventName}}" mobile application.

SPECIFICATIONS:
- Dimensions: Multiple device sizes (iOS/Android)
- Duration: 1-3 seconds viewing
- Animation: Static or subtle animation

SPLASH ELEMENTS:

1. EVENT BRANDING
   - Logo centered
   - Event name
   - Colors: {{colors}}

2. VISUAL TREATMENT
   - Background pattern/imagery
   - Brand-consistent aesthetic
   - Premium quality feel

3. LOADING INDICATOR
   - Progress bar or spinner
   - Branded animation
   - Subtle, non-intrusive

4. TAGLINE (OPTIONAL)
   - Event slogan
   - Date reminder
   - Welcome message

DEVICE SPECIFICATIONS:
- iPhone: 1125×2436, 1242×2688, etc.
- Android: 1080×1920, 1440×2560, etc.
- Safe areas for all devices

ANIMATION OPTIONS:
- Logo fade-in
- Background subtle movement
- Loading progress
- Transition to home screen

OUTPUT: Splash screen set with all device sizes and animation specs.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'DIGITAL_SIGNAGE_LOOP',
    template_name: 'Master Digital Signage Content',
    prompt_template: `Design a comprehensive digital signage content loop for "{{eventName}}" for venue display screens.

SPECIFICATIONS:
- Resolution: 1920 × 1080px (landscape) or 1080 × 1920px (portrait)
- Duration: 30-60 second loops
- Format: Video/animation or slide deck

CONTENT SEGMENTS:

1. WELCOME/BRANDING (5-10s)
   - Event welcome message
   - Logo animation
   - Setting the tone

2. SCHEDULE/AGENDA (10-15s)
   - Current/upcoming sessions
   - Real-time updates
   - Room directions

3. SPONSOR RECOGNITION (5-10s)
   - Sponsor logos by tier
   - "Brought to you by" messaging
   - Rotating sponsor feature

4. ANNOUNCEMENTS (5-10s)
   - Event updates
   - Session changes
   - Special offers

5. SOCIAL FEED (10-15s)
   - Live social wall
   - Event hashtag posts
   - Photo highlights

6. ENGAGEMENT (5-10s)
   - Polls and questions
   - App download prompts
   - WiFi information

DESIGN SYSTEM:
- Colors: {{colors}}
- Consistent transitions
- Brand typography
- Animation standards

OUTPUT: Digital signage loop with content management guidelines.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'PHOTOREALISTIC_SHOT',
    template_name: 'Master Photorealistic Mockup',
    prompt_template: `Create photorealistic environmental mockup imagery for "{{eventName}}" visualizing assets in real-world context.

VISUALIZATION TYPES:

1. VENUE ENVIRONMENTS
   - Registration area mockups
   - Main stage visualization
   - Breakout room setups
   - Networking spaces

2. SIGNAGE IN CONTEXT
   - Banners in venue
   - Directional signage installed
   - Digital screens displaying content
   - Name badges being worn

3. MERCHANDISE PREVIEWS
   - T-shirts on models
   - Swag bags photographed
   - Lanyards in use
   - Premium items styled

4. DIGITAL APPLICATIONS
   - Website on devices
   - App on smartphones
   - Email on screens
   - Social posts in feeds

QUALITY SPECIFICATIONS:
- Photorealistic rendering
- Proper lighting and shadows
- Contextual environment
- Colors: {{colors}} accurate representation

PURPOSES:
- Sponsor presentations
- Vendor specifications
- Internal approvals
- Marketing materials

OUTPUT: Photorealistic mockup collection with context descriptions.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'FLOOR_PLAN',
    template_name: 'Master Venue Floor Plan',
    prompt_template: `Design a clear, functional floor plan for "{{eventName}}" at {{location}} enabling effective attendee navigation.

FLOOR PLAN ELEMENTS:

1. VENUE LAYOUT
   - Accurate room positions
   - Hallways and pathways
   - Entry/exit points
   - Scale indicator

2. ROOM IDENTIFICATION
   - Session rooms labeled
   - Capacity indicators
   - Track color coding

3. AMENITIES
   - Restrooms marked
   - Food/beverage areas
   - Registration desk
   - Information points

4. ACCESSIBILITY
   - Wheelchair routes
   - Elevator locations
   - Accessible entrances

5. EMERGENCY
   - Exit routes
   - Fire extinguishers
   - AED locations
   - Assembly points

DESIGN ELEMENTS:
- Colors: {{colors}} for zone coding
- Clear legend/key
- North orientation
- Scale reference
- "You Are Here" markers

OUTPUT FORMATS:
- Large print (poster size)
- Badge insert size
- Digital interactive version
- App integration ready

OUTPUT: Floor plan with legend and multi-format versions.`,
    variables: ['eventName', 'location', 'colors']
  },
  {
    asset_type: 'VIDEO_TEASER',
    template_name: 'Master Video Teaser Storyboard',
    prompt_template: `Design a compelling video teaser storyboard for "{{eventName}}" building anticipation and driving registration.

VIDEO SPECIFICATIONS:
- Duration: 30-60 seconds
- Aspect ratios: 16:9, 9:16, 1:1 versions
- Resolution: 4K master, 1080p deliverables

STORYBOARD STRUCTURE:

1. HOOK (0-5s)
   - Attention-grabbing opener
   - Emotional or visual hook
   - Event hint

2. PROBLEM/OPPORTUNITY (5-15s)
   - Why this event matters
   - Industry challenges
   - Opportunity presented

3. SOLUTION/VALUE (15-30s)
   - What attendees will gain
   - Key highlights
   - Speaker/session previews

4. PROOF/CREDIBILITY (30-40s)
   - Past event footage
   - Testimonials
   - Statistics

5. CALL-TO-ACTION (40-60s)
   - Registration prompt
   - Date and location
   - Website/QR code

PRODUCTION ELEMENTS:
- Music/sound design notes
- Voiceover script
- Motion graphics style
- Colors: {{colors}}
- Brand integration

OUTPUT: Video teaser storyboard with shot list and production guide.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'VOLUNTEER_VEST',
    template_name: 'Master Volunteer Identification',
    prompt_template: `Design visible volunteer identification for "{{eventName}}" enabling easy attendee-to-volunteer identification.

VEST SPECIFICATIONS:
- Type: Safety vest, polo shirt, or t-shirt with overlay
- Color: High-visibility (not conflicting with emergency services)
- Size range: S-3XL

DESIGN ELEMENTS:

1. VOLUNTEER IDENTIFICATION
   - "VOLUNTEER" or "STAFF" prominently
   - Front and back visibility
   - Multiple languages if needed

2. EVENT BRANDING
   - Logo placement
   - Colors: {{colors}} accent use
   - Event dates

3. ROLE IDENTIFICATION
   - Role patches or ribbons
   - Department indicators
   - Team color coding

4. FUNCTIONAL ELEMENTS
   - Name tag holder
   - Credential clip
   - Pocket for essentials

VISIBILITY REQUIREMENTS:
- Visible from 50+ feet
- Works in varied lighting
- Distinct from attendee clothing
- Photographically identifiable

VARIATIONS:
- General volunteer
- Team lead
- Security assist
- Information desk

OUTPUT: Volunteer vest designs with role identification system.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'SECURITY_BADGE',
    template_name: 'Master Security Credential',
    prompt_template: `Design a professional security credential for "{{eventName}}" for authorized security personnel.

BADGE SPECIFICATIONS:
- Size: 4" × 6" (larger than standard badges)
- Material: Rigid, durable with photo
- Lanyard: Distinctive security color

SECURITY ELEMENTS:

1. SECURITY DESIGNATION
   - "SECURITY" prominently displayed
   - Authority indicators
   - Access level designation

2. PERSONNEL INFORMATION
   - Photo ID
   - Name
   - Company/agency
   - Badge number

3. ACCESS PERMISSIONS
   - All-access or zone-specific
   - Valid dates
   - Shift information

4. VERIFICATION
   - QR code for verification
   - Holographic security
   - Tamper-evident features

DESIGN REQUIREMENTS:
- High visibility
- Professional appearance
- Colors: Security-standard with {{colors}} accents
- Emergency contact information

ACCOUNTABILITY:
- Unique numbering
   - Issue tracking
- Return requirements

OUTPUT: Security badge with verification system and issue log.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'GLASS_DOOR',
    template_name: 'Master Glass Door Graphics',
    prompt_template: `Design elegant glass door graphics for "{{eventName}}" venue entrance and room identification.

SPECIFICATIONS:
- Material: Frosted vinyl, clear vinyl, or window cling
- Coverage: Full door, half door, or accent strips
- Removal: Easy removal post-event

DESIGN APPLICATIONS:

1. MAIN ENTRANCE
   - Event welcome messaging
   - Logo and branding
   - Push/pull indicators

2. CONFERENCE ROOMS
   - Room identification
   - Session in progress
   - Privacy frosting

3. OFFICE/BACK AREAS
   - Staff only indicators
   - VIP/restricted areas
   - Functional messaging

DESIGN ELEMENTS:
- Frosted privacy patterns
- Logo integration
- Colors: {{colors}}
- See-through or full coverage options
- Day/night visibility

SAFETY REQUIREMENTS:
- Visibility strips for glass doors
- ADA compliance indicators
- Emergency exit clarity

OUTPUT: Glass door graphics with installation specifications.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'GLASS_ROTATING_DOOR',
    template_name: 'Master Rotating Door Graphics',
    prompt_template: `Design impactful rotating door graphics for "{{eventName}}" creating a branded entrance experience.

SPECIFICATIONS:
- Door configuration: 3-wing or 4-wing rotating door
- Panel size: Varies by door manufacturer
- Material: Static cling or low-tack adhesive

DESIGN CONSIDERATIONS:
- 360° rotation viewing
- Multiple panels create animation effect
- Entry/exit appropriate messaging
- Safety compliance

GRAPHIC ZONES:
1. Upper panels (above eye level)
2. Eye-level zone (primary messaging)
3. Lower panels (caution/safety)

DESIGN ELEMENTS:
- Sequential graphics across panels
- Brand reveal as door rotates
- Colors: {{colors}}
- Motion-implied design

SAFETY REQUIREMENTS:
- Movement warning graphics
- Accessible entrance direction
- Clear path indicators

OUTPUT: Rotating door graphics with panel sequence and installation guide.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'GLASS_DOUBLE_DOOR',
    template_name: 'Master Double Door Graphics',
    prompt_template: `Design coordinated double door graphics for "{{eventName}}" venue entrances.

SPECIFICATIONS:
- Configuration: Split design across two doors
- Alignment: Perfect match when doors are closed
- Open position: Each door works independently

DESIGN APPROACHES:

1. SPLIT LOGO
   - Logo divides across doors
   - Reveals when doors close
   - Creates dramatic entrance

2. MIRROR DESIGN
   - Symmetrical patterns
   - Works open or closed
   - Balanced visual weight

3. CONTINUOUS PATTERN
   - Pattern flows across both doors
   - Seamless when closed
   - Repeating when open

4. COMPLEMENTARY
   - Different but related designs
   - Entry/exit messaging
   - Push/pull coordination

DESIGN ELEMENTS:
- Colors: {{colors}}
- Handle/hardware clearance
- Hinge-side considerations
- ADA push/pull indicators

OUTPUT: Double door graphics with open/closed state mockups.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'SEATING_CHART',
    template_name: 'Master Seating Chart Display',
    prompt_template: `Design a clear, elegant seating chart for "{{eventName}}" directing guests to their assigned seating.

SPECIFICATIONS:
- Size: Large format (24"×36" or larger)
- Display: Easel, wall-mounted, or digital
- Format: Alphabetical or table-based organization

SEATING CHART TYPES:

1. ALPHABETICAL GUEST LIST
   - Last name organization
   - Table number assignment
   - Easy lookup format

2. TABLE MAP
   - Visual venue layout
   - Table positions shown
   - Guest names by table

3. HYBRID
   - Alphabetical list with map reference
   - Color-coded sections
   - Multiple lookup methods

DESIGN ELEMENTS:
- Clear typography hierarchy
- Colors: {{colors}}
- Event branding integration
- Elegant aesthetic
- Easy updates (for late RSVPs)

DIGITAL VERSION:
- Search functionality
- Touch/interactive capability
- Real-time updates

OUTPUT: Seating chart with template for guest data and display options.`,
    variables: ['eventName', 'colors']
  },
  {
    asset_type: 'MARKETING_COPY',
    template_name: 'Master Marketing Copy Library',
    prompt_template: `Develop a comprehensive marketing copy library for "{{eventName}}" ensuring consistent messaging across all channels.

COPY CATEGORIES:

1. EVENT DESCRIPTIONS
   - 25-word elevator pitch
   - 50-word summary
   - 100-word overview
   - 250-word detailed description

2. VALUE PROPOSITIONS
   - Why attend (5 reasons)
   - Key benefits
   - Transformation statements
   - FOMO messaging

3. SPEAKER/SESSION COPY
   - Speaker introduction templates
   - Session description format
   - Track overviews
   - Keynote highlights

4. EMAIL SEQUENCES
   - Save the date
   - Early bird announcement
   - Registration reminder
   - Last chance messaging
   - Confirmation/welcome
   - Pre-event excitement
   - Post-event thank you

5. SOCIAL MEDIA
   - Platform-specific posts
   - Countdown series
   - Speaker announcements
   - Behind-the-scenes
   - User-generated content prompts

6. ADVERTISING
   - Headline options
   - Display ad copy
   - Search ad variations
   - Retargeting messaging

VOICE & TONE:
- Brand voice guidelines
- Channel-specific adjustments
- Industry terminology

OUTPUT: Complete copy library with templates and usage guidelines.`,
    variables: ['eventName']
  },
  {
    asset_type: 'RUN_OF_SHOW',
    template_name: 'Master Run of Show Document',
    prompt_template: `Design a professional run of show document template for "{{eventName}}" enabling flawless event execution.

DOCUMENT SPECIFICATIONS:
- Format: Spreadsheet and print-ready
- Detail level: Minute-by-minute
- Distribution: Production team, speakers, AV

RUN OF SHOW SECTIONS:

1. HEADER INFORMATION
   - Event name and date
   - Venue and room
   - Key contacts
   - Version/update tracking

2. TIME COLUMNS
   - Start time
   - End time
   - Duration
   - Running time

3. CONTENT COLUMNS
   - Activity/segment
   - Speaker/presenter
   - Notes/script cues
   - Technical requirements

4. PRODUCTION COLUMNS
   - Audio cues
   - Video/graphics cues
   - Lighting cues
   - Stage management notes

5. PERSONNEL COLUMNS
   - Responsible party
   - Backup contact
   - Status tracking

DESIGN ELEMENTS:
- Clear row differentiation
   - Color coding by segment type
- Time markers
- Page breaks for sections
- Colors: {{colors}} subtle

OUTPUT: Run of show template with example content and usage guide.`,
    variables: ['eventName', 'colors']
  },
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === 'seed') {
      // Delete existing system templates before seeding
      const { error: deleteError } = await supabase
        .from('prompt_templates')
        .delete()
        .eq('is_system', true);

      if (deleteError) {
        console.error('Delete error:', deleteError);
      }

      // Insert all master prompts
      const toInsert = MASTER_PROMPTS.map(t => ({
        asset_type: t.asset_type,
        template_name: t.template_name,
        prompt_template: t.prompt_template,
        variables: t.variables,
        is_system: true,
        created_by: userId,
        usage_count: 0,
        success_rate: 1.0
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
          message: `Seeded ${MASTER_PROMPTS.length} master-level templates covering all asset types`,
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
