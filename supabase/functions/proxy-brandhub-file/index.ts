// Server-side proxy for BrandHub-hosted files. Browser fetches from BrandHub
// frequently fail because the host doesn't return Access-Control-Allow-Origin.
// This function downloads the file server-side (no CORS in Deno) and streams
// it back to the browser with permissive CORS headers so the client can turn
// it into a Blob and feed it into parsers like the .pptx importer.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "content-type, content-length, content-disposition",
};

const ALLOWED_HOST_SUFFIXES = [
  "brandhub.app",
  "brandhub.io",
  "brandhub.dev",
  "lovable.app",
  "lovable.dev",
  "supabase.co",
  "supabase.in",
  "amazonaws.com",
  "cloudfront.net",
  "googleusercontent.com",
  "storage.googleapis.com",
  "blob.core.windows.net",
  "cdn.shopify.com",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url).searchParams.get("url");
    if (!url) {
      return new Response(JSON.stringify({ error: "Missing url param" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let target: URL;
    try {
      target = new URL(url);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid url" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (target.protocol !== "https:" && target.protocol !== "http:") {
      return new Response(JSON.stringify({ error: "Unsupported scheme" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Basic SSRF guardrail: only allow well-known asset hosts.
    const host = target.hostname.toLowerCase();
    const allowed = ALLOWED_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith("." + suffix));
    if (!allowed) {
      return new Response(JSON.stringify({ error: `Host not allowed: ${host}` }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch(target.toString(), {
      headers: { "User-Agent": "EventKit-BrandHub-Proxy/1.0" },
      redirect: "follow",
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(
        JSON.stringify({ error: `Upstream returned ${upstream.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const headers = new Headers(corsHeaders);
    const contentType = upstream.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);
    const disposition = upstream.headers.get("content-disposition");
    if (disposition) headers.set("Content-Disposition", disposition);

    return new Response(upstream.body, { status: 200, headers });
  } catch (err) {
    console.error("proxy-brandhub-file error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
