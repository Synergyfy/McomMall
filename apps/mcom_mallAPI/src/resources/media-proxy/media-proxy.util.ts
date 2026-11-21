const MAX_SEGMENTS = 6;

/**
 * Normalise a caller-supplied Central media path.
 *
 * Only generated upload filenames (`<uuid>.<ext>`) and optionally one folder
 * are allowed. Traversal, encoded separators and absolute paths are rejected
 * before anything is sent upstream.
 */
export function sanitiseMediaPath(relativePath: string): string | null {
  if (typeof relativePath !== 'string') return null;

  let decoded: string;
  try {
    decoded = decodeURIComponent(relativePath);
  } catch {
    return null;
  }

  const segments = decoded.split('/').filter(Boolean);
  if (!segments.length || segments.length > MAX_SEGMENTS) return null;

  for (const segment of segments) {
    if (segment === '.' || segment === '..') return null;
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(segment)) return null;
  }

  return segments.join('/');
}
