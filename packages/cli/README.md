# MagicAppDev CLI

![npm version](https://img.shields.io/npm/v/@magicappdev/cli)
![npm downloads](https://img.shields.io/npm/dm/@magicappdev/cli)
![license](https://img.shields.io/npm/l/@magicappdev/cli)

A powerful CLI tool for creating and managing MagicAppDev applications. The MagicAppDev CLI simplifies the process of generating, customizing, and deploying fullstack apps across web and mobile platforms.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [Configuration](#configuration)
- [Features](#features)
- [Development](#development)
- [License](#license)
- [Troubleshooting](#troubleshooting)

## Installation

You can install the MagicAppDev CLI using npm, yarn, or pnpm:

```bash
# Using npm
npm install -g @magicappdev/cli

# Using yarn
yarn global add @magicappdev/cli

# Using pnpm
pnpm add -g @magicappdev/cli
```

For more details, visit the [npm page](https://www.npmjs.com/package/@magicappdev/cli).

## Usage

The CLI provides several commands to manage your MagicAppDev projects:

```bash
# Initialize a new MagicAppDev project
magicappdev init

# Authenticate with MagicAppDev
magicappdev auth

# Start an interactive chat session
magicappdev chat

# Generate components or apps
magicappdev generate <type> <name>

# Run diagnostics on your project
magicappdev doctor
```

## Commands

### `init`

Initialize a new MagicAppDev project in the current directory.

```bash
magicappdev init
```

### `auth`

Authenticate with MagicAppDev services.

```bash
magicappdev auth
```

### `chat`

Start an interactive chat session for app creation and management.

```bash
magicappdev chat
```

### `generate`

Generate components, apps, or other resources.

```bash
# Generate a new component
magicappdev generate component my-component

# Generate a new app
magicappdev generate app my-app
```

### `doctor`

Run diagnostics to check your project setup and configuration.

```bash
magicappdev doctor
```

## Configuration

### Environment Variables

You can configure the CLI using environment variables in a `.env` file:

```env
MAGICAPPDEV_API_KEY=your_api_key_here
MAGICAPPDEV_PROJECT_DIR=./my-project
```

### Config File

The CLI can also be configured using a `magicappdev.config.json` file:

```json
{
  "apiKey": "your_api_key_here",
  "projectDir": "./my-project",
  "defaultTemplate": "web"
}
```

## Features

- **Project Initialization**: Quickly set up new MagicAppDev projects.
- **Authentication**: Securely authenticate with MagicAppDev services.
- **Interactive Chat**: Use AI-powered chat for app creation and management.
- **Code Generation**: Generate components, apps, and other resources.
- **Diagnostics**: Run diagnostics to ensure your project is set up correctly.

## Development

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/magicappdev/magicappdev.git
   cd magicappdev
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build the CLI:

   ```bash
   cd packages/cli
   pnpm run build
   ```

4. Link the CLI for local development:

   ```bash
   pnpm link --global
   ```

### Running Tests

To run tests for the CLI:

```bash
pnpm run test
```

## License

MagicAppDev CLI is licensed under the [MIT License](LICENSE).

## Troubleshooting

### Common Issues

- **Command Not Found**: Ensure the CLI is installed globally and your PATH is set correctly.
- **Authentication Errors**: Verify your API key and environment variables.
- **Build Errors**: Check your Node.js and pnpm versions and ensure all dependencies are installed.

### FAQ

**Q: How do I update the CLI?**

A: Run `pnpm update -g @magicappdev/cli` to update to the latest version.

**Q: Can I use the CLI with npm or yarn?**

A: Yes, you can install the CLI using npm or yarn, but pnpm is recommended for optimal performance.

**Q: How do I report a bug?**

A: Please open an issue on our [GitHub repository](https://github.com/magicappdev/magicappdev/issues).
