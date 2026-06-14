// Browser helper for streaming Supabase edge functions that return plain text
// or NDJSON. `supabase.functions.invoke` buffers the entire body, so we hit
// the function URL directly with `fetch` and read `response.body` chunk-wise.

import { supabase } from "@/integrations/supabase/client";

const FN_BASE = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export interface StreamOptions {
  /** Fires for every decoded text chunk as it arrives. */
  onChunk?: (chunk: string, accumulated: string) => void;
  /** Fires once for every complete NDJSON line. */
  onLine?: (line: string) => void;
  signal?: AbortSignal;
}

/**
 * POSTs to a Supabase edge function and streams the text body back.
 * Returns the final accumulated text once the stream completes.
 */
export async function streamEdgeFunction(
  name: string,
  body: Record<string, unknown>,
  opts: StreamOptions = {},
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? ANON_KEY;

  const res = await fetch(`${FN_BASE}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail || `Edge function ${name} failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let acc = "";
  let lineBuf = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (!chunk) continue;
    acc += chunk;
    opts.onChunk?.(chunk, acc);

    if (opts.onLine) {
      lineBuf += chunk;
      const parts = lineBuf.split("\n");
      lineBuf = parts.pop() ?? "";
      for (const line of parts) {
        const t = line.trim();
        if (t) opts.onLine(t);
      }
    }
  }
  if (opts.onLine && lineBuf.trim()) opts.onLine(lineBuf.trim());
  return acc;
}
