# MagicAppDev Enhancement Plan

## 1. Feature Development

- [ ] **Mobile Chat UI**: Implement a fully functional chat interface in `apps/mobile` similar to the web version, using `react-native-gifted-chat` or custom UI.
- [ ] **Project Dashboard**: Enhance the web dashboard to list projects, show status, and allow basic management (delete, rename).
- [ ] **Template Gallery**: Create a visual gallery of available templates in the web app.

## 2. CI/CD & DevOps

- [ ] **GitHub Actions**: Refine the `.github/workflows/ci.yml` to run tests and linting on every push.
- [ ] **Auto-Deploy**: Set up a workflow to automatically deploy `packages/api` and `apps/web` to Cloudflare on merge to main.
- [ ] **Database Migrations**: Automate D1 migrations in the CD pipeline.

## 3. Agent Enhancements

- [ ] **Feature Suggester**: Connect `FeatureSuggester` to the `apps/web` dashboard to proactively suggest features for user projects.
- [ ] **Code Generation**: Allow `MagicAgent` to generate downloadable code snippets (zip/tar) for suggested templates.
- [ ] **Context Awareness**: Improve agent's knowledge by feeding it the `TODO.md` and `Plan.md` content dynamically.

## 4. Documentation & Polish

- [ ] **API Docs**: Generate OpenAPI spec for the backend.
- [ ] **Landing Page**: Polish the landing page with better copy and visuals (using the generated logo).
