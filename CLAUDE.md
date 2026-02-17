# CLAUDE.md — La Famille AgentUI

## Overview
ChatGPT-like UI for chatting with AI agents via OpenAI-compatible APIs.
Built with Next.js 16, Tailwind CSS v4, shadcn/ui, Zustand.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 + shadcn/ui (New York)
- **State**: Zustand + persist middleware (localStorage)
- **Streaming**: SSE parser for OpenAI-compatible streaming
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Markdown**: react-markdown + remark-gfm + rehype-highlight

## Project Structure
- `src/types/` — TypeScript interfaces (Agent, Chat, Family, Backend)
- `src/config/presets/` — 5 preset agent configs (Maman, Henry, Sage, Nova, Blaise)
- `src/stores/` — Zustand stores (chat, agent, family, backend)
- `src/hooks/` — Custom hooks (useChat for streaming, useBackendHealth)
- `src/lib/` — API client, SSE parser, utilities
- `src/components/chat/` — Chat UI components
- `src/components/agents/` — Agent management components
- `src/components/families/` — Family management components
- `src/app/` — Next.js App Router pages

## Commands
```bash
pnpm dev          # Dev server (port 3000)
pnpm build        # Production build
pnpm lint         # ESLint
```

## Key Patterns
- All state persists to localStorage via Zustand `persist`
- Streaming via SSE: api-client returns Response, sse-parser yields chunks
- Dark-first theme: `html` has `className="dark"` by default
- Agent presets initialized on chat layout mount (idempotent)
- No backend required — pure frontend app

## API Integration
Connects to any OpenAI-compatible API (default: Family API on port 3100).
Models: maman, henry, sage, nova, blaise (or openclaw:maman etc.)
