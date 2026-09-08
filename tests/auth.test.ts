import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import {
  createSession,
  validateSessionToken,
  invalidateSession,
} from "../src/lib/auth/session";
import { prisma } from "../src/lib/prisma";

describe("Stage 9 Authentication & Session Architecture Tests", () => {
  describe("1. Password Hashing & Verification (Scrypt)", () => {
    it("should hash a password into salt:key format", async () => {
      const password = "superSecretPassword123!";
      const hash = await hashPassword(password);

      assert.ok(hash);
      const parts = hash.split(":");
      assert.equal(parts.length, 2, "Hash must contain salt and derived key separated by a colon");
      assert.equal(parts[0].length, 32, "Salt should be 16 bytes hex (32 chars)");
      assert.equal(parts[1].length, 128, "Key should be 64 bytes hex (128 chars)");
    });

    it("should generate distinct hashes for identical passwords due to random salts", async () => {
      const password = "consistentPassword99";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      assert.notEqual(hash1, hash2, "Different salts must produce different hash strings");
    });

    it("should verify valid passwords successfully", async () => {
      const password = "correctHorseBatteryStaple!";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      assert.equal(isValid, true, "Matching password must return true");
    });

    it("should reject incorrect passwords", async () => {
      const password = "correctPassword123";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword("wrongPassword123", hash);
      assert.equal(isValid, false, "Incorrect password must return false");
    });

    it("should handle empty, null, or malformed hashes gracefully", async () => {
      assert.equal(await verifyPassword("password", null), false);
      assert.equal(await verifyPassword("password", ""), false);
      assert.equal(await verifyPassword("password", "malformed_without_colon"), false);
      assert.equal(await verifyPassword("", "some:hash"), false);
    });
  });

  describe("2. Database Session Store & Lifecycle", () => {
    it("should create, validate, and invalidate a persistent session in PostgreSQL", async () => {
      const testEmail = `auth-test-${Date.now()}@unrot.test`;
      const passwordHash = await hashPassword("securePassword123");

      // 1. Create user with passwordHash
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          name: "Auth Test Learner",
          passwordHash,
        },
      });
      assert.ok(user.id);
      assert.equal(user.email, testEmail);

      // 2. Create session
      const token = await createSession(user.id);
      assert.ok(token);
      assert.equal(token.length, 64, "Token should be 32 bytes hex (64 chars)");

      // 3. Validate session
      const validatedUser = await validateSessionToken(token);
      assert.ok(validatedUser, "Validated user must be returned");
      assert.equal(validatedUser?.id, user.id);
      assert.equal(validatedUser?.email, testEmail);

      // 4. Invalidate session (logout)
      await invalidateSession(token);

      // 5. Verify invalidated session returns null
      const postInvalidateUser = await validateSessionToken(token);
      assert.equal(postInvalidateUser, null, "Invalidated session must return null");

      // 6. Cleanup test user (cascades to session)
      await prisma.user.delete({ where: { id: user.id } });
    });

    it("should reject expired sessions", async () => {
      const testEmail = `expired-test-${Date.now()}@unrot.test`;
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          name: "Expired Test User",
        },
      });

      // Create manually expired session
      const expiredToken = "expired_token_" + Date.now();
      await prisma.session.create({
        data: {
          userId: user.id,
          token: expiredToken,
          expiresAt: new Date(Date.now() - 10000), // Expired 10s ago
        },
      });

      const validatedUser = await validateSessionToken(expiredToken);
      assert.equal(validatedUser, null, "Expired session must evaluate to null");

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });
  });
});