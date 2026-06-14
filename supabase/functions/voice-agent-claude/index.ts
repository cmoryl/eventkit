// OpenAI-compatible Chat Completions proxy backed by Claude.
// Designed to be wired into ElevenLabs Conversational AI as a "Custom LLM" endpoint
// so the voice agent reasons with Claude while keeping the existing client-tool schema.
//
// Endpoint: POST /functions/v1/voice-agent-claude/chat/completions
// Supports both stream=true (SSE in OpenAI delta shape) and one-shot JSON.

import { corsHeaders } from "../_shared/cors.ts";
import { callClaude, streamClaude, type ClaudeModel } from "../_shared/anthropic.ts";

interface OpenAIChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  tool_call_id?: string;
  tool_calls?: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }>;
  name?: string;
}

interface OpenAIChatRequest {
  model?: string;
  messages: OpenAIChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: Array<{
    type: "function";
    function: { name: string; description?: string; parameters: Record<string, unknown> };
  }>;
  tool_choice?: unknown;
}

function flattenContent(c: OpenAIChatMessage["content"]): string {
  if (typeof c === "string") return c;
  return c.map((p) => (p.type === "text" ? p.text ?? "" : "")).join("\n");
}

function convertMessages(messages: OpenAIChatMessage[]) {
  const systemParts: string[] = [];
  const claudeMessages: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const m of messages) {
    if (m.role === "system") {
      systemParts.push(flattenContent(m.content));
    } else if (m.role === "tool") {
      // Surface tool results back to Claude as user text — ElevenLabs voice tools resolve client-side.
      claudeMessages.push({
        role: "user",
        content: `[tool ${m.name ?? m.tool_call_id ?? "result"}]\n${flattenContent(m.content)}`,
      });
    } else if (m.role === "assistant" || m.role === "user") {
      claudeMessages.push({ role: m.role, content: flattenContent(m.content) });
    }
  }
  return { system: systemParts.join("\n\n") || undefined, claudeMessages };
}

function pickClaudeModel(model?: string): ClaudeModel {
  if (!model) return "claude-sonnet-4-5";
  if (model.startsWith("claude-")) return model as ClaudeModel;
  // Map any OpenAI-shaped names to a sensible default.
  if (model.includes("nano") || model.includes("haiku")) return "claude-haiku-4-5";
  if (model.includes("opus")) return "claude-opus-4-5";
  return "claude-sonnet-4-5";
}

async function handleChatCompletions(req: Request): Promise<Response> {
  const body = (await req.json()) as OpenAIChatRequest;
  const { system, claudeMessages } = convertMessages(body.messages ?? []);
  const model = pickClaudeModel(body.model);

  if (body.stream) {
    const upstream = await streamClaude({
      model,
      system,
      messages: claudeMessages,
      max_tokens: body.max_tokens ?? 1024,
      temperature: body.temperature ?? 0.7,
    });

    // Transform Anthropic SSE -> OpenAI delta SSE so ElevenLabs / OpenAI clients consume it.
    const id = `chatcmpl-${crypto.randomUUID()}`;
    const created = Math.floor(Date.now() / 1000);
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buf = "";

    const out = new ReadableStream({
      async start(controller) {
        const reader = upstream.getReader();
        const send = (obj: unknown) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const events = buf.split("\n\n");
            buf = events.pop() ?? "";
            for (const ev of events) {
              const lines = ev.split("\n");
              const dataLine = lines.find((l) => l.startsWith("data:"));
              if (!dataLine) continue;
              const payload = dataLine.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const parsed = JSON.parse(payload);
                if (
                  parsed.type === "content_block_delta" &&
                  parsed.delta?.type === "text_delta" &&
                  typeof parsed.delta.text === "string"
                ) {
                  send({
                    id,
                    object: "chat.completion.chunk",
                    created,
                    model,
                    choices: [
                      { index: 0, delta: { content: parsed.delta.text }, finish_reason: null },
                    ],
                  });
                } else if (parsed.type === "message_stop") {
                  send({
                    id,
                    object: "chat.completion.chunk",
                    created,
                    model,
                    choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
                  });
                }
              } catch {
                // ignore non-JSON events (event: lines, etc.)
              }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(out, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-AI-Provider": "anthropic",
      },
    });
  }

  const res = await callClaude({
    model,
    system,
    messages: claudeMessages,
    max_tokens: body.max_tokens ?? 1024,
    temperature: body.temperature ?? 0.7,
  });

  const text = res.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { text: string }).text)
    .join("\n");

  return new Response(
    JSON.stringify({
      id: `chatcmpl-${crypto.randomUUID()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: text },
          finish_reason: res.stop_reason ?? "stop",
        },
      ],
      usage: {
        prompt_tokens: res.usage.input_tokens,
        completion_tokens: res.usage.output_tokens,
        total_tokens: res.usage.input_tokens + res.usage.output_tokens,
      },
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    if (req.method === "POST" && url.pathname.endsWith("/chat/completions")) {
      return await handleChatCompletions(req);
    }
    // Friendly default for accidental GETs.
    return new Response(
      JSON.stringify({
        ok: true,
        endpoint: "voice-agent-claude",
        usage: "POST /chat/completions (OpenAI-compatible, Claude-backed)",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("voice-agent-claude error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
