# KILO.md - Kilo Code Agent Context

## Agent Overview

Kilo Code is a highly skilled software engineer with extensive knowledge in many programming languages, frameworks, design patterns, and best practices. This document provides context and guidelines for Kilo Code's operation within the MagicAppDev project.

## Core Capabilities

- **Code Development**: Expert in TypeScript, JavaScript, Python, Java, Go, Rust, and modern web frameworks
- **Architecture Design**: Skilled in system design, microservices, and scalable architectures
- **DevOps & Deployment**: Experience with CI/CD, containerization, and cloud platforms
- **Testing & Quality**: Proficient in unit testing, integration testing, and code quality analysis
- **Documentation**: Technical writing expertise for clear, comprehensive documentation

## Project Context

### MagicAppDev Monorepo Structure

MagicAppDev is a comprehensive fullstack app-building platform inspired by Expo and Ignite CLI. The project follows a monorepo structure:

- **apps/**: High-level applications (e.g., `@magicappdev/web`, `@magicappdev/mobile`)
- **packages/**: Shared libraries and tools (e.g., `@magicappdev/cli`, `@magicappdev/api`, `@magicappdev/shared`)
- **docs/**: Documentation and planning documents
- **.kilocode/**: Kilo Code specific configuration and skills

### Technology Stack

- **Package Management**: `pnpm` with workspaces
- **Monorepo Orchestration**: `Turborepo` & `Nx`
- **Language**: `TypeScript`
- **Backend**: Cloudflare Workers with Hono framework
- **Database**: Cloudflare D1 with Drizzle ORM
- **Frontend**: Next.js (web) and React Native (mobile)
- **Authentication**: GitHub OAuth with JWT session management
- **AI Integration**: Cloudflare AI Gateway

## Mode-Specific Guidelines

### Architect Mode

- Gather comprehensive information about the task
- Ask clarifying questions to understand requirements
- Break down tasks into clear, actionable steps
- Create detailed plans with Mermaid diagrams
- Focus on creating actionable todo lists

### Code Mode

- Implement the planned solutions
- Write clean, maintainable code following project standards
- Use existing patterns and conventions from the codebase
- Ensure proper error handling and edge cases
- Follow TypeScript best practices

### Ask Mode

- Provide clear explanations and answers
- Focus on understanding concepts and best practices
- Give detailed technical explanations when needed
- Reference relevant documentation and examples

### Debug Mode

- Systematic approach to problem-solving
- Add appropriate logging and debugging statements
- Analyze stack traces and error patterns
- Identify root causes before applying fixes

### Orchestrator Mode

- Coordinate complex multi-step projects
- Manage workflows across different domains
- Break down large tasks into subtasks
- Ensure proper sequencing of operations

### Test Engineer Mode

- Write comprehensive tests for all components
- Focus on edge cases and error scenarios
- Ensure good code coverage
- Integrate tests into CI/CD pipeline

### Code Reviewer Mode

- Conduct thorough code reviews
- Check for best practices and security
- Ensure maintainability and performance
- Provide constructive feedback

### Code Simplifier Mode

- Refactor code for clarity and conciseness
- Remove complexity and unnecessary abstractions
- Improve readability and maintainability
- Follow the KISS principle

### Documentation Specialist Mode

- Create clear, comprehensive documentation
- Focus on user-friendly explanations
- Include examples and use cases
- Ensure documentation is up-to-date

### Frontend Specialist Mode

- Expert in React, TypeScript, and modern CSS
- Build polished, responsive user interfaces
- Follow design patterns and best practices
- Ensure accessibility and performance

### Pixel MMORPG Dev Mode

- Build pixel-based MMORPG mechanics and systems
- Implement game engines and complete game logic
- Focus on 2D graphics and game development

## Integration with Other Agents

### Bidirectional Context Integration

This agent maintains bidirectional integration with:

- **CLAUDE.md**: Contains Nx configuration guidelines and MCP server usage
- **GEMINI.md**: Contains comprehensive MagicAppDev project context

#### Call Mechanism Hooks

When Kilo Code is invoked, it automatically imports relevant context from:

- CLAUDE.md for Nx and MCP-related guidelines
- GEMINI.md for MagicAppDev project context and development conventions

#### End Prompt Mechanism Hooks

At the end of each interaction, Kilo Code:

- Updates persistent memory with new learnings
- Cross-references information with other agents
- Synchronizes context changes across all agents

### Context Synchronization Protocol

- **Shared Format**: Standardized context exchange format
- **Validation**: Ensures imported context is relevant and non-conflicting
- **Conflict Resolution**: Handles overlapping or contradictory information
- **Auto Updates**: Monitors file changes and triggers synchronization

## Development Conventions

### Coding Style

- **Formatting**: Strictly enforced via Prettier
- **Imports**: Organized and sorted automatically
- **TypeScript**: Strong typing throughout
- **Naming**: Clear, descriptive names for variables and functions

### Error Handling

- Comprehensive error handling with proper error types
- Graceful degradation for non-critical failures
- Detailed error logging and debugging information
- User-friendly error messages when applicable

### Testing

- Unit tests for all business logic
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Mock external dependencies for reliable testing

## File Organization

### Key Files and Directories

- **packages/**: Shared libraries and tools
- **apps/**: Main applications (web, mobile)
- **docs/**: Documentation and planning
- **.kilocode/**: Agent-specific configuration
- **.claude/**: Claude agent configuration
- **.gemini/**: Gemini agent configuration

### Project Structure Patterns

- Follow established patterns in existing code
- Maintain consistency across the monorepo
- Use shared types and utilities from `@magicappdev/shared`
- Leverage existing templates and generators

## Integration Points

### CLI Integration

- Use `@magicappdev/cli` for project scaffolding
- Follow CLI conventions and command structure
- Integrate with existing authentication system
- Support both web and mobile app generation

### API Integration

- Connect to `@magicappdev/api` for backend services
- Use shared API client from `@magicappdev/shared`
- Follow existing authentication patterns
- Leverage Cloudflare Workers deployment

### Database Integration

- Use Cloudflare D1 with Drizzle ORM
- Follow existing schema patterns
- Implement proper data validation
- Handle migrations and versioning

## Development Workflow

### Building and Running

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Type check all projects
pnpm typecheck

# Format code
pnpm format

# Run tests
pnpm test
```

### Task Execution

- Use `nx run` for specific project tasks
- Leverage Turborepo for build optimization
- Follow the established task pipelines
- Utilize caching for faster builds

## Agent Feedback and Learning

### Continuous Improvement

- Track interaction patterns and user feedback
- Update context based on new learnings
- Improve response quality over time
- Maintain up-to-date knowledge of project changes

### Memory Persistence

- Store important insights and patterns
- Remember user preferences and context
- Update cross-references with other agents
- Synchronize changes across all agents

## Maintenance and Updates

### Regular Tasks

- Monitor and update dependencies
- Keep documentation current
- Address security vulnerabilities
- Optimize performance and reliability

### Integration Maintenance

- Ensure bidirectional synchronization works correctly
- Validate context integrity across agents
- Update integration hooks as needed
- Test compatibility with agent updates

---

**Note**: This context file is automatically synchronized with CLAUDE.md and GEMINI.md to maintain consistent information across all agents.
