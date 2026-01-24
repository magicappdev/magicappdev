# Agends.md - @magicappdev/llmchat

## Overview

The `@magicappdev/llmchat` package provides real-time AI chat capabilities within the MagicAppDev ecosystem, utilizing WebSockets and Cloudflare AI Gateway.

## Tech Stack

- **Framework**: WebSocket-based Workers
- **Runtime**: Cloudflare Workers
- **AI Integration**: Cloudflare AI Gateway
- **Streaming**: Server-Sent Events (SSE) / WebSocket streams
- **Language**: TypeScript

## Responsibilities

- Managing persistent AI chat sessions.
- Streaming real-time responses from LLMs to front-end clients.
- Integrating with AI Gateway for optimized routing and model selection.
- Serving as the core communication layer for the no-code AI assistant.

## Discord Bot Integration (Reference)

- **Interactions Endpoint**: https://nice-example.local/api/interactions
- **Linked Roles**: https://nice-example.local/verify-user
- **TOS**: https://my-cool-app.com/terms-of-service
- **Privacy**: https://my-cool-app.com/privacy-policy

## Implementation Steps & Progress

- [x] Basic chat structure and WebSocket handling.
- [x] Cloudflare AI Gateway integration.
- [x] Real-time streaming implementation.
- [ ] Add conversation context management and memory.
- [ ] Implement multi-model support switching in-chat.

## Usage Guidelines

- Deploy using Wrangler with the provided `wrangler.jsonc`.
- Monitor usage and routing via the Cloudflare AI Gateway dashboard.
- Use `packages/llmchat/test` for verifying chat logic.

## Next Steps

- Implement history persistence using Cloudflare D1.
- Add support for file/image uploads for visual context.
- Optimize streaming latency for better user experience.
