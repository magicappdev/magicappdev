# Use official Node.js image (Debian-based for better compatibility with devcontainer features)
FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# Install system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    wget \
    libnotify-bin \
    build-essential \
    python3 \
    ca-certificates \
    gnupg \
    lsb-release \
    sudo \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Java (Temurin JDK 21) - specific for Ubuntu/Debian
RUN wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | gpg --dearmor | tee /etc/apt/trusted.gpg.d/adoptium.gpg > /dev/null \
    && echo "deb https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list \
    && apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install temurin-21-jdk \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# MAINTAINER MagicAppDev
LABEL   org.opencontainers.image.authors="MagicAppDev"\
        org.opencontainers.image.title="Magic App Dev Devcontainer"

# EXPOSE 3100 5173 8100 3030

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

# Install global tools
RUN npm install -g @expo/cli @expo/metro-config

# Set working directory
WORKDIR /workspace

# Create directories for persistent storage
RUN mkdir -p /root/.local/share/pnpm /root/.cache /workspace/.wrangler/state /usr/local/android-sdk /workspace/.expo

# Set environment variables
ENV NODE_ENV=development
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV JAVA_HOME="/usr/lib/jvm/temurin-21-jdk"
ENV ANDROID_HOME="/usr/local/android-sdk"

# Health check configuration
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3100/ || exit 1

# Default command
CMD ["bash"]
