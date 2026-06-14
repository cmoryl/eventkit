// Shared Anthropic Claude client for EventKIT edge functions.
// Wraps https://api.anthropic.com/v1/messages with JSON, streaming, tool-use, and vision support.
// Maps Anthropic error codes onto the project-wide 429/402 contract used by the Gemini/GPT paths.

const ANTHROPIC_BASE = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export type ClaudeModel =
  | "claude-sonnet-4-5"
  | "claude-opus-4-5"
  | "claude-haiku-4-5"
  | "claude-3-5-sonnet-latest"
  | "claude-3-5-haiku-latest";

export const CLAUDE_MODELS: Record<
  ClaudeModel,
  { label: string; tier: "fast" | "balanced" | "max"; notes: string }
> = {
  "claude-sonnet-4-5": { label: "Claude Sonnet 4.5", tier: "balanced", notes: "Default. Best blend of speed + reasoning." },
  "claude-opus-4-5": { label: "Claude Opus 4.5", tier: "max", notes: "Highest quality reasoning. Slower / costlier." },
  "claude-haiku-4-5": { label: "Claude Haiku 4.5", tier: "fast", notes: "Fastest / cheapest. Good for classification + copy." },
  "claude-3-5-sonnet-latest": { label: "Claude 3.5 Sonnet", tier: "balanced", notes: "Legacy fallback." },
  "claude-3-5-haiku-latest": { label: "Claude 3.5 Haiku", tier: "fast", notes: "Legacy fast fallback." },
};

export type ClaudeMessageContent =
  | string
  | Array<
      | { type: "text"; text: string }
      | {
          type: "image";
          source:
            | { type: "base64"; media_type: string; data: string }
            | { type: "url"; url: string };
        }
      | { type: "tool_use"; id: string; name: string; input: unknown }
      | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean }
    >;

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: ClaudeMessageContent;
}

export interface ClaudeTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface ClaudeRequest {
  model?: ClaudeModel;
  system?: string;
  messages: ClaudeMessage[];
  max_tokens?: number;
  temperature?: number;
  tools?: ClaudeTool[];
  tool_choice?: { type: "auto" | "any" | "tool"; name?: string };
  stream?: boolean;
}

export interface ClaudeResponse {
  id: string;
  model: string;
  role: "assistant";
  content: Array<
    | { type: "text"; text: string }
    | { type: "tool_use"; id: string; name: string; input: unknown }
  >;
  stop_reason: string | null;
  usage: { input_tokens: number; output_tokens: number };
}

export class ClaudeError extends Error {
  status: number;
  code: "rate_limited" | "credits_exhausted" | "auth" | "bad_request" | "upstream";
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    if (status === 429) this.code = "rate_limited";
    else if (status === 402) this.code = "credits_exhausted";
    else if (status === 401 || status === 403) this.code = "auth";
    else if (status >= 400 && status < 500) this.code = "bad_request";
    else this.code = "upstream";
  }
}

function getKey(): string {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new ClaudeError(500, "ANTHROPIC_API_KEY is not configured");
  return key;
}

/** One-shot Claude call returning the full message. */
export async function callClaude(req: ClaudeRequest): Promise<ClaudeResponse> {
  const body = {
    model: req.model ?? "claude-sonnet-4-5",
    max_tokens: req.max_tokens ?? 4096,
    temperature: req.temperature ?? 0.7,
    system: req.system,
    messages: req.messages,
    tools: req.tools,
    tool_choice: req.tool_choice,
  };

  const res = await fetch(ANTHROPIC_BASE, {
    method: "POST",
    headers: {
      "x-api-key": getKey(),
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new ClaudeError(res.status, `Claude API ${res.status}: ${detail.slice(0, 500)}`);
  }
  return (await res.json()) as ClaudeResponse;
}

/** Convenience: ask Claude for structured JSON via a single tool definition. */
export async function callClaudeJson<T>(args: {
  system?: string;
  prompt: string | ClaudeMessageContent;
  schema: Record<string, unknown>;
  toolName?: string;
  model?: ClaudeModel;
  temperature?: number;
  max_tokens?: number;
}): Promise<T> {
  const toolName = args.toolName ?? "return_structured_output";
  const res = await callClaude({
    model: args.model,
    system: args.system,
    temperature: args.temperature,
    max_tokens: args.max_tokens,
    messages: [{ role: "user", content: args.prompt as ClaudeMessageContent }],
    tools: [
      {
        name: toolName,
        description: "Return the requested structured output.",
        input_schema: args.schema,
      },
    ],
    tool_choice: { type: "tool", name: toolName },
  });

  const toolUse = res.content.find((c) => c.type === "tool_use") as
    | { type: "tool_use"; input: T }
    | undefined;
  if (!toolUse) throw new ClaudeError(502, "Claude did not return structured output");
  return toolUse.input;
}

/** Extract concatenated text content from a Claude response. */
export function claudeText(res: ClaudeResponse): string {
  return res.content
    .filter((c): c is { type: "text"; text: string } => c.type === "text")
    .map((c) => c.text)
    .join("\n")
    .trim();
}

/** Stream Claude's SSE response back to the browser (or transform to plain text chunks). */
export async function streamClaude(
  req: ClaudeRequest,
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(ANTHROPIC_BASE, {
    method: "POST",
    headers: {
      "x-api-key": getKey(),
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
      accept: "text/event-stream",
    },
    body: JSON.stringify({
      model: req.model ?? "claude-sonnet-4-5",
      max_tokens: req.max_tokens ?? 4096,
      temperature: req.temperature ?? 0.7,
      system: req.system,
      messages: req.messages,
      tools: req.tools,
      tool_choice: req.tool_choice,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new ClaudeError(res.status, `Claude stream ${res.status}: ${detail.slice(0, 500)}`);
  }
  return res.body;
}

/**
 * Stream Claude as a plain-text ReadableStream of just the text deltas
 * (no Anthropic SSE framing). Easier for the browser to read with
 * `response.body.getReader()` + `TextDecoder`.
 */
export async function streamClaudeText(
  req: ClaudeRequest,
): Promise<ReadableStream<Uint8Array>> {
  const sse = await streamClaude(req);
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buf = "";

  return sse.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buf += decoder.decode(chunk, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload) as {
              type: string;
              delta?: { type?: string; text?: string; partial_json?: string };
            };
            if (evt.type === "content_block_delta") {
              const d = evt.delta;
              const text = d?.type === "text_delta" ? d.text
                : d?.type === "input_json_delta" ? d.partial_json
                : undefined;
              if (text) controller.enqueue(encoder.encode(text));
            }
          } catch {
            // ignore malformed lines
          }
        }
      },
    }),
  );
}

/** Map a ClaudeError to the project's standard JSON response shape. */
export function claudeErrorResponse(err: unknown, corsHeaders: Record<string, string>): Response {
  if (err instanceof ClaudeError) {
    const userMessage =
      err.code === "rate_limited"
        ? "Claude is rate-limited right now. Please try again in a moment."
        : err.code === "credits_exhausted"
        ? "Anthropic credits exhausted. Add credits to your Anthropic workspace to continue."
        : err.code === "auth"
        ? "ANTHROPIC_API_KEY is invalid or missing."
        : err.message;
    return new Response(
      JSON.stringify({ error: userMessage, code: err.code, provider: "anthropic" }),
      {
        status: err.status === 401 ? 500 : err.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
  const msg = err instanceof Error ? err.message : String(err);
  return new Response(JSON.stringify({ error: msg, provider: "anthropic" }), {
    status: 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
