/**
 * Validation schemas for MagicAppDev platform
 */

// Config schemas
export {
  createProjectSchema,
  navigationSchema,
  projectConfigSchema,
  projectFrameworkSchema,
  projectManifestSchema,
  projectNameSchema,
  projectSlugSchema,
  projectStatusSchema,
  stateManagementSchema,
  stylingSchema,
  testingSchema,
  updateProjectSchema,
  type CreateProjectSchemaInput,
  type ProjectConfigSchemaInput,
  type ProjectConfigSchemaOutput,
  type ProjectManifestSchemaInput,
  type UpdateProjectSchemaInput,
} from "./config.schema";

// Auth schemas
export {
  emailSchema,
  loginSchema,
  passwordSchema,
  refreshTokenSchema,
  registerSchema,
  userNameSchema,
  type LoginInput,
  type RefreshTokenInput,
  type RegisterInput,
} from "./auth.schema";

// AI schemas
export {
  aiChatRequestSchema,
  aiMessageRoleSchema,
  aiMessageSchema,
  aiModelConfigSchema,
  aiProviderSchema,
  type AiChatRequestSchemaType,
  type AiMessageRoleSchemaType,
  type AiMessageSchemaType,
  type AiModelConfigSchemaType,
  type AiProviderSchemaType,
} from "./ai.schema";
