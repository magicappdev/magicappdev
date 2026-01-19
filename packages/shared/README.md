# @magicappdev/shared

## Description

Shared utilities, types, and constants for MagicAppDev.

## Installation

```bash
npm install @magicappdev/shared
```

## Features

- **Utilities**: Logger, validation, string manipulation, and result handling.
- **Types**: API types, app types, CLI types, and common types.
- **Constants**: Defaults, errors, and paths.
- **Schemas**: AI schema, auth schema, and config schema.
- **Errors**: Base error handling.

## Usage

### Basic Setup

```typescript
import { logger, validate } from "@magicappdev/shared";

// Use the logger
logger.info("Application started");

// Validate data
const isValid = validate({ name: "John Doe" });
```

### Advanced Usage

```typescript
import { Result, stringUtils } from "@magicappdev/shared";

// Handle results
const result = new Result(true, "Success");
console.log(result.isSuccess());

// Use string utilities
const formatted = stringUtils.format("Hello, {0}!", "World");
```

## API Reference

### `logger`

- **Description**: Utility for logging messages.
- **Methods**:
  - `info(message: string)`: Logs an info message.
  - `error(message: string)`: Logs an error message.
  - `warn(message: string)`: Logs a warning message.

### `validate(data: any)`

- **Description**: Validates data using predefined schemas.
- **Parameters**:
  - `data`: Data to validate.
- **Returns**: Validation result.

### `Result`

- **Description**: Handles operation results.
- **Methods**:
  - `isSuccess()`: Checks if the result is successful.
  - `getMessage()`: Gets the result message.

### `stringUtils`

- **Description**: Utility for string manipulation.
- **Methods**:
  - `format(template: string, ...args: any[])`: Formats a string template.

## Examples

### Logging

```typescript
import { logger } from "@magicappdev/shared";

logger.info("Application started");
logger.error("An error occurred");
```

### Validation

```typescript
import { validate } from "@magicappdev/shared";

const data = { name: "John Doe", email: "john@example.com" };
const isValid = validate(data);
console.log(isValid);
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
