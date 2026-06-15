export const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 128,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /\d/,
  symbol: /[^a-zA-Z0-9]/,
};

const COMMON_PASSWORDS = new Set([
  "password", "12345678", "123456789", "1234567890", "qwerty123",
  "admin123", "letmein", "welcome1", "monkey123", "dragon123",
  "abc12345", "password1", "1234abcd", "passw0rd", "iloveyou",
  "sunshine1", "trustno1", "shadow123", "master123", "login123",
]);

export function checkPassword(password: string) {
  return [
    { label: "At least 8 characters", key: "min", met: password.length >= PASSWORD_RULES.minLength },
    { label: "One uppercase letter", key: "upper", met: PASSWORD_RULES.uppercase.test(password) },
    { label: "One lowercase letter", key: "lower", met: PASSWORD_RULES.lowercase.test(password) },
    { label: "One number", key: "digit", met: PASSWORD_RULES.digit.test(password) },
    { label: "One symbol", key: "symbol", met: PASSWORD_RULES.symbol.test(password) },
  ];
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const checks = checkPassword(password);
  const failed = checks.filter((c) => !c.met);
  const errors = failed.map((c) => c.label);
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push("This password is too common");
  }
  return { valid: errors.length === 0, errors };
}

export function isPwnedPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}
