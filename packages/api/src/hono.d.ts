/**
 * Type declarations for Hono
 */

declare module "hono" {
  export interface Context<E = {}, P extends string = string, I = {}> {
    env: E extends { Bindings: infer B } ? B : Record<string, unknown>;
    req: HonoRequest<P, I>;
    get<
      K extends keyof (E extends { Variables: infer V }
        ? V
        : Record<string, unknown>),
    >(
      key: K,
    ): (E extends { Variables: infer V } ? V : Record<string, unknown>)[K];
    set<
      K extends keyof (E extends { Variables: infer V }
        ? V
        : Record<string, unknown>),
    >(
      key: K,
      value: (E extends { Variables: infer V }
        ? V
        : Record<string, unknown>)[K],
    ): void;
    json<T>(data: T, status?: number): Response;
    text(text: string, status?: number): Response;
    html(html: string, status?: number): Response;
    redirect(url: string, status?: number): Response;
    header(name: string, value: string): void;
    status(code: number): void;
    body(data: BodyInit | null, init?: ResponseInit): Response;
  }

  export interface HonoRequest<P extends string = string, I = {}> {
    param<K extends string>(key: K): string;
    query(key: string): string | undefined;
    queries(key: string): string[] | undefined;
    header(name: string): string | undefined;
    json<T = unknown>(): Promise<T>;
    text(): Promise<string>;
    arrayBuffer(): Promise<ArrayBuffer>;
    formData(): Promise<FormData>;
    blob(): Promise<Blob>;
    valid<K extends keyof I>(key: K): I[K];
    url: string;
    method: string;
    path: string;
    raw: Request;
  }

  export type Handler<
    E = {},
    P extends string = string,
    I = {},
    R = Response,
  > = (c: Context<E, P, I>) => R | Promise<R>;

  export type MiddlewareHandler<E = {}, P extends string = string, I = {}> = (
    c: Context<E, P, I>,
    next: () => Promise<void>,
  ) => Response | Promise<Response | void>;

  export class Hono<E = {}, S = {}, B extends string = "/"> {
    constructor(options?: { strict?: boolean });
    use<P extends string = "*">(
      path: P,
      ...handlers: MiddlewareHandler<E>[]
    ): this;
    use(...handlers: MiddlewareHandler<E>[]): this;
    get<P extends string>(path: P, ...handlers: Handler<E, P>[]): this;
    post<P extends string>(path: P, ...handlers: Handler<E, P>[]): this;
    put<P extends string>(path: P, ...handlers: Handler<E, P>[]): this;
    patch<P extends string>(path: P, ...handlers: Handler<E, P>[]): this;
    delete<P extends string>(path: P, ...handlers: Handler<E, P>[]): this;
    options<P extends string>(path: P, ...handlers: Handler<E, P>[]): this;
    all<P extends string>(path: P, ...handlers: Handler<E, P>[]): this;
    route<SubPath extends string, SubEnv>(
      path: SubPath,
      app: Hono<SubEnv>,
    ): this;
    basePath<SubPath extends string>(path: SubPath): Hono<E, S, SubPath>;
    onError(
      handler: (err: Error, c: Context<E>) => Response | Promise<Response>,
    ): this;
    notFound(handler: Handler<E>): this;
    fetch(
      request: Request,
      env?: E extends { Bindings: infer B } ? B : unknown,
      ctx?: ExecutionContext,
    ): Promise<Response>;
  }
}

declare module "hono/cors" {
  import type { MiddlewareHandler } from "hono";
  export function cors(options?: {
    origin?:
      | string
      | string[]
      | ((origin: string) => string | undefined | null);
    allowMethods?: string[];
    allowHeaders?: string[];
    exposeHeaders?: string[];
    maxAge?: number;
    credentials?: boolean;
  }): MiddlewareHandler;
}

declare module "hono/jwt" {
  import type { MiddlewareHandler, Context } from "hono";
  export function jwt(options: {
    secret: string;
    cookie?: string;
  }): MiddlewareHandler;
  export function sign(
    payload: Record<string, unknown>,
    secret: string,
  ): Promise<string>;
  export function verify<T = Record<string, unknown>>(
    token: string,
    secret: string,
  ): Promise<T>;
  export function decode<T = Record<string, unknown>>(
    token: string,
  ): { header: unknown; payload: T };
}
