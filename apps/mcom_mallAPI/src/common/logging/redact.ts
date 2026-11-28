const SENSITIVE_KEY_PATTERN =
  /pass(word|phrase)?|pwd|secret|token|api[-_]?key|private[-_]?key|credential|authorization|client[-_]?secret|refresh[-_]?token|access[-_]?token/i;

const REDACTED = '[REDACTED]';

/** Recursively mask secret-shaped fields before writing request bodies to logs. */
export function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactValue);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redactValue(nested),
      ]),
    );
  }

  return value;
}

/** Mask secret-shaped query parameters while preserving the rest of the URL. */
export function redactUrl(originalUrl: string): string {
  try {
    const url = new URL(originalUrl, 'http://local');
    for (const key of [...url.searchParams.keys()]) {
      if (SENSITIVE_KEY_PATTERN.test(key)) url.searchParams.set(key, REDACTED);
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return originalUrl;
  }
}
