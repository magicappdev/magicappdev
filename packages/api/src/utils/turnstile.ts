/**
 * Cloudflare Turnstile server-side verification
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verifies a Turnstile CAPTCHA token against the Cloudflare siteverify endpoint.
 * Returns true only when the challenge was solved successfully.
 */
export async function verifyTurnstile(
  token: string | undefined,
  secret: string | undefined,
): Promise<boolean> {
  if (!token || !secret) return false;

  const body = new URLSearchParams({ secret, response: token });
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body },
  );

  if (!res.ok) return false;
  const data: TurnstileVerifyResponse = await res.json();
  return data.success === true;
}
