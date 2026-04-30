// Generates a single decorative graphic for a slide using Lovable AI's
// Nano Banana image model. Returns a base64 data URL the client can drop
// straight into a <img> or background-image.
//
// The prompt is constructed server-side to enforce visual consistency with
// the slide's palette: dark background, neon line work, transparent-friendly
// composition, no text, no logos.

import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  /** What the user wants to see — e.g. "an isometric orbit diagram" */
  prompt: string;
  /** Hex colors that should dominate the graphic (background, accent, secondary). */
  palette?: { bg?: string; accent?: string; secondary?: string };
  /** "icon" (square, simple) | "scene" (more detail). Default "icon". */
  style?: 'icon' | 'scene';
}

const MODEL = 'google/gemini-2.5-flash-image';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) throw new Error('LOVABLE_API_KEY not configured');

    const body = (await req.json()) as RequestBody;
    if (!body.prompt || typeof body.prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const bg = body.palette?.bg || '#03002C';
    const accent = body.palette?.accent || '#A1F9F9';
    const secondary = body.palette?.secondary || '#C2A3FF';
    const styleHint = body.style === 'scene'
      ? 'Detailed editorial illustration, slight depth and glow, still very minimal.'
      : 'Flat technical diagram, line-art with sparse fills, like a heads-up-display element.';

    const fullPrompt = `Create a single decorative graphic for a presentation slide.

Subject: ${body.prompt.trim()}

Visual rules (must follow exactly):
- Solid dark background, color ${bg}.
- Primary line/accent color ${accent} (neon, glowing).
- Secondary accent color ${secondary} used sparingly.
- ${styleHint}
- Composition centered, square 1:1.
- ABSOLUTELY NO TEXT, NO NUMBERS, NO LETTERS, NO LOGOS, NO WATERMARKS.
- Clean negative space around the subject (10% margin).
- Style consistent with futuristic data-visualization / sci-fi UI panel.
`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: fullPrompt }],
        modalities: ['image', 'text'],
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      console.error('AI gateway error', aiRes.status, text);
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit reached. Please wait and try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Add credits in Settings → Workspace → Usage.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      return new Response(JSON.stringify({ error: 'AI generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await aiRes.json();
    const imageUrl: string | undefined = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'No image returned by model' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ imageUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('generate-slide-graphic fatal', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
