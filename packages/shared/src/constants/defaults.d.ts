/**
 * Default configuration values
 */
import type { ProjectConfig, ProjectFramework } from "../types/index.js";
/** Default project framework */
export declare const DEFAULT_FRAMEWORK: ProjectFramework;
/** Default project configuration */
export declare const DEFAULT_PROJECT_CONFIG: ProjectConfig;
/** Default pagination */
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 100;
/** Default AI settings */
export declare const DEFAULT_AI_PROVIDER: "workers-ai";
export declare const DEFAULT_AI_TEMPERATURE = 0.7;
export declare const DEFAULT_AI_MAX_TOKENS = 4096;
/** Default timeouts (in milliseconds) */
export declare const DEFAULT_REQUEST_TIMEOUT = 30000;
export declare const DEFAULT_AI_TIMEOUT = 60000;
export declare const DEFAULT_DEPLOY_TIMEOUT = 300000;
/** Project name constraints */
export declare const PROJECT_NAME_MIN_LENGTH = 2;
export declare const PROJECT_NAME_MAX_LENGTH = 64;
export declare const PROJECT_SLUG_PATTERN: RegExp;
/** File size limits (in bytes) */
export declare const MAX_FILE_SIZE: number;
export declare const MAX_TEMPLATE_SIZE: number;
//# sourceMappingURL=defaults.d.ts.map
