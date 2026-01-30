#!/bin/bash
set -e

echo "🚀 MagicAppDev development environment optimization..."

# Ensure we're in the right directory
cd /workspace

# Verify and configure pnpm
echo "📦 Configuring pnpm..."
corepack enable
corepack prepare pnpm@10.28.2 --activate
export PNPM_HOME="/root/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
export SHELL="/bin/bash"
# Configure pnpm for monorepo
pnpm config set store-dir /workspace/.pnpm-store
pnpm config set cache-dir /workspace/.pnpm-cache
# Create cache directories for pnpm
mkdir -p /workspace/.pnpm-store
mkdir -p /workspace/.pnpm-cache
PNPM_VERSION=$(pnpm --version)
echo "✅ pnpm version: $PNPM_VERSION"

# Set up git hooks if husky is configured
if [ -d ".husky" ] && [ -f "package.json" ]; then
    echo "🪝 Setting up git hooks..."
    pnpm prepare || echo "⚠️  Git hooks setup skipped (not in git repository)"
fi

# Install global dependencies if needed
echo "🔧 Installing global dependencies..."
pnpm install -g @expo/cli @expo/metro-config @kilocode/cli@next @google/gemini-cli@latest nx@latest @anthropic-ai/claude-code@latest

# Initialize Android SDK if needed
if [ ! -d "/usr/local/android-sdk" ]; then
    echo "📱 Setting up Android SDK..."
    mkdir -p /usr/local/android-sdk
    # Download and install Android SDK components
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
    unzip -q commandlinetools-linux-11076708_latest.zip -d /usr/local/android-sdk
    rm commandlinetools-linux-11076708_latest.zip
fi

# Optimize pnpm store permissions
echo "📁 Optimizing pnpm store permissions..."
chown -R root:root /root/.local/share/pnpm

# Create wrangler state directory
mkdir -p /workspace/.wrangler/state

# Initialize Expo cache directory
mkdir -p /workspace/.expo

# Set up health monitoring
echo "🏥 Setting up health monitoring..."
cat > /usr/local/bin/healthcheck << 'EOF'
#!/bin/bash
# Health check script for MagicAppDev dev container

# Check if required services are running
check_service() {
    local port=$1
    local service=$2

    if curl -f -s http://localhost:$port/ > /dev/null 2>&1; then
        echo "✅ $service is running on port $port"
        return 0
    else
        echo "❌ $service is not responding on port $port"
        return 1
    fi
}

# Check all services
check_service 3100 "Dev Server"
check_service 5173 "Webview UI"
check_service 8100 "Magic CLI"

# Check Node.js processes
if pgrep -f "node" > /dev/null; then
    echo "✅ Node.js processes are running"
else
    echo "❌ No Node.js processes found"
    exit 1
fi

# Check pnpm store
if [ -d "/root/.local/share/pnpm" ]; then
    echo "✅ pnpm store is available"
else
    echo "❌ pnpm store not found"
    exit 1
fi

exit 0
EOF

chmod +x /usr/local/bin/healthcheck

echo "✅ Development environment optimization complete!"
