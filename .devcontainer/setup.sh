#!/bin/bash
set -e

echo "🚀 MagicAppDev development environment optimization..."

# Ensure we're in the right directory
cd /workspace

# Verify and configure Bun
echo "📦 Configuring Bun..."
if ! command -v bun > /dev/null 2>&1; then
    curl -fsSL https://bun.sh/install | bash
fi
export BUN_INSTALL="/root/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
export SHELL="/bin/bash"
BUN_VERSION=$(bun --version)
echo "✅ bun version: $BUN_VERSION"

# Set up git hooks if husky is configured
if [ -d ".husky" ] && [ -f "package.json" ]; then
    echo "🪝 Setting up git hooks..."
    bun run prepare || echo "⚠️  Git hooks setup skipped (not in git repository)"
fi

# Install global dependencies if needed
echo "🔧 Installing global dependencies..."
bun install -g @expo/cli @expo/metro-config @kilocode/cli@next @google/gemini-cli@latest nx@latest @anthropic-ai/claude-code@latest

# Initialize Android SDK if needed
if [ ! -d "/usr/local/android-sdk" ]; then
    echo "📱 Setting up Android SDK..."
    mkdir -p /usr/local/android-sdk
    # Download and install Android SDK components
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
    unzip -q commandlinetools-linux-11076708_latest.zip -d /usr/local/android-sdk
    rm commandlinetools-linux-11076708_latest.zip
fi

# Optimize Bun cache permissions
echo "📁 Optimizing Bun cache permissions..."
chown -R root:root /root/.bun

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

# Check Bun installation
if command -v bun > /dev/null 2>&1; then
    echo "✅ Bun is available"
else
    echo "❌ Bun not found"
    exit 1
fi

exit 0
EOF

chmod +x /usr/local/bin/healthcheck

echo "✅ Development environment optimization complete!"
