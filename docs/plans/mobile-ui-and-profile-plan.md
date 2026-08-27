# Plan: Mobile UI & Profile Integration (Next Steps)

## Goals

1. **Improve Apps/Mobile UI**: Bring the Ionic/Expo mobile interface to a modern, polished dark mode standard matching the web app.
2. **Move Provider Settings to Main Settings Menu**: Relocate BYOK AI provider configuration from a separate hidden page into the standard mobile settings screen (`apps/mobile/src/screens/SettingsScreen.tsx` or equivalent).
3. **Integrate Web Profile Functionality into Mobile**: Add account management features such as updating username/avatar, viewing connected GitHub accounts, and password/session security settings.

---

## Proposed Implementation Steps

1. **Settings Submenu**: Update mobile settings screen to include an expandable or navigable "AI Provider Settings (BYOK)" card.
2. **Profile & Account Management**: Connect mobile settings inputs directly to API endpoints `/auth/me` and profile update routes.
3. **Styling & Theming**: Apply the shared theme constants (`@magicappdev/shared`) for consistent dark mode colors, typography, and spacing across all mobile screens.
