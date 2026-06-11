/**
 * Sanitizes text input to prevent false positives from the SQL injection middleware.
 * Removes or escapes patterns that could be mistakenly flagged as SQL injection
 * while preserving legitimate user input (e.g., addresses with "#" or "&").
 */

const SUSPICIOUS_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b\s+)/i,
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
  /(\b(OR|AND)\b\s+['"][^'"]*['"]\s*=\s*['"])/i,
  /(--|#|\/\*)/,
  /(;(\s|$))/,
  /(\b(xp_|sp_)\w+)/i,
];

export function sanitizeTextInput(value: string): string {
  if (!value) return value;

  let sanitized = value;

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      sanitized = sanitized.replace(pattern, (match) => {
        if (match.startsWith("--") || match.startsWith("#") || match.startsWith("/*")) {
          return match.replace(/-/g, "").replace("#", "").replace(/\//g, "");
        }
        if (match.includes(";")) {
          return match.replace(";", "");
        }
        return match;
      });
    }
  }

  return sanitized;
}

export function sanitizeFormValues<T extends Record<string, unknown>>(values: T): T {
  const sanitized = { ...values } as T;

  for (const key of Object.keys(sanitized) as Array<keyof T>) {
    const value = sanitized[key];
    if (typeof value === "string") {
      sanitized[key] = sanitizeTextInput(value) as T[typeof key];
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeFormValues(value as Record<string, unknown>) as T[typeof key];
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string"
          ? sanitizeTextInput(item)
          : item && typeof item === "object"
            ? sanitizeFormValues(item as Record<string, unknown>)
            : item
      ) as T[typeof key];
    }
  }

  return sanitized;
}
