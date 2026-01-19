/**
 * Type declarations for CLI dependencies
 */

declare module "chalk" {
  interface Chalk {
    (text: string | number): string;
    bold: Chalk;
    dim: Chalk;
    italic: Chalk;
    underline: Chalk;
    inverse: Chalk;
    strikethrough: Chalk;
    visible: Chalk;
    black: Chalk;
    red: Chalk;
    green: Chalk;
    yellow: Chalk;
    blue: Chalk;
    magenta: Chalk;
    cyan: Chalk;
    white: Chalk;
    gray: Chalk;
    grey: Chalk;
    bgBlack: Chalk;
    bgRed: Chalk;
    bgGreen: Chalk;
    bgYellow: Chalk;
    bgBlue: Chalk;
    bgMagenta: Chalk;
    bgCyan: Chalk;
    bgWhite: Chalk;
    hex(color: string): Chalk;
    rgb(r: number, g: number, b: number): Chalk;
  }

  const chalk: Chalk;
  export default chalk;
}

declare module "commander" {
  export class Command {
    constructor(name?: string);
    name(str: string): this;
    alias(str: string): this;
    version(str: string, flags?: string, description?: string): this;
    description(str: string): this;
    argument(name: string, description?: string, defaultValue?: unknown): this;
    option(flags: string, description?: string, defaultValue?: unknown): this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action(fn: (...args: any[]) => void | Promise<void>): this;
    command(nameAndArgs: string, description?: string): Command;
    addCommand(cmd: Command): this;
    parse(argv?: string[]): this;
    parseAsync(argv?: string[]): Promise<this>;
    opts<T = Record<string, unknown>>(): T;
    args: string[];
  }

  export function program(): Command;
  const defaultProgram: Command;
  export { defaultProgram as program };
}

declare module "ora" {
  interface Ora {
    start(text?: string): Ora;
    stop(): Ora;
    succeed(text?: string): Ora;
    fail(text?: string): Ora;
    warn(text?: string): Ora;
    info(text?: string): Ora;
    text: string;
    color: string;
    isSpinning: boolean;
  }

  interface OraOptions {
    text?: string;
    spinner?: string | { interval: number; frames: string[] };
    color?: string;
    hideCursor?: boolean;
    indent?: number;
    interval?: number;
    stream?: NodeJS.WritableStream;
    isEnabled?: boolean;
    isSilent?: boolean;
  }

  function ora(options?: string | OraOptions): Ora;
  export default ora;
}

declare module "prompts" {
  interface PromptObject<T extends string = string> {
    type: string;
    name: T;
    message: string;
    initial?: unknown;
    choices?: Array<{ title: string; value: unknown; description?: string }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate?: (value: any) => boolean | string | Promise<boolean | string>;
    format?: (value: unknown) => unknown;
  }

  interface Answers<T extends string = string> {
    [key: string]: unknown;
  }

  function prompts<T extends string = string>(
    questions: PromptObject<T> | Array<PromptObject<T>>,
    options?: { onCancel?: () => void }
  ): Promise<Answers<T>>;

  export default prompts;
}

declare module "execa" {
  interface ExecaReturnValue {
    stdout: string;
    stderr: string;
    exitCode: number;
    command: string;
    escapedCommand: string;
    failed: boolean;
    timedOut: boolean;
    killed: boolean;
  }

  interface ExecaOptions {
    cwd?: string;
    env?: Record<string, string>;
    shell?: boolean | string;
    stdio?: "pipe" | "inherit" | "ignore";
    timeout?: number;
    reject?: boolean;
  }

  export function execa(
    file: string,
    args?: string[],
    options?: ExecaOptions
  ): Promise<ExecaReturnValue>;

  export function execaCommand(
    command: string,
    options?: ExecaOptions
  ): Promise<ExecaReturnValue>;

  export function execaSync(
    file: string,
    args?: string[],
    options?: ExecaOptions
  ): ExecaReturnValue;
}
