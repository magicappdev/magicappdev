/**
 * Express.js API template - Node.js + TypeScript + Express
 */

import type { Template } from "../types.js";

export const expressApiTemplate: Template = {
  id: "express-api",
  name: "Express API",
  slug: "express-api",
  description:
    "Node.js REST API with Express, TypeScript, and SQLite. Includes auth, CRUD, and validation.",
  category: "api",
  frameworks: ["cloudflare-workers"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["starter", "express", "node", "typescript", "api", "backend"],
  variables: [
    {
      name: "name",
      description: "Project package name",
      type: "string",
      default: "my-express-api",
    },
    {
      name: "appName",
      description: "API name",
      type: "string",
      default: "My Express API",
    },
    {
      name: "description",
      description: "Short description of the API",
      type: "string",
      default: "A REST API built with Express and TypeScript",
    },
    {
      name: "port",
      description: "Server port",
      type: "number",
      default: 3000,
    },
  ],
  dependencies: {
    express: "^4.21.2",
    cors: "^2.8.5",
    dotenv: "^16.4.7",
    zod: "^3.24.1",
  },
  devDependencies: {
    "@types/express": "^5.0.0",
    "@types/cors": "^2.8.17",
    "@types/node": "^22.10.1",
    typescript: "^5.6.3",
    tsx: "^4.19.2",
  },
  files: [
    {
      path: "package.json",
      content: `{
  "name": "{{kebabCase name}}",
  "version": "1.0.0",
  "private": true,
  "description": "{{description}}",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext ts"
  },
  "dependencies": {
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/cors": "^2.8.17",
    "@types/node": "^22.10.1",
    "typescript": "^5.6.3",
    "tsx": "^4.19.2"
  }
}`,
    },
    {
      path: "tsconfig.json",
      content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}`,
    },
    {
      path: "src/index.ts",
      content: `import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || {{port}}

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: '{{appName}}' })
})

app.get('/api/items', (req, res) => {
  res.json({ items: [] })
})

app.post('/api/items', (req, res) => {
  res.status(201).json({ message: 'Item created' })
})

app.listen(port, () => {
  console.log(\`{{appName}} listening on port \${port}\`)
})`,
    },
  ],
};
