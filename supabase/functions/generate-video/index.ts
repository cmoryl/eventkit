import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateVideoRequest {
  eventName: string;
  eventDescription?: string;
  styleDescription?: string;
  duration?: number;
  aspectRatio?: string;
  resolution?: string;
  startingFrameBase64?: string;
  provider?: 'lovable' | 'replicate';
  apiKey?: string;
}

interface VideoGenerationResult {
  videoUrl: string | null;
  thumbnailUrl: string | null;
  isAnimatedPreview: boolean;
}

// Replicate model versions (must use owner/model:version format)
const REPLICATE_MODELS = {
  'luma-ray': 'luma/ray:9cfe3fa4cf95d8c3e8e6a3f20ca1d93cbe1a6ff3e3a7bb3e94cf5c3c3b8a2a1d',
  'minimax': 'minimax/video-01:9e8b1d3c4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
} as const;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: GenerateVideoRequest = await req.json();
    
    // Input validation
    const validationError = validateInput(body);
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { 
      eventName, 
      eventDescription, 
      styleDescription, 
      duration = 5, 
      aspectRatio = "16:9",
      resolution = "1080p",
      startingFrameBase64,
      provider = 'lovable',
      apiKey
    } = body;

    console.log(`Generating video with ${provider} for: ${eventName}, duration: ${duration}s, ${aspectRatio}, hasStartingFrame: ${!!startingFrameBase64}`);

    // Build appropriate prompt based on whether we have a starting frame
    const prompt = startingFrameBase64
      ? buildImageToVideoPrompt(eventName, eventDescription, styleDescription, duration)
      : buildTextToVideoPrompt(eventName, eventDescription, styleDescription, duration);

    let result: VideoGenerationResult;

    if (provider === 'replicate' && apiKey) {
      // Use Replicate for full video generation
      result = await generateWithReplicate(apiKey, prompt, duration, aspectRatio, startingFrameBase64);
    } else {
      // Use Lovable AI for animated preview (Gemini image generation)
      result = await generateWithLovableAI(LOVABLE_API_KEY, prompt, aspectRatio, startingFrameBase64);
    }

    if (!result.videoUrl && !result.thumbnailUrl) {
      throw new Error("Failed to generate video content");
    }

    console.log("Successfully generated:", { 
      hasVideo: !!result.videoUrl, 
      hasThumbnail: !!result.thumbnailUrl,
      isAnimatedPreview: result.isAnimatedPreview 
    });

    // Build response message based on what was generated
    let message: string;
    let videoStatus: string;
    
    if (result.videoUrl) {
      message = "Video generated successfully!";
      videoStatus = "complete";
    } else if (result.isAnimatedPreview) {
      message = "Animated preview generated. For full video, use Replicate with an API key.";
      videoStatus = "preview";
    } else {
      message = "Video thumbnail generated.";
      videoStatus = "thumbnail";
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        videoUrl: result.videoUrl,
        thumbnailUrl: result.thumbnailUrl,
        message,
        videoStatus,
        isAnimatedPreview: result.isAnimatedPreview,
        duration,
        aspectRatio,
        provider,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-video error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Handle specific error types
    if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (errorMessage.includes("402") || errorMessage.includes("credits")) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function validateInput(body: GenerateVideoRequest): string | null {
  if (!body.eventName || body.eventName.trim().length === 0) {
    return "Event name is required";
  }
  if (body.eventName.length > 200) {
    return "Event name must be less than 200 characters";
  }
  if (body.duration && (body.duration < 3 || body.duration > 15)) {
    return "Duration must be between 3 and 15 seconds";
  }
  if (body.aspectRatio && !['16:9', '9:16', '1:1', '4:3', '3:4'].includes(body.aspectRatio)) {
    return "Invalid aspect ratio";
  }
  if (body.resolution && !['480p', '720p', '1080p'].includes(body.resolution)) {
    return "Invalid resolution";
  }
  if (body.provider === 'replicate' && !body.apiKey) {
    return "Replicate API key is required for Replicate provider";
  }
  return null;
}

function buildTextToVideoPrompt(
  eventName: string, 
  eventDescription?: string, 
  styleDescription?: string,
  duration?: number
): string {
  let prompt = `Create a cinematic promotional video teaser for "${eventName}".`;
  
  if (eventDescription) {
    prompt += ` Event theme: ${eventDescription}.`;
  }
  
  if (styleDescription) {
    prompt += ` Visual style: ${styleDescription}.`;
  } else {
    prompt += ` Style: Modern, professional event marketing with high production value.`;
  }
  
  prompt += `

The video should:
- Open with an attention-grabbing visual hook
- Include dynamic camera movements (slow zoom, elegant pan, smooth dolly)
- Have cinematic lighting with professional color grading
- Create excitement and anticipation for the event
- Be suitable for social media marketing
- Duration: approximately ${duration} seconds

Visual elements: Abstract motion graphics, elegant typography reveals, smooth transitions, premium aesthetic. Ultra high quality, 4K cinematic look.`;

  return prompt;
}

function buildImageToVideoPrompt(
  eventName: string, 
  eventDescription?: string, 
  styleDescription?: string,
  duration?: number
): string {
  let prompt = `Animate this image into a ${duration}-second video for "${eventName}".`;
  
  if (eventDescription) {
    prompt += ` Event context: ${eventDescription}.`;
  }
  
  if (styleDescription) {
    prompt += ` Animation style: ${styleDescription}.`;
  } else {
    prompt += ` Animation style: Subtle, elegant motion that brings the image to life.`;
  }
  
  prompt += `

Animation suggestions:
- Gentle parallax movement creating depth
- Subtle zoom or pan across the image
- Floating particles or light effects
- Smooth breathing/pulsing motion on key elements
- Professional, refined movement that enhances the design

Keep the original image composition intact while adding cinematic motion. The animation should feel premium and polished, suitable for event marketing.`;

  return prompt;
}

// Generate animated preview using Lovable AI (Gemini image generation)
// Note: This generates a high-quality still frame, not actual video
async function generateWithLovableAI(
  apiKey: string,
  prompt: string,
  aspectRatio: string,
  startingFrameBase64?: string
): Promise<VideoGenerationResult> {
  
  // Adjust prompt for image generation
  const imagePrompt = startingFrameBase64
    ? `Create a visually enhanced version of this image that suggests motion and animation. ${prompt}`
    : `Create a stunning cinematic key frame/hero image. ${prompt} Ultra high resolution, 4K quality, cinematic ${aspectRatio} aspect ratio.`;

  const messageContent = startingFrameBase64 
    ? [
        { type: "text", text: imagePrompt },
        { type: "image_url", image_url: { url: startingFrameBase64 } }
      ]
    : imagePrompt;

  const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image-preview",
      messages: [{ role: "user", content: messageContent }],
      modalities: ["image", "text"],
    }),
  });

  if (!imageResponse.ok) {
    const errorText = await imageResponse.text();
    console.error("Lovable AI image generation failed:", imageResponse.status, errorText);
    throw new Error(`Image generation failed: ${imageResponse.status}`);
  }

  const imageData = await imageResponse.json();
  const thumbnailUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

  return {
    videoUrl: null,
    thumbnailUrl: thumbnailUrl || null,
    isAnimatedPreview: true, // Flag that this is a preview, not real video
  };
}

