import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VenuePreviewRequest {
  venueFrameBase64: string; // Key frame from venue walkthrough
  eventName: string;
  eventDescription?: string;
  brandElements: {
    type: 'signage' | 'banner' | 'counter' | 'environmental' | 'digital';
    description: string;
    colorPalette?: string[];
  }[];
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

    // Build descriptive prompt for branded venue visualization
    const brandElementsList = brandElements.map(el => {
      const colorInfo = el.colorPalette?.length 
        ? ` using ${el.colorPalette.slice(0, 3).join(', ')} color scheme`
        : '';
      return `- ${el.type}: ${el.description}${colorInfo}`;
    }).join('\n');

    const prompt = `Transform this venue into a professionally branded event space for "${eventName}".

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

    console.log('Generating branded venue preview video...');
    console.log('Prompt:', prompt.substring(0, 200) + '...');

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
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: venueFrameBase64.startsWith('data:') 
                    ? venueFrameBase64 
                    : `data:image/jpeg;base64,${venueFrameBase64}`
                }
              }
            ]
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
