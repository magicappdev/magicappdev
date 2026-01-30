# CI/CD Pipeline Management Skill

## Overview

This skill provides comprehensive capabilities for managing CI/CD pipelines, handling build flows, optimizing workflows with Git repositories, and integrating Cloudflare workflows within the MagicAppDev ecosystem. It enables automated testing, building, and deployment processes across the monorepo.

## Tech Stack

- **CI/CD**: GitHub Actions
- **Build System**: Turborepo + Nx hybrid
- **Package Management**: pnpm workspaces
- **Deployment**: Cloudflare Workers
- **Version Control**: Git with conventional commits
- **Testing**: Vitest, Playwright (planned)
- **Linting**: ESLint, Prettier
- **Type Checking**: TypeScript

## Capabilities

### 1. CI/CD Pipeline Management

- Configure GitHub Actions workflows for automated processes
- Set up multi-stage pipelines (lint, test, build, deploy)
- Implement environment-specific deployment strategies
- Configure secrets and environment variables securely
- Monitor and optimize pipeline performance

### 2. Build Flow Optimization

- Configure Turborepo for efficient monorepo builds
- Set up Nx for project-specific targets
- Implement caching strategies for faster builds
- Configure parallel build execution
- Optimize build artifacts and outputs

### 3. Git Workflow Management

- Implement conventional commits for consistent commit messages
- Set up commitlint for commit message validation
- Configure Git hooks with Husky
- Implement branch protection rules
- Set up pull request templates and workflows

### 4. Cloudflare Integration

- Configure Wrangler for Cloudflare Workers deployment
- Set up Cloudflare D1 database migrations
- Implement Cloudflare Pages deployment
- Configure Cloudflare Workers KV storage
- Manage Cloudflare environment variables

### 5. Testing & Quality Assurance

- Configure Vitest for unit testing
- Set up Playwright for E2E testing (planned)
- Implement test coverage reporting
- Configure linting with ESLint and Prettier
- Set up type checking with TypeScript

### 6. Deployment Automation

- Implement automated deployment workflows
- Configure rollback strategies
- Set up deployment notifications
- Implement deployment previews
- Configure production and staging environments

## Implementation Examples

### GitHub Actions CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test
```

### Turborepo Configuration

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "deploy": {
      "dependsOn": ["build", "test"],
      "outputs": []
    }
  }
}
```

### Cloudflare Workers Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Deploy to Cloudflare
        run: pnpm deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

## Best Practices

1. **Pipeline Design**: Keep CI/CD pipelines fast and efficient
2. **Caching**: Implement caching for dependencies and build outputs
3. **Security**: Always secure secrets and environment variables
4. **Testing**: Implement comprehensive testing at all levels
5. **Monitoring**: Monitor pipeline performance and failures
6. **Documentation**: Document all CI/CD processes and workflows

## Integration with MagicAppDev

- Use the monorepo structure for consistent CI/CD across packages
- Leverage Turborepo for efficient builds
- Integrate with Cloudflare Workers for deployment
- Follow the conventional commits standard
- Use the shared configuration files for consistency

## Next Steps

- Consolidate Nx and Turborepo build systems
- Implement E2E testing with Playwright
- Add automated mobile app deployment to CI/CD
- Set up deployment previews for pull requests
- Implement rollback strategies for production deployments

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Nx Documentation](https://nx.dev/getting-started/intro)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [MagicAppDev CI/CD Agents](Agents.md)
