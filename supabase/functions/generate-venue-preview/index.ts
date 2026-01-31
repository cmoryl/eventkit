import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SpecificAsset {
  title: string;
  type: string;
  imageUrl: string;
  placement: 'signage' | 'banner' | 'counter' | 'environmental' | 'digital' | 'auto';
}

interface VenuePreviewRequest {
  venueFrameBase64: string; // Key frame from venue walkthrough
  eventName: string;
  eventDescription?: string;
  brandElements?: {
    type: 'signage' | 'banner' | 'counter' | 'environmental' | 'digital';
    description: string;
    colorPalette?: string[];
  }[];
  specificAssets?: SpecificAsset[];
  styleDescription?: string;
  duration?: 5 | 10;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: VenuePreviewRequest = await req.json();
    const { 
      venueFrameBase64, 
      eventName, 
      eventDescription,
      brandElements,
      specificAssets,
      styleDescription,
      duration = 5
    } = body;

    if (!venueFrameBase64) {
      return new Response(
        JSON.stringify({ error: "Venue frame image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build prompt based on whether we have specific assets or generic elements
    let prompt: string;

    if (specificAssets && specificAssets.length > 0) {
      // Build prompt for specific generated assets
      const assetDescriptions = specificAssets.map(asset => {
        const placementHint = asset.placement === 'auto' 
          ? 'in the most appropriate location' 
          : `as ${asset.placement} element`;
        return `- "${asset.title}" (${asset.type.replace(/_/g, ' ').toLowerCase()}) - place ${placementHint}`;
      }).join('\n');

      prompt = `Transform this venue into a professionally branded event space for "${eventName}" by placing SPECIFIC event assets into the scene.

EVENT: ${eventName}
${eventDescription ? `DESCRIPTION: ${eventDescription}` : ''}
${styleDescription ? `STYLE: ${styleDescription}` : ''}

PLACE THESE SPECIFIC ASSETS INTO THE VENUE:
${assetDescriptions}

CRITICAL REQUIREMENTS:
- Each asset listed above is a REAL design that must be visible and recognizable in the final image
- Place banners and signage on walls, stands, or appropriate surfaces
- Place counter graphics on registration desks or kiosks
- Environmental graphics should wrap pillars, floors, or walls
- Digital assets should appear on screens or digital displays
- Maintain perspective and scale appropriate to the venue
- Apply realistic lighting and shadows to make assets look naturally placed
- The designs should be clearly visible and readable
- Keep the original venue architecture intact
- Make it feel like a real, professionally set up event space`;
    } else if (brandElements && brandElements.length > 0) {
      // Build prompt for generic brand elements (original behavior)
      const brandElementsList = brandElements.map(el => {
        const colorInfo = el.colorPalette?.length 
          ? ` using ${el.colorPalette.slice(0, 3).join(', ')} color scheme`
          : '';
        return `- ${el.type}: ${el.description}${colorInfo}`;
      }).join('\n');

      prompt = `Transform this venue into a professionally branded event space for "${eventName}".

EVENT: ${eventName}
${eventDescription ? `DESCRIPTION: ${eventDescription}` : ''}
${styleDescription ? `STYLE: ${styleDescription}` : ''}

ADD THESE BRANDED ELEMENTS TO THE SPACE:
${brandElementsList}

REQUIREMENTS:
- Maintain the original venue architecture and layout
- Add realistic branded signage, banners, and displays
- Include digital screens showing event content
- Add registration/welcome counter with branding
- Environmental branding on walls, floors, pillars
- Professional event lighting effects
- Subtle camera movement showing the branded space
- Photorealistic quality with proper lighting and shadows
- Make it feel like a real, high-end corporate/professional event`;
    } else {
      return new Response(
        JSON.stringify({ error: "Either brandElements or specificAssets must be provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Generating branded venue preview video...');
    console.log('Prompt:', prompt.substring(0, 200) + '...');

    // Build the message content with venue frame and optionally specific asset images
    const messageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: "text", text: prompt },
      {
        type: "image_url",
        image_url: {
          url: venueFrameBase64.startsWith('data:') 
            ? venueFrameBase64 
            : `data:image/jpeg;base64,${venueFrameBase64}`
        }
      }
    ];

    // Add specific asset images if provided
    if (specificAssets && specificAssets.length > 0) {
      for (const asset of specificAssets.slice(0, 4)) { // Limit to 4 assets for context window
        if (asset.imageUrl) {
          messageContent.push({
            type: "image_url",
            image_url: { url: asset.imageUrl }
          });
        }
      }
    }

    // First, generate a branded image using image model
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: messageContent
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error("Image generation error:", imageResponse.status, errorText);
      
      if (imageResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate branded venue image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageData = await imageResponse.json();
    const brandedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!brandedImage) {
      console.error("No image generated");
      return new Response(
        JSON.stringify({ error: "Failed to generate branded image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Branded image generated, now creating video...');

    // Now generate video from the branded image
    const videoPrompt = `Smooth cinematic walkthrough of this branded event venue. 
Gentle camera movement panning across the space, showcasing the professional event branding, 
signage, banners, and displays. Professional corporate event atmosphere with ambient lighting.
Slow, elegant camera motion. High production value.`;

    const videoResponse = await fetch("https://ai.gateway.lovable.dev/v1/video/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: videoPrompt,
        image: brandedImage,
        duration,
        aspect_ratio: "16:9",
        resolution: "1080p",
      }),
    });

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text();
      console.error("Video generation error:", videoResponse.status, errorText);
      
      // If video generation fails, return the branded image as fallback
      return new Response(
        JSON.stringify({ 
          success: true,
          type: 'image',
          imageUrl: brandedImage,
          message: "Video generation unavailable, returning branded image preview"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const videoData = await videoResponse.json();
    
    return new Response(
      JSON.stringify({ 
        success: true,
        type: 'video',
        videoUrl: videoData.url || videoData.video_url,
        thumbnailUrl: brandedImage,
        duration
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-venue-preview:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
