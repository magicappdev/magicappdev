/**
 * Authentication validation schemas
 */
import { z } from "zod";
/** Email schema */
export declare const emailSchema: z.ZodString;
/** Password schema */
export declare const passwordSchema: z.ZodString;
/** User name schema */
export declare const userNameSchema: z.ZodString;
/** Login request schema */
export declare const loginSchema: z.ZodObject<
  {
    email: z.ZodString;
    password: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    email: string;
    password: string;
  },
  {
    email: string;
    password: string;
  }
>;
/** Register request schema */
export declare const registerSchema: z.ZodObject<
  {
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    name: string;
    email: string;
    password: string;
  },
  {
    name: string;
    email: string;
    password: string;
  }
>;
/** Refresh token schema */
export declare const refreshTokenSchema: z.ZodObject<
  {
    refreshToken: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    refreshToken: string;
  },
  {
    refreshToken: string;
  }
>;
/** Inferred types */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
//# sourceMappingURL=auth.schema.d.ts.map
