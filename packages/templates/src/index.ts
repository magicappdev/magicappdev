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
} from "./types";

// Registry
export { registry, TemplateRegistry } from "./registry";

// Generators
export {
  generateApp,
  generateComponent,
  generateFromTemplate,
  generateScreen,
} from "./generators";

// Utilities
export {
  compileFilePath,
  compileTemplate,
  evaluateCondition,
  validateVariables,
} from "./utils";

// Built-in templates
export {
  blankAppTemplate,
  builtInTemplates,
  buttonComponentTemplate,
  tabsAppTemplate,
} from "./templates";

// Initialize registry with built-in templates
import { registry } from "./registry";
import { builtInTemplates } from "./templates";

registry.registerAll(builtInTemplates);
