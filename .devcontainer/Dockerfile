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

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install global tools
RUN npm install -g turbo typescript

# Set working directory
WORKDIR /workspace/magicappdev

# Set environment variables
ENV NODE_ENV=development
ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Create pnpm directories and set permissions for the 'node' user
RUN mkdir -p /home/node/.local/share/pnpm \
    && chown -R node:node /home/node/.local

# Switch to non-root user 'node' (provided by the base image)
USER node
