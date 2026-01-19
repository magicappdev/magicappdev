# Based on flake.nix dependencies for standardized development environment

# Use official Node.js image matching .nvmrc version
FROM node:25-alpine

# Install system dependencies (matching flake.nix packages)
RUN apt-get update && apt-get install -y \
  git \
  curl \
  wget \
  libnotify-bin \
  build-essential \
  python3 \
  ca-certificates \
  gnupg \
  lsb-release \
  wget apt-transport-https gpg \
  sudo \
  && rm -rf /var/lib/apt/lists/*

RUN wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | gpg --dearmor | tee /etc/apt/trusted.gpg.d/adoptium.gpg > /dev/null
RUN echo "deb https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list
RUN apt update && apt install -y temurin-21-jdk
# Enable corepack for pnpm (matching package.json version)
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm add -g turbo typescript

# Set working directory
WORKDIR /workspace

# Set environment variables
ENV NODE_ENV=development
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Create pnpm directories
RUN mkdir -p /root/.local/share/pnpm

# Default command
CMD ["bash"]