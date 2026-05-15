## Goal

Add a live **Conversational AI voice agent** to `/agent/powerpoint` so you can talk to it like a phone call — speak naturally, it replies in a real voice, you can interrupt mid-sentence, and it can optionally act on your deck (fill the topic, set tone, toggle brand, trigger generation).

## What you'll see

A new floating **"Talk to agent"** panel on the PowerPoint page (bottom-right, glassmorphic, dark mode). Click the mic orb → grants microphone → connects to ElevenLabs → starts a live conversation. While connected:

- A pulsing orb shows agent state: idle / listening / thinking / speaking
- Live transcript of what you said and what the agent said scrolls below
- Volume meter for input/output
- "End call" button to disconnect

The agent is briefed with the current page state (active brand, selected PDF source, selected pages, current topic/audience/slide-count form values) so it answers in context.

## Setup steps (one-time, in ElevenLabs dashboard)

You'll need to do this part — Lovable can't create the agent for you:

1. Sign up at elevenlabs.io (free tier covers ~10 min/month of conversation)
2. Go to **Conversational AI → Agents → Create Agent**
3. Paste the system prompt we provide ("You are EventKIT's PowerPoint deck design assistant…")
4. Pick a voice (Sarah / George / Brian — or any from their library)
5. **Enable "Overrides"** → check `firstMessage` and `prompt` (so we can inject your deck context per session)
6. **Add client tools** (if you want voice-controlled actions):
   - `setTopic(topic: string)`
   - `setAudience(audience: string)`
   - `setSlideCount(count: number)`
   - `setTone(tone: string)`
   - `toggleBrandStyle(enabled: boolean)`
   - `generateDeck()` — triggers the existing Generate button
7. Copy the **Agent ID** and **API Key** — paste them into Lovable when prompted

## Build steps

### 1. Secrets + edge function
- Request `ELEVENLABS_API_KEY` and `ELEVENLABS_POWERPOINT_AGENT_ID` as Lovable Cloud secrets
- New edge function `elevenlabs-conversation-token`: server-side, requires auth, calls ElevenLabs `/v1/convai/conversation/token` and returns a short-lived WebRTC token. Keeps the API key off the client.

### 2. Install SDK
- `bun add @elevenlabs/react`

### 3. New component: `src/components/powerpoint/VoiceAgentPanel.tsx`
- Uses `useConversation` hook from `@elevenlabs/react`
- Floating panel, dark glassmorphic, animated mic orb (Framer Motion pulse synced to `getOutputVolume()`)
- Handles mic permission with friendly prompt
- Wires `clientTools` to setters passed in as props (setTopic, setAudience, setSlideCount, setTone, setUseBrand, triggerGenerate)
- Uses `overrides.agent.firstMessage` to greet you with current context: *"Hi — I see you're working on a deck with the Acme brand and 4 PDF reference pages selected. What should we build?"*
- Uses `overrides.agent.prompt` to inject live deck state every session
- Shows scrolling transcript using `onMessage` events (`user_transcript`, `agent_response`)
- Toast on errors (rate limit, mic denied, quota exhausted)

### 4. Wire into PowerPointAgent.tsx
- Render `<VoiceAgentPanel />` at the bottom of the page
- Pass current state + setters as props
- Pass a `triggerGenerate` callback that calls the existing handle-submit logic

### 5. Memory
- Save a memory entry documenting the ElevenLabs voice agent integration so future sessions don't reinvent it

## Technical details

```text
┌──────────────────┐    WebRTC     ┌─────────────────────┐
│  VoiceAgentPanel │◄─────────────►│  ElevenLabs Convai  │
│  (browser)       │   audio+text  │  (managed agent)    │
└────────┬─────────┘               └─────────────────────┘
         │                                   ▲
         │ clientTools                       │ short-lived token
         │ (setTopic, setSlideCount,         │
         │  generateDeck, ...)               │
         ▼                                   │
┌──────────────────┐    invoke    ┌─────────────────────┐
│  PowerPointAgent │              │  edge function:     │
│  (form + deck)   │              │  elevenlabs-conv-   │
└──────────────────┘              │  token              │
                                  │  (uses              │
                                  │   ELEVENLABS_API_KEY)│
                                  └─────────────────────┘
```

- Connection type: **WebRTC** (lower latency than WebSocket, ~300ms)
- Server location: default global (we can switch to `eu-residency` if needed)
- Token endpoint requires Supabase JWT — no anonymous access
- Mic permission requested only when user clicks the orb (not on page load)

## Cost expectation

ElevenLabs Conversational AI: roughly **$0.08–0.10 per minute** of live conversation on the paid plan. Free tier gives ~10 min/month to test.

## Out of scope (can add later)

- Persisting transcripts to Supabase (currently in-memory per session)
- Voice-driven slide-by-slide editing inside a generated deck
- Multi-language support (default English; ElevenLabs supports 30+)
- Switching voices from inside the app (do it in ElevenLabs dashboard for now)

## What I'll need from you after approval

1. Confirm you've created the agent in ElevenLabs and have the **Agent ID** ready
2. Have your **ElevenLabs API key** ready to paste when Lovable prompts for it
3. Decide: enable voice-controlled actions (tool-calling) — yes or just discussion?

If you want, I can also ship a simpler "voice replies on text chat" version first (cheaper, no ElevenLabs agent setup needed) and layer the full Conversational AI on top later. Just say the word.
