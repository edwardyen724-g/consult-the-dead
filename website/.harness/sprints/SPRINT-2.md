# Sprint 2: Interactive Chat + API Layer

## Objective
Build the streaming chat interface with Claude API integration, framework-specific system prompts, and session-based chat history. This is the core interactive experience.

## Features to Implement
1. **F2: Interactive Framework Chat** — Conversational interface where users engage with a selected framework. Minimal UI: text input at bottom, framework name + lens at top. No avatar, no fake typing animation. Responses stream in real-time.
2. **Chat API Route** — POST `/api/chat` accepts `{ frameworkSlug, messages[], userMessage }`, loads the framework's system prompt, calls Claude API with streaming, returns streamed response.
3. **F13: Session-Based Chat History** — Chat conversations persist in browser sessionStorage. User can scroll back through conversation. History cleared on tab close. No accounts required.
4. **Framework System Prompt Loading** — API route dynamically loads the framework JSON and converts it to a system prompt. Uses the `framework_to_system_prompt()` logic from the Python codebase, ported to TypeScript.
5. **Rate Limiting** — 10 chat messages per session. Gentle message when limit reached. Counter stored in sessionStorage.

## Success Criteria (Evaluator will verify these)
- [ ] Chat page renders for "The Innovator" with framework name and lens statement visible
- [ ] User can type a message and receive a streamed response from Claude API
- [ ] Response content reflects the framework's reasoning patterns (not generic AI)
- [ ] Chat history persists when navigating away and returning (within same session)
- [ ] At least 3 messages can be exchanged in sequence with maintained context
- [ ] Chat input is disabled with a message after 10 messages (rate limit)
- [ ] The chat UI is minimal: no avatars, no typing indicators, no unnecessary chrome
- [ ] Mobile responsive: chat works on 375px width with thumb-reachable input

## Technical Requirements
- Next.js Route Handler at `/api/chat` with streaming response
- `@anthropic-ai/sdk` for Claude API calls
- Framework JSON loaded from filesystem via `fs` (server-side only)
- System prompt generated from framework JSON (port the Python logic)
- `ANTHROPIC_API_KEY` read from environment variable
- Session history in `sessionStorage` (client-side)
- Streaming via ReadableStream or the Anthropic SDK's stream helper

## Design Requirements
- Chat messages: clean typography matching the article reading experience
- User messages: right-aligned or subtly differentiated
- Framework responses: left-aligned, rendered as Markdown (use react-markdown)
- Input: full-width text area at bottom, minimal border, placeholder "Ask The Innovator..."
- No chat bubbles — this should feel like a written exchange, not iMessage
- Framework name and one-line lens at top of chat, subtle, not competing with conversation

## Out of Scope
- "Ask This Mind About Anything" topic submission (Sprint 3)
- Article annotation layer (Sprint 3)
- Framework transparency panel (Sprint 3)
- Collision articles (Sprint 4)
- Multiple simultaneous chat sessions
- Saved chat history across browser sessions
