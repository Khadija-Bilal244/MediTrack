/**
 * In-memory OTP store
 * 
 * Structure: Map<userId_email, { code, expiresAt }>
 * Codes expire after 10 minutes.
 * No DB collection needed — if server restarts user just requests a new code.
 */

const store = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000;  // 10 minutes

/** Generate and store a 6-digit code for a given userId + email pair */
export const createOTP = (userId, email) => {
  const code      = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + OTP_EXPIRY_MS;
  const key       = `${userId}:${email.toLowerCase()}`;
  store.set(key, { code, expiresAt });
  return code;
};

/** Verify a code. Returns true and deletes it if valid, false otherwise. */
export const verifyOTP = (userId, email, inputCode) => {
  const key   = `${userId}:${email.toLowerCase()}`;
  const entry = store.get(key);

  if (!entry)                        return { valid: false, reason: "No code found. Please request a new one." };
  if (Date.now() > entry.expiresAt)  { store.delete(key); return { valid: false, reason: "Code has expired. Please request a new one." }; }
  if (entry.code !== inputCode.trim()) return { valid: false, reason: "Incorrect code. Please try again." };

  store.delete(key);   // one-time use
  return { valid: true };
};
