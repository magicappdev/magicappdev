# @magicappdev/database

## Description

Database utilities with Drizzle ORM for Cloudflare D1.

## Features

- **Drizzle ORM Integration**: Utilizes Drizzle ORM for database operations.
- **Cloudflare D1 Support**: Designed to work seamlessly with Cloudflare D1.
- **Schema Management**: Uses Drizzle Kit for schema management.

## Usage

### Basic Setup

```typescript
import { db } from "@magicappdev/database";

// Initialize the database
const database = db();

// Use the database for operations
database.query("SELECT * FROM users");
```

### Schema Management

```bash
# Generate schema
drizzle-kit generate

# Apply migrations
drizzle-kit migrate

# Open Drizzle Studio
drizzle-kit studio
```

## API Reference

### `db()`

- **Description**: Initializes the database connection.
- **Returns**: Database instance.

### `query(sql: string)`

- **Description**: Executes a SQL query.
- **Parameters**:
  - `sql`: SQL query string.
- **Returns**: Query result.

## Examples

### Querying Data

```typescript
import { db } from "@magicappdev/database";

const database = db();
const users = await database.query("SELECT * FROM users");
console.log(users);
```

### Inserting Data

```typescript
import { db } from "@magicappdev/database";

const database = db();
await database.query(
  'INSERT INTO users (name, email) VALUES ("John Doe", "john@example.com")',
);
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
