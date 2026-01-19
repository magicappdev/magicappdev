# MagicAppDev Monorepo

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.0.0-orange.svg)

A comprehensive monorepo-based fullstack app building platform inspired by Expo, utilizing Turborepo for efficient monorepo management. MagicAppDev enables rapid development, customization, and deployment of apps across web and mobile platforms.

## Table of Contents

- [Project Title & Brief Description](#project-title--brief-description)
- [Key Features](#key-features)
- [Installation & Setup](#installation--setup)
- [Usage & Examples](#usage--examples)
- [Configuration & Customization](#configuration--customization)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing Guidelines](#contributing-guidelines)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [License & Attribution](#license--attribution)
- [Roadmap & Future Plans](#roadmap--future-plans)
- [Contact & Support](#contact--support)

## Project Title & Brief Description

**MagicAppDev** is a monorepo-based fullstack app building platform designed to streamline the development, customization, and deployment of web and mobile applications. It leverages Turborepo for efficient monorepo management and provides a suite of tools, including a CLI, web interface, mobile app, API, and database services.

### Target Audience

- Developers looking to rapidly build and deploy fullstack applications.
- Teams requiring a scalable and customizable platform for app development.
- Organizations needing seamless integration with AI-powered tools for code generation and error fixing.

## Key Features

- **Monorepo Structure**: Utilizes Turborepo with pnpm for package management, including local/remote caching, TypeScript, and Node.js/JS as preferred languages.
- **CLI Tool**: Generate and manage app code, components, and packages with ease.
- **Web Interface**: Interactive AI chat for app creation, hot reload preview, and prompt suggestions.
- **Mobile App**: React Native-based app with features mirroring the web interface.
- **API & Database**: Deployable to Cloudflare for backend services and database integration.
- **AI Integration**: AI-powered code generation, error fixing, and suggestions.
- **Extensibility**: Highly customizable with plugins and good debugging utilities.

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Git

### Step-by-Step Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/magicappdev/magicappdev.git
   cd magicappdev
   ```

2. **Install Dependencies**:

   ```bash
   pnpm install
   ```

3. **Set Up Environment Variables**:

   Create a `.env` file in the root directory and add the necessary environment variables. Refer to the [Configuration & Customization](#configuration--customization) section for details.

4. **Build the Project**:

   ```bash
   pnpm run build
   ```

### OS-Specific Notes

- **Windows**: Ensure that you have the latest version of Node.js and pnpm installed. Use PowerShell or Git Bash for running commands.
- **macOS/Linux**: Ensure that your system has the necessary permissions for installing global packages and running scripts.

## Usage & Examples

### CLI Tool

The CLI tool, `npx create-magicappdev-app`, allows you to generate and manage app code, components, and packages. Here are some examples:

- **Generate a New App**:

  ```bash
  npx create-magicappdev-app my-app
  ```

- **Generate a Component**:

  ```bash
  npx create-magicappdev-app generate component my-component
  ```

- **Run Doctor Command for Diagnostics**:

  ```bash
  npx create-magicappdev-app doctor
  ```

### Web Interface

The web interface is hosted at `*.magicappdev.workers.dev` (Cloudflare Workers). It provides an interactive AI chat for app creation, hot reload preview, and prompt suggestions.

### Mobile App

The mobile app is built using React Native and mirrors the features of the web interface. It includes optional packages like DevTools, Reanimated, Expo, Metro, and test setups.

## Configuration & Customization

### Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```env
NODE_ENV=development
API_KEY=your_api_key_here
DATABASE_URL=your_database_url_here
```

### Settings

- **CLI Settings**: Configure the CLI tool by modifying the `packages/cli/src/config.ts` file.
- **Web Interface Settings**: Configure the web interface by modifying the `apps/web/src/config.ts` file.
- **Mobile App Settings**: Configure the mobile app by modifying the `apps/mobile/src/config.ts` file.

## Project Structure

```plaintext
magicappdev/
├── .github/
├── .vscode/
├── apps/
│   ├── web/
│   └── mobile/
├── packages/
│   ├── cli/
│   ├── api/
│   ├── database/
│   ├── shared/
│   └── templates/
├── docs/
├── scripts/
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

### Key Directories and Files

- **`apps/web`**: Next.js-based web interface.
- **`apps/mobile`**: React Native-based mobile app.
- **`packages/cli`**: CLI tool for generating and managing app code.
- **`packages/api`**: API for backend services.
- **`packages/database`**: Database integration.
- **`packages/shared`**: Shared utilities and types.
- **`packages/templates`**: Templates for generating components and apps.

## API Documentation

### Endpoints

- **`GET /api/projects`**: Retrieve a list of projects.
- **`POST /api/projects`**: Create a new project.
- **`GET /api/projects/:id`**: Retrieve a specific project.
- **`PUT /api/projects/:id`**: Update a specific project.
- **`DELETE /api/projects/:id`**: Delete a specific project.

### Request/Response Examples

- **Create a Project**:

  ```bash
  curl -X POST https://api.magicappdev.workers.dev/projects \
    -H "Content-Type: application/json" \
    -d '{"name": "my-project", "description": "A new project"}'
  ```

  **Response**:

  ```json
  {
    "id": "123",
    "name": "my-project",
    "description": "A new project"
  }
  ```

### Authentication

Authentication is handled via API keys. Include your API key in the `Authorization` header:

```bash
Authorization: Bearer your_api_key_here
```

## Contributing Guidelines

### Submitting Issues

1. **Search Existing Issues**: Before submitting a new issue, search the [issue tracker](https://github.com/magicappdev/magicappdev/issues) to ensure it hasn't been reported already.
2. **Create a New Issue**: If the issue doesn't exist, create a new one with a clear title and description.

### Submitting Pull Requests

1. **Fork the Repository**: Fork the repository and create a new branch for your changes.
2. **Make Changes**: Implement your changes and ensure they adhere to the coding standards.
3. **Test Your Changes**: Run the test suite to ensure your changes don't break existing functionality.
4. **Submit a Pull Request**: Submit a pull request with a clear title and description of your changes.

### Coding Standards

- Follow the existing code style and conventions.
- Use TypeScript for type safety.
- Write clear and concise commit messages.

### Testing Protocols

- Ensure all tests pass before submitting a pull request.
- Write new tests for any new functionality.
- Update existing tests if necessary.

## Testing

### Running Tests

1. **Unit Tests**:

   ```bash
   pnpm run test:unit
   ```

2. **Integration Tests**:

   ```bash
   pnpm run test:integration
   ```

3. **End-to-End Tests**:

   ```bash
   pnpm run test:e2e
   ```

### Expected Outcomes

- All tests should pass without errors.
- Code coverage should meet the minimum threshold.

## Deployment

### Local Deployment

1. **Build the Project**:

   ```bash
   pnpm run build
   ```

2. **Start the Development Server**:

   ```bash
   pnpm run dev
   ```

### Staging Deployment

1. **Build the Project**:

   ```bash
   pnpm run build:staging
   ```

2. **Deploy to Staging**:

   ```bash
   pnpm run deploy:staging
   ```

### Production Deployment

1. **Build the Project**:

   ```bash
   pnpm run build:prod
   ```

2. **Deploy to Production**:

   ```bash
   pnpm run deploy:prod
   ```

### Docker Deployment

1. **Build the Docker Image**:

   ```bash
   docker build -t magicappdev .
   ```

2. **Run the Docker Container**:

   ```bash
   docker run -p 3000:3000 magicappdev
   ```

## Troubleshooting & FAQ

### Common Pitfalls

- **Dependency Issues**: Ensure all dependencies are installed correctly. Run `pnpm install` if you encounter dependency-related errors.
- **Environment Variables**: Double-check your `.env` file for missing or incorrect environment variables.
- **Build Errors**: Ensure your code adheres to the project's coding standards and TypeScript types.

### Error Messages and Solutions

- **`Error: Missing API Key`**: Ensure your `.env` file includes a valid `API_KEY`.
- **`Error: Database Connection Failed`**: Verify your `DATABASE_URL` in the `.env` file.
- **`Error: Build Failed`**: Check the console output for specific errors and address them accordingly.

### FAQ

**Q: How do I update the CLI tool?**

A: Run `pnpm update` to update all dependencies, including the CLI tool.

**Q: Can I use MagicAppDev with other package managers?**

A: MagicAppDev is optimized for pnpm, but you can use other package managers like npm or yarn with some adjustments.

**Q: How do I contribute to the project?**

A: Follow the [Contributing Guidelines](#contributing-guidelines) section for detailed instructions.

## License & Attribution

### License

MagicAppDev is licensed under the [MIT License](LICENSE).

### Attribution

- **Turborepo**: For efficient monorepo management.
- **pnpm**: For fast and disk-space-efficient package management.
- **Next.js**: For the web interface.
- **React Native**: For the mobile app.
- **Cloudflare**: For API and database hosting.

## Roadmap & Future Plans

### Upcoming Features

- **Plugin System**: Enhance extensibility with a plugin system.
- **Additional Templates**: Add more templates for generating components and apps.
- **Improved AI Integration**: Enhance AI-powered code generation and error fixing.

### Milestones

- **v1.0.0**: Initial release with core features.
- **v2.0.0**: Enhanced plugin system and additional templates.
- **v3.0.0**: Improved AI integration and performance optimizations.

### Known Limitations

- **Windows Support**: Some features may not work as expected on Windows due to path and permission issues.
- **Mobile App**: The mobile app is currently in beta and may have some bugs.

## Contact & Support

### Issue Tracker

For bug reports and feature requests, please use the [issue tracker](https://github.com/magicappdev/magicappdev/issues).

### Community Channels

- **Discord**: Join our [Discord server](https://discord.gg/magicappdev) for community support and discussions.
- **Slack**: Join our [Slack workspace](https://slack.magicappdev.com) for team collaboration.

### Maintainer Contact

For direct inquiries, you can contact the maintainer at [involvex](https://github.com/involvex).
