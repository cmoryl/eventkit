import React, { useCallback, useEffect, useRef, useState } from "react";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Phone, PhoneOff, Loader2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { slideEditorBus } from "@/lib/slideEditorBus";
import { SLIDE_BLOCK_TEMPLATES } from "@/components/slides/slideTemplateRegistry";

export interface VoiceAgentContext {
  brandName?: string;
  isFromBrandHub?: boolean;
  selectedPages?: number;
  topic?: string;
  audience?: string;
  slideCount?: number;
  tone?: string;
  themeOverride?: string;
  useBrand?: boolean;
}

export interface VoiceAgentActions {
  setTopic: (topic: string) => void;
  setAudience: (audience: string) => void;
  setSlideCount: (count: number) => void;
  setTone: (tone: string) => void;
  setThemeOverride: (theme: string) => void;
  setUseBrand: (enabled: boolean) => void;
  triggerGenerate: () => void;
}

interface TranscriptEntry {
  id: string;
  role: "user" | "agent";
  text: string;
  ts: number;
}

interface Props {
  context: VoiceAgentContext;
  actions: VoiceAgentActions;
}

const VoiceAgentPanelInner: React.FC<Props> = ({ context, actions }) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [outputVolume, setOutputVolume] = useState(0);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const fallbackGreetingTimerRef = useRef<number | null>(null);
  const hasAgentSpokenRef = useRef(false);

  // Keep latest context + actions accessible inside stable callbacks
  const contextRef = useRef(context);
  const actionsRef = useRef(actions);
  useEffect(() => { contextRef.current = context; }, [context]);
  useEffect(() => { actionsRef.current = actions; }, [actions]);

  const pushEntry = useCallback((role: "user" | "agent", text: string) => {
    setTranscript((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, role, text, ts: Date.now() },
    ]);
  }, []);

  const conversation = useConversation({
    onConnect: () => {
      toast({ title: "Voice agent connected", description: "Say something or ask me to build a deck." });
      hasAgentSpokenRef.current = false;
      if (fallbackGreetingTimerRef.current) window.clearTimeout(fallbackGreetingTimerRef.current);
      fallbackGreetingTimerRef.current = window.setTimeout(() => {
        if (hasAgentSpokenRef.current) return;
        conversation.sendUserMessage("Briefly greet me as the EventKIT PowerPoint assistant and ask what presentation we are building.");
      }, 2500);
    },
    onDisconnect: () => {
      setOutputVolume(0);
      hasAgentSpokenRef.current = false;
      if (fallbackGreetingTimerRef.current) {
        window.clearTimeout(fallbackGreetingTimerRef.current);
        fallbackGreetingTimerRef.current = null;
      }
    },
    onError: (error: unknown) => {
      console.error("ElevenLabs error:", error);
      const msg = typeof error === "string" ? error : (error as Error)?.message ?? "Voice connection failed";
      toast({ title: "Voice error", description: msg, variant: "destructive" });
    },
    onMessage: (message: { source: "user" | "ai"; message: string }) => {
      if (!message?.message) return;
      if (message.source === "ai") {
        hasAgentSpokenRef.current = true;
        if (fallbackGreetingTimerRef.current) {
          window.clearTimeout(fallbackGreetingTimerRef.current);
          fallbackGreetingTimerRef.current = null;
        }
      }
      pushEntry(message.source === "user" ? "user" : "agent", message.message);
    },
    clientTools: {
      setTopic: (params: { topic: string }) => {
        actionsRef.current.setTopic(params.topic);
        return `Set topic to "${params.topic}"`;
      },
      setAudience: (params: { audience: string }) => {
        actionsRef.current.setAudience(params.audience);
        return `Set audience to "${params.audience}"`;
      },
      setSlideCount: (params: { count: number }) => {
        const c = Math.max(3, Math.min(30, Math.round(Number(params.count) || 10)));
        actionsRef.current.setSlideCount(c);
        return `Set slide count to ${c}`;
      },
      setTone: (params: { tone: string }) => {
        actionsRef.current.setTone(params.tone);
        return `Set tone to "${params.tone}"`;
      },
      setThemeOverride: (params: { theme: string }) => {
        actionsRef.current.setThemeOverride(params.theme);
        return `Theme override set: "${params.theme}"`;
      },
      toggleBrandStyling: (params: { enabled: boolean }) => {
        actionsRef.current.setUseBrand(!!params.enabled);
        return `Brand styling ${params.enabled ? "enabled" : "disabled"}`;
      },
      generateDeck: () => {
        actionsRef.current.triggerGenerate();
        return "Triggered deck generation";
      },
      describeCurrentDeck: () => {
        const c = contextRef.current;
        return JSON.stringify({
          brand: c.brandName ?? null,
          brandFromBrandHub: !!c.isFromBrandHub,
          topic: c.topic ?? "",
          audience: c.audience ?? "",
          slideCount: c.slideCount ?? 10,
          tone: c.tone ?? "",
          themeOverride: c.themeOverride ?? "",
          selectedSourcePages: c.selectedPages ?? 0,
          brandStylingActive: !!c.useBrand,
          liveEditorConnected: slideEditorBus.isConnected(),
          activeSlideIndex: slideEditorBus.isConnected() ? slideEditorBus.call("getActiveIndex") : null,
          slideCountInEditor: slideEditorBus.isConnected() ? slideEditorBus.call("getSlideCount") : null,
        });
      },
      // ── Live editor commands (only effective when SlideEditor is mounted) ──
      listSmartLayouts: () => {
        // Returns the template catalog so the agent can pick one by id.
        return JSON.stringify(
          SLIDE_BLOCK_TEMPLATES.map((t) => ({
            id: t.id,
            category: t.category,
            label: t.label,
            description: t.description,
            slots: t.slots.map((s) => ({ name: s.name, type: s.type, required: !!s.required })),
          })),
        );
      },
      insertSlide: (params: { templateId: string; slotValues?: Record<string, unknown> }) => {
        if (!slideEditorBus.isConnected()) return "Editor is not open. Switch to the editor tab first.";
        const result = slideEditorBus.call("insertTemplate", params.templateId, params.slotValues ?? {});
        return result ? `Inserted ${params.templateId} slide` : `Unknown template "${params.templateId}"`;
      },
      setAccentImage: (params: { position?: "none" | "top" | "left" | "right" | "background"; overlay?: "none" | "frosted" | "faded" | "clear"; intensity?: number; url?: string }) => {
        if (!slideEditorBus.isConnected()) return "Editor is not open.";
        slideEditorBus.call("setAccentImage", params);
        return `Accent image updated (${params.position ?? "current"})`;
      },
      setSlideField: (params: { field: "title" | "subtitle" | "body" | "quote" | "quoteAuthor"; value: string }) => {
        if (!slideEditorBus.isConnected()) return "Editor is not open.";
        slideEditorBus.call("setSlideField", params);
        return `Updated ${params.field}`;
      },
      goToSlide: (params: { index: number }) => {
        if (!slideEditorBus.isConnected()) return "Editor is not open.";
        const ok = slideEditorBus.call("goToSlide", Math.max(0, Math.floor(params.index)));
        return ok ? `Showing slide ${params.index + 1}` : `No slide at index ${params.index}`;
      },
      duplicateActiveSlide: () => {
        if (!slideEditorBus.isConnected()) return "Editor is not open.";
        slideEditorBus.call("duplicateActive");
        return "Duplicated active slide";
      },
      deleteActiveSlide: () => {
        if (!slideEditorBus.isConnected()) return "Editor is not open.";
        const ok = slideEditorBus.call("deleteActive");
        return ok ? "Deleted active slide" : "Cannot delete the last remaining slide";
      },
      toggleBrandLock: (params: { locked: boolean }) => {
        if (!slideEditorBus.isConnected()) return "Editor is not open.";
        slideEditorBus.call("toggleBrandLock", !!params.locked);
        return params.locked ? "Brand Lock is now ON" : "Brand Lock is now OFF";
      },
      applyBrandToAllSlides: () => {
        if (!slideEditorBus.isConnected()) return "Editor is not open.";
        const ok = slideEditorBus.call("applyBrandLockToAll");
        return ok ? "Applied brand colors to all slides" : "No active brand colors to apply";
      },
      listDraftTray: () => {
        if (!slideEditorBus.isConnected()) return "Editor is not open.";
        const count = slideEditorBus.call("getDraftCount") ?? 0;
        return `${count} AI draft slide${count === 1 ? "" : "s"} in the tray`;
      },
      insertDraftSlide: (params: { index: number }) => {
        if (!slideEditorBus.isConnected()) return "Editor is not open.";
        const ok = slideEditorBus.call("insertDraft", Math.max(0, Math.floor(params.index)));
        return ok ? `Inserted draft slide ${params.index + 1}` : `No draft at index ${params.index}`;
      },
      dismissDraftTray: () => {
        if (!slideEditorBus.isConnected()) return "Editor is not open.";
        slideEditorBus.call("dismissDraftTray");
        return "Cleared AI draft tray";
      },
      undoEdit: () => {
        if (!slideEditorBus.isConnected()) return "Editor is not open.";
        const ok = slideEditorBus.call("undoEdit");
        return ok ? "Undid the last edit" : "Nothing to undo";
      },
      redoEdit: () => {
        if (!slideEditorBus.isConnected()) return "Editor is not open.";
        const ok = slideEditorBus.call("redoEdit");
        return ok ? "Redid the last edit" : "Nothing to redo";
      },
      runBulkAction: (params: { action: 'reverse' | 'clearImages' | 'clearAccents' | 'syncBackground' | 'clearTransitions' }) => {
        if (!slideEditorBus.isConnected()) return "Editor is not open.";
        const ok = slideEditorBus.call("runBulkAction", params.action);
        return ok ? `Applied bulk action: ${params.action}` : `Unknown bulk action: ${params.action}`;
      },
    },
  });

  const status = conversation.status; // "connected" | "disconnected" | "connecting"
  const isConnected = status === "connected";
  const isSpeaking = conversation.isSpeaking;

  // Animate orb pulse based on output volume
  useEffect(() => {
    if (!isConnected) return;
    let raf = 0;
    const tick = () => {
      try {
        const v = conversation.getOutputVolume?.() ?? 0;
        setOutputVolume(v);
      } catch { /* noop */ }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isConnected, conversation]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript]);

  const buildDynamicPrompt = useCallback(() => {
    const c = contextRef.current;
    const editorOpen = slideEditorBus.isConnected();
    const lines = [
      "You are EventKIT's PowerPoint deck design assistant. The user is on the deck-builder page right now.",
      "Be concise and conversational. Ask one question at a time. Confirm before triggering generation.",
      "When the user gives you details (topic, audience, slide count, tone, theme), call the matching client tool to fill the form.",
      "Call generateDeck only when the user explicitly says to generate, build, or create the deck.",
      "",
      editorOpen
        ? "The LIVE EDITOR is currently open. You can directly modify the active deck without regenerating:"
        : "The live editor is not open. You can still help plan the deck and trigger generation.",
      editorOpen ? "- Use listSmartLayouts to see available slide templates and their slot names." : "",
      editorOpen ? "- Use insertSlide({ templateId, slotValues }) to add a new slide (e.g. 'kpi-trio' with three stats)." : "",
      editorOpen ? "- Use setAccentImage({ position, overlay, intensity, url }) to apply a Gamma-style accent image." : "",
      editorOpen ? "- Use setSlideField({ field, value }) to edit title/subtitle/body/quote on the active slide." : "",
      editorOpen ? "- Use goToSlide, duplicateActiveSlide, deleteActiveSlide to navigate and manage slides." : "",
      editorOpen ? "- Use toggleBrandLock({locked}) and applyBrandToAllSlides() to enforce pixel-perfect brand colors." : "",
      editorOpen ? "- Use listDraftTray, insertDraftSlide({index}), dismissDraftTray to manage AI draft slides." : "",
      "",
      "Current deck context:",
      `- Active brand: ${c.brandName ?? "none"}${c.isFromBrandHub ? " (BrandHub)" : ""}`,
      `- Brand styling: ${c.useBrand ? "ON" : "OFF"}`,
      `- Topic: ${c.topic || "(empty)"}`,
      `- Audience: ${c.audience || "(empty)"}`,
      `- Slide count: ${c.slideCount ?? 10}`,
      `- Tone: ${c.tone || "(empty)"}`,
      `- Theme override: ${c.themeOverride || "(none)"}`,
      `- PDF source pages selected: ${c.selectedPages ?? 0}`,
    ].filter(Boolean);
    return lines.join("\n");
  }, []);

  const buildFirstMessage = useCallback(() => {
    const c = contextRef.current;
    const brandPart = c.brandName ? ` I see you're working with the ${c.brandName} brand.` : "";
    const sourcePart = (c.selectedPages ?? 0) > 0 ? ` You have ${c.selectedPages} reference page${c.selectedPages === 1 ? "" : "s"} from a PDF.` : "";
    return `Hi! I'm your deck design assistant.${brandPart}${sourcePart} What kind of presentation are we building?`;
  }, []);

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    let permissionStream: MediaStream | null = null;
    try {
      // Unlock audio + request mic permission directly from the click gesture, then
      // release this temporary stream so the ElevenLabs WebRTC session owns the mic.
      const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const unlockContext = AudioContextCtor ? new AudioContextCtor() : null;
      const permissionPromise = navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      await unlockContext?.resume().catch(() => undefined);
      permissionStream = await permissionPromise;
      permissionStream.getTracks().forEach((track) => track.stop());
      permissionStream = null;
      await unlockContext?.close().catch(() => undefined);

      // Mint a server-side WebRTC token
      const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token");
      if (error || !data?.token) {
        const status = (error as { context?: { status?: number } })?.context?.status;
        const msg = status === 401
          ? "Please sign in to use the voice agent."
          : (data?.error || error?.message || "Couldn't reach the voice service.");
        toast({ title: "Couldn't start voice", description: msg, variant: "destructive" });
        return;
      }

      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
        overrides: {
          agent: {
            prompt: { prompt: buildDynamicPrompt() },
            firstMessage: buildFirstMessage(),
          },
        },
      });
      conversation.setMuted(false);
      conversation.setVolume({ volume: 1 });
    } catch (e: unknown) {
      console.error(e);
      const msg = (e as Error)?.message || "Microphone access denied.";
      toast({ title: "Couldn't start voice", description: msg, variant: "destructive" });
    } finally {
      permissionStream?.getTracks().forEach((track) => track.stop());
      setIsConnecting(false);
    }
  }, [conversation, buildDynamicPrompt, buildFirstMessage, toast]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (e) {
      console.error(e);
    }
  }, [conversation]);

  const orbScale = 1 + Math.min(outputVolume * 0.6, 0.6);
  const orbGlow = 0.4 + Math.min(outputVolume * 0.6, 0.6);

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[340px] max-w-[calc(100vw-2rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="relative h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              {isConnected ? <Mic className="h-3.5 w-3.5 text-primary-foreground" /> : <MicOff className="h-3.5 w-3.5 text-primary-foreground" />}
              {isConnected && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card animate-pulse" />
              )}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Voice Agent</div>
              <div className="text-[10px] text-muted-foreground">
                {isConnected ? (isSpeaking ? "Speaking…" : "Listening…") : "Tap to talk"}
              </div>
            </div>
          </div>
          {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Mic orb */}
              <div className="flex items-center justify-center py-6 relative">
                <motion.div
                  animate={{ scale: isConnected ? orbScale : 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="relative"
                >
                  <div
                    className="h-24 w-24 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg"
                    style={{
                      boxShadow: isConnected
                        ? `0 0 ${20 + orbGlow * 40}px hsl(var(--primary) / ${orbGlow})`
                        : undefined,
                    }}
                  >
                    {isConnecting ? (
                      <Loader2 className="h-9 w-9 text-primary-foreground animate-spin" />
                    ) : isConnected ? (
                      <Mic className="h-9 w-9 text-primary-foreground" />
                    ) : (
                      <Phone className="h-9 w-9 text-primary-foreground" />
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Transcript */}
              {transcript.length > 0 && (
                <div
                  ref={transcriptRef}
                  className="max-h-44 overflow-y-auto px-4 pb-3 space-y-1.5 border-t border-border/40 pt-3"
                >
                  {transcript.map((t) => (
                    <div
                      key={t.id}
                      className={`text-xs leading-relaxed ${t.role === "user" ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      <span className={`text-[9px] uppercase tracking-wider mr-1.5 ${t.role === "user" ? "text-primary" : "text-accent"}`}>
                        {t.role === "user" ? "You" : "Agent"}
                      </span>
                      {t.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Controls */}
              <div className="px-4 pb-4 pt-2 border-t border-border/40 flex gap-2">
                {!isConnected ? (
                  <Button
                    type="button"
                    onClick={startConversation}
                    disabled={isConnecting}
                    size="sm"
                    className="flex-1 rounded-xl"
                  >
                    {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
                    {isConnecting ? "Connecting…" : "Start call"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={stopConversation}
                    variant="destructive"
                    size="sm"
                    className="flex-1 rounded-xl"
                  >
                    <PhoneOff className="h-4 w-4" /> End call
                  </Button>
                )}
                {transcript.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setTranscript([])}
                    title="Clear transcript"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export const VoiceAgentPanel: React.FC<Props> = (props) => (
  <ConversationProvider>
    <VoiceAgentPanelInner {...props} />
  </ConversationProvider>
);

export default VoiceAgentPanel;
