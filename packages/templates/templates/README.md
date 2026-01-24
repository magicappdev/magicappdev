# MagicAppDev Templates

Shared templates for MagicAppDev projects.

## Structure

```
templates/
├── package.json.expo           # Expo package.json template
├── package.json.react-native  # React Native package.json template
├── .eslintrc.json              # ESLint configuration
├── .prettierrc.json            # Prettier configuration
├── jest.config.js              # Jest configuration
├── templates/
│   ├── blank/                  # Blank app template
│   │   ├── package.json.expo
│   │   ├── app.json
│   │   ├── tsconfig.json
│   │   └── ...
│   └── tabs/                   # Tabs navigation template
│       ├── package.json.expo
│       ├── app.json
│       ├── tsconfig.json
│       └── ...
```

## How it Works

Templates are stored as comment files with `/* {{variable}} */` syntax. When generating a project:

1. Download template file from GitHub
2. Replace `/* {{variable}} */` with actual values
3. Write to output directory

## Template Variables

- `{{name}}` - Project name
- `{{kebabCase name}}` - Project name in kebab-case
- `{{pascalCase name}}` - Project name in PascalCase
- `{{description}}` - Project description
- `{{framework}}` - Framework (expo, react-native)

## Adding New Templates

1. Copy an existing template folder
2. Update file contents with `/* {{variable}} */` placeholders
3. Push to this repository
4. CLI will automatically download and use the new template
