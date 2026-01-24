/**
 * @magicappdev/templates
 *
 * App templates and generators for the MagicAppDev platform
 */

// Types
export type {
  GenerateOptions,
  GenerateResult,
  Template,
  TemplateCategory,
  TemplateFile,
  TemplateMetadata,
  TemplateVariable,
  TemplateVariableType,
} from "./types.js";

// Registry
export { registry, TemplateRegistry } from "./registry/index.js";

// Generators
export {
  generateApp,
  generateComponent,
  generateFromTemplate,
  generateScreen,
} from "./generators/index.js";

// Utilities
export {
  compileFilePath,
  compileTemplate,
  evaluateCondition,
  validateVariables,
} from "./utils/index.js";

// Built-in templates
export {
  builtInTemplates,
  buttonComponentTemplate,
  screenTemplate,
} from "./templates/index.js";

// Initialize registry with built-in templates
import { builtInTemplates } from "./templates/index.js";
import { registry } from "./registry/index.js";

registry.registerAll(builtInTemplates);
