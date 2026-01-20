#!/bin/bash
set -e
export NODE_ENV="development"
export PNPM_HOME="/root/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

echo "🚀 MagicAppDev development environment..."

# Ensure we're in the right directory
cd /workspace/magicappdev

# Ensure pnpm is available and correct version
echo "📦 Configuring pnpm..."
corepack enable
corepack prepare pnpm@latest --activate

# Verify pnpm version
PNPM_VERSION=$(pnpm --version)
echo "✅ pnpm version: $PNPM_VERSION"

# Set up git hooks if husky is configured
if [ -d ".husky" ] && [ -f "package.json" ]; then
    echo "🪝 Setting up git hooks..."
    pnpm prepare || echo "⚠️  Git hooks setup skipped (not in git repository)"
fi

echo "✅ Development environment setup complete!"