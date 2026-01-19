/**
 * Path constants for file system operations
 */

/** Configuration file names */
export const CONFIG_FILE_NAME = "magicappdev.json";
export const PACKAGE_JSON = "package.json";
export const TSCONFIG_JSON = "tsconfig.json";

/** Default directory names */
export const SRC_DIR = "src";
export const COMPONENTS_DIR = "components";
export const SCREENS_DIR = "screens";
export const HOOKS_DIR = "hooks";
export const LIB_DIR = "lib";
export const UTILS_DIR = "utils";
export const TYPES_DIR = "types";
export const API_DIR = "api";
export const ASSETS_DIR = "assets";
export const PUBLIC_DIR = "public";
export const DIST_DIR = "dist";
export const BUILD_DIR = "build";
export const NODE_MODULES = "node_modules";

/** Template directories */
export const TEMPLATES_DIR = "templates";
export const TEMPLATE_APPS_DIR = "apps";
export const TEMPLATE_COMPONENTS_DIR = "components";
export const TEMPLATE_SCREENS_DIR = "screens";

/** Cache and temporary directories */
export const CACHE_DIR = ".cache";
export const TEMP_DIR = ".tmp";
export const MAGICAPPDEV_DIR = ".magicappdev";

/** Common file patterns */
export const TS_FILE_PATTERN = "**/*.ts";
export const TSX_FILE_PATTERN = "**/*.tsx";
export const JS_FILE_PATTERN = "**/*.js";
export const JSX_FILE_PATTERN = "**/*.jsx";
export const JSON_FILE_PATTERN = "**/*.json";

/** Ignore patterns */
export const DEFAULT_IGNORE_PATTERNS = [
  NODE_MODULES,
  DIST_DIR,
  BUILD_DIR,
  ".git",
  ".next",
  ".expo",
  CACHE_DIR,
  "*.log",
];