// Generate actual video using Replicate
async function generateWithReplicate(
  apiKey: string,
  prompt: string,
  duration: number,
  aspectRatio: string,
  startingFrameBase64?: string
): Promise<VideoGenerationResult> {
  
  // Select model based on whether we have a starting frame
  const modelKey = startingFrameBase64 ? 'luma-ray' : 'minimax';
  
  // Build input based on model requirements
  const input: Record<string, unknown> = {
    prompt,
  };

  // Different models have different input formats
  if (startingFrameBase64) {
    // Luma Ray image-to-video
    input.image = startingFrameBase64;
    input.aspect_ratio = aspectRatio;
  } else {
    // Minimax text-to-video
    input.prompt_optimizer = true;
  }

  try {
    // Create prediction using the models endpoint (more reliable)
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Prefer": "wait", // Try to get result immediately if fast enough
      },
      body: JSON.stringify({
        model: modelKey === 'luma-ray' ? 'luma/ray' : 'minimax/video-01',
        input,
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Replicate create failed:", createResponse.status, errorText);
      
      // Parse error for better messages
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          throw new Error(`Replicate: ${errorJson.detail}`);
        }
      } catch {
        // Use status-based message
      }
      
      if (createResponse.status === 401) {
        throw new Error("Invalid Replicate API key");
      }
      if (createResponse.status === 402) {
        throw new Error("Replicate account requires payment");
      }
      
      throw new Error(`Replicate error: ${createResponse.status}`);
    }

    const prediction = await createResponse.json();
    console.log("Replicate prediction created:", prediction.id, "status:", prediction.status);

    // If prediction is already complete (fast models or cached)
    if (prediction.status === "succeeded" && prediction.output) {
      const videoUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
      return {
        videoUrl,
        thumbnailUrl: null,
        isAnimatedPreview: false,
      };
    }

    // Poll for completion (with timeout)
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;
    let result = prediction;

    while (result.status !== "succeeded" && result.status !== "failed" && result.status !== "canceled" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      
      if (!statusResponse.ok) {
        console.error("Replicate status check failed:", statusResponse.status);
        break;
      }
      
      result = await statusResponse.json();
      attempts++;
      console.log(`Replicate poll ${attempts}: ${result.status}`);
    }

    if (result.status === "succeeded" && result.output) {
      const videoUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      return {
        videoUrl,
        thumbnailUrl: null,
        isAnimatedPreview: false,
      };
    }

    if (result.status === "failed") {
      throw new Error(`Video generation failed: ${result.error || 'Unknown error'}`);
    }

    if (result.status === "canceled") {
      throw new Error("Video generation was canceled");
    }

    throw new Error(`Video generation timed out after ${attempts * 5} seconds`);
  } catch (error) {
    console.error("Replicate video generation failed:", error);
    throw error;
  }
}
