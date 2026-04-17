/**
 * Password strength policy — shared between client (UI indicator) and server (validation).
 *
 * Rules:
 *  - Minimum 8 characters
 *  - At least 1 uppercase letter
 *  - At least 1 lowercase letter
 *  - At least 1 number
 *
 * Score:
 *  0 = very weak / empty
 *  1 = weak
 *  2 = medium
 *  3 = strong
 *  4 = very strong (has special char + ≥12 chars)
 */

export type PasswordPolicyResult = {
  ok: boolean;
  message: string;
  score: 0 | 1 | 2 | 3 | 4;
  label: "muito fraca" | "fraca" | "média" | "forte" | "muito forte";
  issues: string[];
};

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export function validatePasswordStrength(password: string): PasswordPolicyResult {
  const issues: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    issues.push(`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`);
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    issues.push(`Máximo ${PASSWORD_MAX_LENGTH} caracteres`);
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUpper) issues.push("Pelo menos uma letra maiúscula");
  if (!hasLower) issues.push("Pelo menos uma letra minúscula");
  if (!hasNumber) issues.push("Pelo menos um número");

  // Compute score (informational, not used to block)
  let score: 0 | 1 | 2 | 3 | 4 = 0;
  if (password.length > 0) score = 1;
  if (hasUpper && hasLower) score = 2;
  if (hasUpper && hasLower && hasNumber) score = 3;
  if (hasUpper && hasLower && hasNumber && hasSpecial && password.length >= 12) score = 4;

  const labels: Record<number, PasswordPolicyResult["label"]> = {
    0: "muito fraca",
    1: "fraca",
    2: "média",
    3: "forte",
    4: "muito forte",
  };

  const ok = issues.length === 0;
  const message = ok
    ? "Senha OK"
    : `Senha fraca: ${issues.join(", ")}`;

  return { ok, message, score, label: labels[score], issues };
}
