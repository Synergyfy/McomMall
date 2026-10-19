export interface ParsedApiError {
  /** Human friendly, single-line message suitable for a toast or banner. */
  general: string;
  /** Field path (dot notation) → message, for inline display next to inputs. */
  fields: Record<string, string>;
  /** True when the backend rejected the payload (or a form field is at fault). */
  isValidation: boolean;
  /** HTTP status code when available. */
  status?: number;
}

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';
const SERVER_MESSAGE = 'The server had a problem saving your data. Please try again in a moment.';
const NETWORK_MESSAGE = 'We could not reach the server. Check your connection and try again.';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * NestJS/class-validator typically reports messages like:
 *   "businessId must be a UUID"
 *   "name should not be empty"
 * We match the leading token against the caller-provided field whitelist so
 * the message can be pinned underneath the matching input. Without a
 * whitelist we never guess — the message stays general, which avoids
 * misreading things like "Network Error" as a field name.
 */
const extractFieldPath = (message: string, knownFields?: string[]): string | null => {
  if (!knownFields || knownFields.length === 0) return null;

  const firstToken = message.split(/\s+/)[0]?.replace(/[.,:]+$/, '');
  if (!firstToken) return null;

  const match = knownFields.find(
    (field) => field.toLowerCase() === firstToken.toLowerCase(),
  );
  return match ?? null;
};

const toMessageArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry)).filter((entry) => entry.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value];
  }
  return [];
};

/**
 * Normalises anything thrown by the API layer (axios error, zod error, plain
 * Error) into a predictable shape the forms can render gracefully.
 */
export function parseApiError(error: unknown, knownFields?: string[]): ParsedApiError {
  // zod errors (used as a defensive fallback if a schema leaks through).
  const maybeIssues = (error as { issues?: unknown })?.issues;
  if (Array.isArray(maybeIssues)) {
    const fields: Record<string, string> = {};
    for (const issue of maybeIssues as Array<{ path?: unknown[]; message?: string }>) {
      const path = (issue.path ?? []).map(String).join('.');
      if (path && !fields[path]) {
        fields[path] = issue.message ?? 'Invalid value';
      }
    }
    return {
      general: 'Please fix the highlighted fields and try again.',
      fields,
      isValidation: true,
    };
  }

  const axiosError = error as {
    message?: string;
    response?: { status?: number; data?: { message?: unknown; error?: unknown } };
  };

  const status = axiosError?.response?.status;
  const data = axiosError?.response?.data;

  const responseMessages = toMessageArray(data?.message);
  const messages = responseMessages.length > 0 ? responseMessages : toMessageArray(axiosError?.message);

  if (messages.length === 0) {
    const isNetwork = !axiosError?.response;
    return {
      general: isNetwork ? NETWORK_MESSAGE : status && status >= 500 ? SERVER_MESSAGE : DEFAULT_MESSAGE,
      fields: {},
      isValidation: false,
      status,
    };
  }

  const fields: Record<string, string> = {};
  const general: string[] = [];

  for (const message of messages) {
    const path = extractFieldPath(message, knownFields);
    if (path) {
      // Drop the leading field token for a cleaner inline message.
      const cleaned = message.replace(new RegExp(`^${escapeRegExp(path)}\\s*`), '').trim();
      fields[path] = fields[path] || cleaned || message;
    } else {
      general.push(message);
    }
  }

  const isValidation = status === 400 || status === 422 || Object.keys(fields).length > 0;

  const generalMessage =
    general.join(' ') ||
    (Object.keys(fields).length > 0
      ? 'Please fix the highlighted fields and try again.'
      : messages.join(' '));

  return { general: generalMessage, fields, isValidation, status };
}

/** Resolves a dot-path error message from a parsed API error. */
export function getFieldApiError(
  parsed: ParsedApiError | null | undefined,
  field: string,
): string | undefined {
  if (!parsed) return undefined;
  return parsed.fields[field];
}
