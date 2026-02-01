import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, asset_type, context } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert at crafting prompts for AI image generation, specifically for event design assets.
    
Your task is to refine and improve the given prompt to produce better, more professional results.

Guidelines:
1. Be specific about visual elements (colors, composition, typography placement)
2. Include style keywords that work well with image generators
3. Specify aspect ratio considerations for the asset type
4. Add professional quality markers like "high resolution", "print ready"
5. Include negative prompt concepts inline (what to avoid)
6. Keep the core intent but enhance with professional design language
7. For event assets, emphasize brand consistency and readability

Asset type: ${asset_type || 'general'}
Context: ${context || 'event design'}

Return ONLY the refined prompt, no explanations.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Refine this prompt for better image generation:\n\n${prompt}` }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to refine prompt');
    }

    const data = await response.json();
    const refinedPrompt = data.choices?.[0]?.message?.content?.trim();

    if (!refinedPrompt) {
      throw new Error('No refined prompt returned');
    }

    return new Response(
      JSON.stringify({ refined_prompt: refinedPrompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Prompt refinement error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to refine prompt' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
