/**
 * Get the encryption secret for AI key encryption/decryption.
 * Fails closed — throws if no secret is configured.
 * Prioritizes AI_KEY_ENCRYPTION_SECRET over JWT_SECRET.
 */
export function getEncryptionSecret(env: {
  AI_KEY_ENCRYPTION_SECRET?: string;
  JWT_SECRET?: string;
}): string {
  const secret = env.AI_KEY_ENCRYPTION_SECRET || env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "AI_KEY_ENCRYPTION_SECRET is not configured. Cannot encrypt or decrypt API keys without a valid encryption secret.",
    );
  }
  return secret;
}
