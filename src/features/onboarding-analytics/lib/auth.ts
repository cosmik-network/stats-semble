import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

// Simple shared-password gate for the onboarding tab. Server-side only: the
// password never reaches the browser, and the cookie holds a derived token
// rather than the password itself.
const COOKIE_NAME = "onboarding_access";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function password(): string | undefined {
  return process.env.ONBOARDING_PASSWORD;
}

/**
 * Token stored in the cookie. Derived from the password, so rotating the env
 * var invalidates every existing cookie. Not a session system — it only proves
 * "this browser knew the password at some point".
 */
function expectedToken(secret: string): string {
  return createHmac("sha256", secret)
    .update("onboarding-access-v1")
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** True when the request carries a cookie matching the current password. */
export async function hasOnboardingAccess(): Promise<boolean> {
  const secret = password();
  // No password configured => tab is open (keeps local dev usable without setup).
  if (!secret) return true;

  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;

  return safeEqual(token, expectedToken(secret));
}

/** True when no password is configured, so the UI can skip the prompt entirely. */
export function isGateDisabled(): boolean {
  return !password();
}

/**
 * Verify a submitted password and, on success, set the access cookie.
 * Returns false on mismatch — the caller reports it, nothing is set.
 */
export async function grantOnboardingAccess(
  submitted: string,
): Promise<boolean> {
  const secret = password();
  if (!secret) return true;
  if (!safeEqual(submitted, secret)) return false;

  (await cookies()).set(COOKIE_NAME, expectedToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return true;
}

/** Clear the access cookie (sign out of the onboarding tab). */
export async function revokeOnboardingAccess(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
