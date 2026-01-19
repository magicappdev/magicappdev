/**
 * Type declarations for handlebars
 *
 * This is a minimal declaration to satisfy TypeScript.
 * The actual types come from the handlebars package at runtime.
 */
declare module "handlebars" {
  type TemplateDelegate<T = unknown> = (
    context: T,
    options?: RuntimeOptions,
  ) => string;

  interface RuntimeOptions {
    data?: unknown;
    helpers?: Record<string, (...args: unknown[]) => unknown>;
    partials?: Record<string, TemplateDelegate>;
    decorators?: Record<string, (...args: unknown[]) => unknown>;
  }

  interface CompileOptions {
    data?: boolean;
    compat?: boolean;
    knownHelpers?: Record<string, boolean>;
    knownHelpersOnly?: boolean;
    noEscape?: boolean;
    strict?: boolean;
    assumeObjects?: boolean;
    preventIndent?: boolean;
    ignoreStandalone?: boolean;
    explicitPartialContext?: boolean;
  }

  function compile<T = unknown>(
    input: string,
    options?: CompileOptions,
  ): TemplateDelegate<T>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function registerHelper(name: string, fn: (...args: any[]) => any): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function registerHelper(
    helpers: Record<string, (...args: any[]) => any>,
  ): void;

  function registerPartial(
    name: string,
    partial: TemplateDelegate | string,
  ): void;
  function registerPartial(
    partials: Record<string, TemplateDelegate | string>,
  ): void;

  function unregisterHelper(name: string): void;
  function unregisterPartial(name: string): void;

  const helpers: Record<string, (...args: unknown[]) => unknown>;
  const partials: Record<string, TemplateDelegate>;

  export {
    compile,
    registerHelper,
    registerPartial,
    unregisterHelper,
    unregisterPartial,
    helpers,
    partials,
    TemplateDelegate,
    RuntimeOptions,
    CompileOptions,
  };

  export default {
    compile,
    registerHelper,
    registerPartial,
    unregisterHelper,
    unregisterPartial,
    helpers,
    partials,
  };
}
