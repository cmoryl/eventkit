import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateAssetRequest {
  type: 'slogans' | 'marketing_copy' | 'run_of_show' | 'palette' | 'image' | 'refine_text';
  eventName: string;
  eventDescription?: string;
  eventDate?: string;
  eventLocation?: string;
  styleDescription?: string;
  count?: number;
  text?: string;
  instruction?: string;
  textType?: 'headline' | 'body' | 'cta' | 'slogan' | 'email_subject' | 'preheader' | 'description' | 'social_caption';
  logoBase64?: string;
  colorPalette?: string[];
  referenceImageBase64?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireUser(req, corsHeaders);
  if ("error" in auth) return auth.error;

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: GenerateAssetRequest = await req.json();
    const { type, eventName, eventDescription, eventDate, eventLocation, styleDescription, count, text, instruction, textType, colorPalette, referenceImageBase64 } = body;

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case 'slogans':
        systemPrompt = `You are a creative marketing copywriter specializing in event branding. Generate catchy, memorable slogans for events. Each slogan should be:
- Short (3-8 words)
- Memorable and impactful
- Relevant to the event theme
- Professional yet engaging

Respond with a JSON array of strings containing exactly ${count || 5} slogans. Only respond with the JSON array, no other text.`;
        
        userPrompt = `Generate ${count || 5} creative slogans for an event called "${eventName}".
${eventDescription ? `Event description: ${eventDescription}` : ''}
${styleDescription ? `Style/vibe: ${styleDescription}` : ''}

Return only a JSON array like: ["Slogan 1", "Slogan 2", ...]`;
        break;

      case 'marketing_copy':
        systemPrompt = `You are an expert event marketing copywriter. Create compelling marketing copy that:
- Captures attention immediately
- Highlights key event details
- Creates urgency and excitement
- Includes relevant hashtags
- Is formatted for easy reading

Respond with the marketing copy text only, using emojis and formatting for visual appeal.`;
        
        userPrompt = `Write marketing copy for "${eventName}".
Description: ${eventDescription || 'An exciting upcoming event'}
Date: ${eventDate || 'TBA'}
Location: ${eventLocation || 'TBA'}
${styleDescription ? `Style/vibe: ${styleDescription}` : ''}

Include sections for: event highlights, what to expect, and a call to action.`;
        break;

      case 'run_of_show':
        systemPrompt = `You are an experienced event planner. Create a detailed run of show document that:
- Covers pre-event setup through post-event breakdown
- Uses clear time formatting (HH:MM AM/PM)
- Organizes into logical sections
- Includes practical notes for staff

Format the document with clear headers, time markers, and bullet points for easy reading.`;
        
        userPrompt = `Create a run of show for "${eventName}".
Date: ${eventDate || 'Event Date TBA'}
Description: ${eventDescription || 'A professional event'}
${styleDescription ? `Event style: ${styleDescription}` : ''}

Create a comprehensive timeline from early morning setup through evening breakdown.`;
        break;

      case 'palette':
        // If reference image is provided, use vision model to extract colors
        if (referenceImageBase64) {
          console.log('Extracting palette from reference image...');
          
          const visionSystemPrompt = `You are a professional color analyst. Analyze the provided image and extract the dominant colors to create a cohesive brand palette.

Extract exactly 5 colors that:
1. Are the most visually prominent in the image
2. Work well together as a brand palette
3. Include primary, secondary, and accent colors
4. Maintain the mood and aesthetic of the image

Respond with ONLY a JSON array of exactly 5 hex color codes. No other text.`;

          const visionUserPrompt = `Extract a 5-color palette from this reference image for an event called "${eventName}".
${eventDescription ? `Event description: ${eventDescription}` : ''}
${styleDescription ? `Additional style notes: ${styleDescription}` : ''}

Return only a JSON array like: ["#FF5733", "#33FF57", "#3357FF", "#F5F5F5", "#333333"]`;

          const visionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: visionSystemPrompt },
                { 
                  role: "user", 
                  content: [
                    { type: "text", text: visionUserPrompt },
                    { type: "image_url", image_url: { url: referenceImageBase64 } }
                  ]
                },
              ],
              temperature: 0.5,
            }),
          });

          if (!visionResponse.ok) {
            console.error("Vision API failed, falling back to text-based palette");
            // Fall through to text-based generation
          } else {
            const visionData = await visionResponse.json();
            const content = visionData.choices?.[0]?.message?.content || '[]';
            console.log('Vision palette response:', content);
            
            return new Response(
              JSON.stringify({ result: content }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        // Text-based palette generation (no reference image)
        systemPrompt = `You are a professional color consultant and brand designer. Suggest a cohesive color palette that:
- Works well together visually
- Suits the event's theme and mood
- Includes primary, secondary, and accent colors
- Provides good contrast for readability

Respond with a JSON array of exactly 5 hex color codes. Only respond with the JSON array, no other text.`;
        
        userPrompt = `Suggest a 5-color palette for an event called "${eventName}".
${eventDescription ? `Description: ${eventDescription}` : ''}
${styleDescription ? `Desired style/vibe: ${styleDescription}` : ''}

Return only a JSON array like: ["#FF5733", "#33FF57", ...]`;
        break;

      case 'refine_text': {
        const typeRules: Record<string, string> = {
          headline: `- Max 8 words; punchy and hook-first
- No punctuation at end unless it is a question mark
- Sentence case (not Title Case unless brand mandates it)
- No filler words ("just", "really", "very")`,
          body: `- Paragraphs ≤ 3 sentences; each sentence ≤ 20 words
- Active voice; cut every passive construction
- No jargon; replace with plain language equivalent
- Preserve all factual details (dates, names, locations)`,
          cta: `- 2-5 words maximum
- Verb-first: "Register Now", "Get Tickets", "Save My Spot"
- Imperative mood; no hedging ("click here to maybe...")
- One clear action only`,
          slogan: `- 3-8 words; highly memorable and brand-aligned
- Rhythm matters — read aloud to check cadence
- Avoid clichés; aim for fresh metaphor or wordplay
- Timeless, not trend-dependent`,
          email_subject: `- 6-9 words; avoid spam triggers (FREE, GUARANTEED, !!!, ALL CAPS)
- Create urgency or curiosity without being clickbait
- Personalisation token placeholder OK: {{first_name}}
- ≤ 50 characters for mobile preview`,
          preheader: `- 40-90 characters; complements subject line, does not repeat it
- Continues the subject thought naturally
- Avoid "View this email in your browser" style filler`,
          description: `- 1-3 sentences; lead with the most compelling benefit
- Include who, what, when, where if relevant
- Professional and scannable; no fluff`,
          social_caption: `- Platform-appropriate length (Instagram: ≤ 125 chars before cutoff; Twitter: ≤ 240; LinkedIn: ≤ 200 before "see more")
- Conversational but on-brand
- Hashtags come after the caption body, not embedded mid-sentence
- End with a clear micro-CTA`,
        };
        const typeLabel = textType || 'general';
        const rules = typeRules[typeLabel] || `- Improve clarity, flow, and grammar\n- Preserve original meaning and tone`;
        systemPrompt = `You are a senior marketing copywriter specialised in event promotion. Refine the given ${typeLabel} text following these rules:
${rules}

Respond with ONLY the refined text — no explanations, no labels, no quotation marks.`;
        userPrompt = `Text to refine: ${text}
Refinement instruction: ${instruction || 'Improve quality while keeping the original intent.'}`;
        break;
      }

      default:
        throw new Error(`Unsupported generation type: ${type}`);
    }

    console.log(`Generating ${type} for event: ${eventName}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    // Parse response based on type
    let result: unknown;
    
    if (type === 'slogans' || type === 'palette') {
      // Extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to parse the whole content
        try {
          result = JSON.parse(content);
        } catch {
          // If it's slogans, try to extract lines as slogans
          if (type === 'slogans') {
            result = content.split('\n').filter((line: string) => line.trim()).slice(0, count || 5);
          } else {
            throw new Error("Could not parse AI response");
          }
        }
      }
    } else {
      result = content;
    }

    console.log(`Successfully generated ${type}`);

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-asset error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
