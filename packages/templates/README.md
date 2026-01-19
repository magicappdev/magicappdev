# @magicappdev/templates

## Description

App templates and generators for MagicAppDev.

## Global Install

```bash
npm i -g @magicappdev/cli
createmagicapp <name> --template <template>
```

## Usage

```bash
npx @magicappdev/cli <appname>--template <template>
```

## Features

- **Templates**: Handlebars-based templates for apps, components, and screens.
- **Generators**: Template generation utilities.
- **Registry**: Template registry for management.

## Usage

### Basic Setup

```typescript
import { generateTemplate } from "@magicappdev/templates";

// Generate a template
generateTemplate("blank-app", { name: "MyApp" });
```

### Advanced Usage

```typescript
import { registry, generateComponent } from "@magicappdev/templates";

// Register a custom template
registry.addTemplate("custom-app", {
  /* template config */
});

// Generate a component
generateComponent("button", { label: "Click Me" });
```

## API Reference

### `generateTemplate(templateName: string, data: any)`

- **Description**: Generates a template based on the provided name and data.
- **Parameters**:
  - `templateName`: Name of the template to generate.
  - `data`: Data to use for template generation.
- **Returns**: Generated template.

### `registry`

- **Description**: Manages template registration and retrieval.
- **Methods**:
  - `addTemplate(name: string, config: any)`: Adds a template to the registry.
  - `getTemplate(name: string)`: Retrieves a template from the registry.

### `generateComponent(componentName: string, data: any)`

- **Description**: Generates a component based on the provided name and data.
- **Parameters**:
  - `componentName`: Name of the component to generate.
  - `data`: Data to use for component generation.
- **Returns**: Generated component.

## Examples

### Generating an App Template

```typescript
import { generateTemplate } from "@magicappdev/templates";

const appTemplate = generateTemplate("blank-app", { name: "MyApp" });
console.log(appTemplate);
```

### Generating a Component

```typescript
import { generateComponent } from "@magicappdev/templates";

const buttonComponent = generateComponent("button", { label: "Click Me" });
console.log(buttonComponent);
```

## Contribution Guidelines

### Reporting Issues

- Use the issue tracker to report bugs or suggest features.
- Provide detailed information and steps to reproduce.

### Submitting Pull Requests

- Fork the repository and create a feature branch.
- Ensure your code follows the project's coding standards.
- Submit a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
