import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

/**
 * Hashes a plaintext password using scrypt with a cryptographically secure random salt.
 * Returns a string formatted as: salt:derivedKeyHex.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }

  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return salt + ":" + derivedKey.toString("hex");
}

/**
 * Verifies a plaintext password against a stored salt:derivedKeyHex hash using constant-time comparison.
 */
export async function verifyPassword(
  password: string,
  storedHash: string | null | undefined
): Promise<boolean> {
  if (!password || !storedHash || typeof password !== "string" || typeof storedHash !== "string") {
    return false;
  }

  const parts = storedHash.split(":");
  if (parts.length !== 2) {
    return false;
  }

  const [salt, keyHex] = parts;
  if (!salt || !keyHex) {
    return false;
  }

  try {
    const keyBuffer = Buffer.from(keyHex, "hex");
    const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

    if (keyBuffer.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}