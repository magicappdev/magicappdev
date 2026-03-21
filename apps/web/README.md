# `@magicappdev/web`

## Environment

Copy `.env.example` to `.env` and set the public Vite variables the SPA reads:

```env
VITE_API_URL=http://localhost:8787
VITE_AGENT_URL=http://localhost:8788
```

The web app does **not** read OAuth client secrets or `JWT_SECRET`.
GitHub and Discord auth are handled by `@magicappdev/api`, which redirects the
browser back to the frontend after the provider callback succeeds.

## Auth configuration

Configure auth secrets in `packages/api`, not `apps/web`.

For local development, copy `packages/api/.env.example` to `packages/api/.env`
and provide real values for:

- `JWT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_REDIRECT_URI`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`
- `FRONTEND_URL`

For deployed Cloudflare Workers, keep public IDs and redirect URLs in
`packages/api/wrangler.toml`, and set sensitive values with `wrangler secret
put`, especially:

- `JWT_SECRET`
- `GITHUB_CLIENT_SECRET`
- `DISCORD_CLIENT_SECRET`
