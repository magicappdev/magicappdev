/**
 * Encryption utility using Web Crypto API (AES-GCM)
 */

const ENC_ALGORITHM = "AES-GCM";

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret.padEnd(32, "0").slice(0, 32)),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("magicappdev-salt-v1"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ENC_ALGORITHM, length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptApiKey(
  plainText: string,
  secret?: string,
): Promise<string> {
  const encryptionSecret =
    secret || "ai-key-encryption-default-secret-key-32-chars";
  const key = await getCryptoKey(encryptionSecret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plainText);

  const cipherText = await crypto.subtle.encrypt(
    { name: ENC_ALGORITHM, iv },
    key,
    encoded,
  );

  const combined = new Uint8Array(iv.length + cipherText.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(cipherText), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decryptApiKey(
  cipherBase64: string,
  secret?: string,
): Promise<string> {
  const encryptionSecret =
    secret || "ai-key-encryption-default-secret-key-32-chars";
  const key = await getCryptoKey(encryptionSecret);

  const binaryString = atob(cipherBase64);
  const combined = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    combined[i] = binaryString.charCodeAt(i);
  }

  const iv = combined.slice(0, 12);
  const cipherText = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: ENC_ALGORITHM, iv },
    key,
    cipherText,
  );

  return new TextDecoder().decode(decrypted);
}
