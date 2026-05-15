import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ValidationRequest {
  provider: string;
  apiKey: string;
}

interface ValidationResponse {
  valid: boolean;
  message: string;
  details?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Validate OpenAI API key by listing models
async function validateOpenAI(apiKey: string): Promise<ValidationResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { valid: true, message: 'OpenAI API key is valid' };
    }

    const error = await response.json();
    if (response.status === 401) {
      return { valid: false, message: 'Invalid API key', details: error.error?.message };
    }
    if (response.status === 429) {
      // Rate limited but key is valid
      return { valid: true, message: 'API key is valid (rate limited)', details: 'Key works but you may be rate limited' };
    }

    return { valid: false, message: 'API key validation failed', details: error.error?.message };
  } catch (error: unknown) {
    return { valid: false, message: 'Connection error', details: getErrorMessage(error) };
  }
}

// Validate Stability AI API key by checking account balance
async function validateStability(apiKey: string): Promise<ValidationResponse> {
  try {
    const response = await fetch('https://api.stability.ai/v1/user/account', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        valid: true, 
        message: 'Stability AI API key is valid',
        details: `Credits: ${data.credits || 'N/A'}`
      };
    }

    if (response.status === 401) {
      return { valid: false, message: 'Invalid API key' };
    }

    const text = await response.text();
    return { valid: false, message: 'API key validation failed', details: text };
  } catch (error: unknown) {
    return { valid: false, message: 'Connection error', details: getErrorMessage(error) };
  }
}

// Validate Replicate API key by checking account
async function validateReplicate(apiKey: string): Promise<ValidationResponse> {
  try {
    const response = await fetch('https://api.replicate.com/v1/account', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${apiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        valid: true, 
        message: 'Replicate API token is valid',
        details: `Account: ${data.username || data.name || 'Verified'}`
      };
    }

    if (response.status === 401) {
      return { valid: false, message: 'Invalid API token' };
    }

    const text = await response.text();
    return { valid: false, message: 'API token validation failed', details: text };
  } catch (error: unknown) {
    return { valid: false, message: 'Connection error', details: getErrorMessage(error) };
  }
}

// Validate Google AI API key by listing models
async function validateGoogle(apiKey: string): Promise<ValidationResponse> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`, {
      method: 'GET',
    });

    if (response.ok) {
      return { valid: true, message: 'Google AI API key is valid' };
    }

    const error = await response.json();
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      return { valid: false, message: 'Invalid API key', details: error.error?.message };
    }

    return { valid: false, message: 'API key validation failed', details: error.error?.message };
  } catch (error: unknown) {
    return { valid: false, message: 'Connection error', details: getErrorMessage(error) };
  }
}

// Validate Black Forest Labs (Flux) API key
async function validateFlux(apiKey: string): Promise<ValidationResponse> {
  try {
    // BFL doesn't have a dedicated account endpoint, try a lightweight operation
    const response = await fetch('https://api.bfl.ml/v1/get_result?id=test', {
      method: 'GET',
      headers: {
        'X-Key': apiKey,
      },
    });

    // A 404 for non-existent ID with valid auth is actually a valid key
    // 401/403 means invalid key
    if (response.status === 404 || response.status === 422) {
      return { valid: true, message: 'Flux API key appears valid' };
    }

    if (response.status === 401 || response.status === 403) {
      return { valid: false, message: 'Invalid API key' };
    }

    if (response.ok) {
      return { valid: true, message: 'Flux API key is valid' };
    }

    const text = await response.text();
    return { valid: false, message: 'API key validation failed', details: text };
  } catch (error: unknown) {
    return { valid: false, message: 'Connection error', details: getErrorMessage(error) };
  }
}

// Validate Ideogram API key
async function validateIdeogram(apiKey: string): Promise<ValidationResponse> {
  try {
    // Try to check account or make a simple request
    const response = await fetch('https://api.ideogram.ai/describe', {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_request: {
          image_url: 'https://via.placeholder.com/1'
        }
      }),
    });

    // Various response codes that indicate key is valid
    if (response.ok || response.status === 400 || response.status === 422) {
      // 400/422 means bad request but auth passed
      return { valid: true, message: 'Ideogram API key is valid' };
    }

    if (response.status === 401 || response.status === 403) {
      return { valid: false, message: 'Invalid API key' };
    }

    const text = await response.text();
    return { valid: false, message: 'API key validation failed', details: text };
  } catch (error: unknown) {
    return { valid: false, message: 'Connection error', details: getErrorMessage(error) };
  }
}

// Validate Midjourney API key (via proxy services)
async function validateMidjourney(apiKey: string): Promise<ValidationResponse> {
  // Midjourney doesn't have an official public API
  // Most implementations use Discord or third-party proxies
  // We can only do format validation here
  if (apiKey.length < 10) {
    return { valid: false, message: 'API key too short' };
  }
  
  return { 
    valid: true, 
    message: 'Midjourney key format accepted',
    details: 'Note: Midjourney uses unofficial APIs. Key cannot be fully validated.'
  };
}

// Lovable AI - no key needed, just confirm it works
async function validateLovable(): Promise<ValidationResponse> {
  return { 
    valid: true, 
    message: 'Lovable AI is pre-configured',
    details: 'No API key required - ready to use'
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireUser(req, corsHeaders);
  if ("error" in auth) return auth.error;

  try {
    const { provider, apiKey }: ValidationRequest = await req.json();

    if (!provider) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Provider is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: ValidationResponse;

    switch (provider) {
      case 'lovable':
        result = await validateLovable();
        break;
      case 'openai':
        if (!apiKey) {
          result = { valid: false, message: 'API key is required for OpenAI' };
        } else {
          result = await validateOpenAI(apiKey);
        }
        break;
      case 'stability':
        if (!apiKey) {
          result = { valid: false, message: 'API key is required for Stability AI' };
        } else {
          result = await validateStability(apiKey);
        }
        break;
      case 'replicate':
        if (!apiKey) {
          result = { valid: false, message: 'API token is required for Replicate' };
        } else {
          result = await validateReplicate(apiKey);
        }
        break;
      case 'google':
        if (!apiKey) {
          result = { valid: false, message: 'API key is required for Google AI' };
        } else {
          result = await validateGoogle(apiKey);
        }
        break;
      case 'flux':
        if (!apiKey) {
          result = { valid: false, message: 'API key is required for Flux' };
        } else {
          result = await validateFlux(apiKey);
        }
        break;
      case 'ideogram':
        if (!apiKey) {
          result = { valid: false, message: 'API key is required for Ideogram' };
        } else {
          result = await validateIdeogram(apiKey);
        }
        break;
      case 'midjourney':
        if (!apiKey) {
          result = { valid: false, message: 'API key is required for Midjourney' };
        } else {
          result = await validateMidjourney(apiKey);
        }
        break;
      default:
        result = { valid: false, message: `Unknown provider: ${provider}` };
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ valid: false, message: 'Validation service error', details: getErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
