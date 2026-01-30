# Web Development Skill - Cloudflare Workers SDK

## Overview

This skill provides comprehensive capabilities for developing web applications using the Cloudflare Workers SDK, Next.js, and related technologies within the MagicAppDev ecosystem. It enables the creation of modern, responsive web applications with serverless backend capabilities.

## Tech Stack

- **Framework**: Next.js with TypeScript
- **Runtime**: Cloudflare Workers / Pages
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI (Radix UI)
- **State Management**: React Context API
- **API Client**: Custom implementation with JWT support
- **Authentication**: GitHub OAuth
- **Real-time**: WebSocket connection for AI chat
- **Deployment**: Cloudflare Workers platform

## Capabilities

### 1. Next.js Application Development

- Set up Next.js applications with TypeScript
- Configure App Router and Pages Router
- Implement server-side rendering and static generation
- Set up API routes for backend services
- Configure middleware for request handling

### 2. Cloudflare Workers Integration

- Deploy Next.js applications to Cloudflare Pages
- Configure Wrangler for Cloudflare Workers
- Implement serverless functions with Workers
- Set up Cloudflare D1 database integration
- Configure Cloudflare KV storage

### 3. UI Development

- Create responsive layouts with Tailwind CSS
- Implement component-based architecture
- Build custom UI components with Shadcn/UI
- Implement theme-aware components
- Create accessible and user-friendly interfaces

### 4. Authentication & Security

- Implement GitHub OAuth authentication
- Set up JWT token management
- Configure secure API communication
- Implement session management
- Set up role-based access control

### 5. Real-time Features

- Implement WebSocket connections for real-time updates
- Create AI chat interfaces with streaming responses
- Handle real-time notifications
- Manage connection state and reconnection logic

### 6. Performance Optimization

- Implement code splitting and lazy loading
- Optimize bundle size and performance
- Configure caching strategies
- Implement image optimization
- Monitor and improve performance metrics

## Implementation Examples

### Next.js Page with API Integration

```typescript
// apps/web/src/pages/chat/page.tsx
import { useState, useEffect } from 'react';
import { useApiClient } from '@magicappdev/shared';
import { Button, Input } from '@/components/ui';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const apiClient = useApiClient();

  const sendMessage = async () => {
    const response = await apiClient.post('/ai/chat', { message: input });
    setMessages([...messages, { role: 'user', content: input }, response.data]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}
```

### Cloudflare Workers Configuration

```toml
# apps/web/wrangler.toml
name = "magicappdev-web"
main = "src/index.ts"
compatibility_date = "2025-10-08"

[site]
bucket = "./public"
entry-point = "workers-site"

[env.production]
workers_dev = false
route = "https://web.magicappdev.workers.dev/*"

[env.development]
workers_dev = true

[[d1_databases]]
binding = "DB"
database_name = "magicappdev-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### API Client Integration

```typescript
// apps/web/src/lib/api.ts
import { ApiClient } from "@magicappdev/shared";

const apiClient = new ApiClient({
  baseUrl:
    process.env.NEXT_PUBLIC_API_URL || "https://api.magicappdev.workers.dev",
  authToken: localStorage.getItem("token") || "",
  onTokenRefresh: newToken => {
    localStorage.setItem("token", newToken);
  },
});

export { apiClient };
```

## Best Practices

1. **Performance**: Optimize images and assets for web delivery
2. **Routing**: Use Next.js routing for consistent navigation
3. **Styling**: Implement responsive design with Tailwind CSS
4. **State Management**: Use React Context for global state when appropriate
5. **Testing**: Implement unit and integration tests for critical components
6. **Accessibility**: Ensure all components follow accessibility guidelines

## Integration with MagicAppDev

- Use `@magicappdev/shared` for shared utilities and API client
- Leverage `@magicappdev/templates` for consistent component generation
- Integrate with `@magicappdev/api` for backend services
- Follow the monorepo structure for code organization
- Use the shared configuration files for consistency

## Next Steps

- Setup E2E testing with Playwright
- Integrate with `@magicappdev/agent` for advanced scaffolding previews
- Add more comprehensive user settings and profile management
- Implement collaborative editing features
- Migrate fully to Cloudflare Workers (Next-on-Pages)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/UI Documentation](https://ui.shadcn.com/)
- [MagicAppDev Web Agents](apps/web/Agents.md)
