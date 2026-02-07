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
} from "./config.schema";
// Auth schemas
export {
  emailSchema,
  loginSchema,
  passwordSchema,
  refreshTokenSchema,
  registerSchema,
  userNameSchema,
} from "./auth.schema";
// AI schemas
export {
  aiChatRequestSchema,
  aiMessageRoleSchema,
  aiMessageSchema,
  aiModelConfigSchema,
  aiProviderSchema,
} from "./ai.schema";
