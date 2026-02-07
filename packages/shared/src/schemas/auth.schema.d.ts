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
  z.core.$strip
>;
/** Register request schema */
export declare const registerSchema: z.ZodObject<
  {
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
  },
  z.core.$strip
>;
/** Refresh token schema */
export declare const refreshTokenSchema: z.ZodObject<
  {
    refreshToken: z.ZodString;
  },
  z.core.$strip
>;
/** Inferred types */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
//# sourceMappingURL=auth.schema.d.ts.map
