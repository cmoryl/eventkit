import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  engineId?: string;
  provider: string;
  apiKey?: string;
  config?: Record<string, unknown>;
  prompt: string;
  context?: {
    logoBase64?: string;
    vibeImageBase64?: string;
    masterPatternBase64?: string;
    dimensions?: { width: number; height: number };
  };
  test?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: GenerateRequest = await req.json();
    const { provider, apiKey, config, prompt, context, test } = body;

    console.log(`Generate with engine: ${provider}, test: ${test}`);

    // For test mode, just validate the API key format
    if (test) {
      if (provider !== 'lovable' && !apiKey) {
        return new Response(
          JSON.stringify({ error: "API key is required for this provider" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ success: true, message: "Connection validated" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let imageUrl: string | null = null;

    switch (provider) {
      case 'lovable':
        imageUrl = await generateWithLovable(prompt, context);
        break;
      case 'openai':
        imageUrl = await generateWithOpenAI(apiKey!, prompt, config);
        break;
      case 'stability':
        imageUrl = await generateWithStability(apiKey!, prompt, config);
        break;
      case 'replicate':
        imageUrl = await generateWithReplicate(apiKey!, prompt, config);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    if (!imageUrl) {
      throw new Error("Failed to generate image");
    }

    return new Response(
      JSON.stringify({ success: true, imageUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-with-engine error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Generate using Lovable AI (built-in)
async function generateWithLovable(
  prompt: string,
  context?: GenerateRequest['context']
): Promise<string | null> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const messages: Array<{ role: string; content: unknown }> = [
    { role: "user", content: prompt }
  ];

  // Add reference images if provided
  if (context?.logoBase64 || context?.vibeImageBase64) {
    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: "text", text: prompt }
    ];
    
    if (context.logoBase64) {
      content.push({ type: "image_url", image_url: { url: context.logoBase64 } });
    }
    if (context.vibeImageBase64) {
      content.push({ type: "image_url", image_url: { url: context.vibeImageBase64 } });
    }
    
    messages[0].content = content;
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages,
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Lovable AI error:", response.status, errorText);
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
}

// Generate using OpenAI DALL-E
async function generateWithOpenAI(
  apiKey: string,
  prompt: string,
  config?: Record<string, unknown>
): Promise<string | null> {
  const model = (config?.model as string) || "dall-e-3";
  const quality = (config?.quality as string) || "standard";
  const size = (config?.size as string) || "1024x1024";

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size,
      quality,
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI error:", response.status, errorText);
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  return b64 ? `data:image/png;base64,${b64}` : null;
}

// Generate using Stability AI
async function generateWithStability(
  apiKey: string,
  prompt: string,
  config?: Record<string, unknown>
): Promise<string | null> {
  const engineId = (config?.model as string) || "stable-diffusion-xl-1024-v1-0";
  
  const response = await fetch(`https://api.stability.ai/v1/generation/${engineId}/text-to-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: (config?.guidanceScale as number) || 7,
      steps: (config?.steps as number) || 30,
      samples: 1,
      width: 1024,
      height: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Stability error:", response.status, errorText);
    throw new Error(`Stability error: ${response.status}`);
  }

  const data = await response.json();
  const b64 = data.artifacts?.[0]?.base64;
  return b64 ? `data:image/png;base64,${b64}` : null;
}

// Generate using Replicate
async function generateWithReplicate(
  apiKey: string,
  prompt: string,
  config?: Record<string, unknown>
): Promise<string | null> {
  const model = (config?.model as string) || "black-forest-labs/flux-schnell";

  // Start prediction
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: model,
      input: {
        prompt,
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "png",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Replicate error:", response.status, errorText);
    throw new Error(`Replicate error: ${response.status}`);
  }

  const prediction = await response.json();
  
  // Poll for completion
  let result = prediction;
  while (result.status !== "succeeded" && result.status !== "failed") {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pollResponse = await fetch(result.urls.get, {
      headers: { Authorization: `Token ${apiKey}` },
    });
    result = await pollResponse.json();
  }

  if (result.status === "failed") {
    throw new Error("Replicate generation failed");
  }

  return result.output?.[0] || null;
}
