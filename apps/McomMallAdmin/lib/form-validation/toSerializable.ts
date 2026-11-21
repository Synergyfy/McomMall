export interface SerializableResult<T = unknown> {
  /** A JSON-safe deep clone of the input. */
  value: T;
  /** Dot-paths of values that could not be serialized and were dropped. */
  dropped: string[];
}

/**
 * Deep-clones a value into something `JSON.stringify` can always handle.
 *
 * `JSON.stringify` reads `.toJSON` on every object it walks. If a `Window`
 * (especially a cross-origin frame handle) or a DOM node has leaked into the
 * data, that read throws a `SecurityError` and the whole request dies before
 * it is sent. This guard strips anything non-serializable (functions, symbols,
 * `Window`, DOM nodes, `File`/`Blob`, class instances) and reports the paths it
 * removed so the source can be fixed.
 *
 * Plain objects, arrays, primitives and `Date` are preserved.
 */
export function toSerializable<T = unknown>(input: unknown): SerializableResult<T> {
  const dropped: string[] = [];

  const walk = (value: unknown, path: string): unknown => {
    if (value === null) return null;

    const type = typeof value;
    if (type === "string" || type === "boolean") return value;
    if (type === "number") return Number.isFinite(value as number) ? value : null;
    if (type === "bigint") return Number(value as bigint);
    if (type === "undefined") return undefined; // omitted from objects, null in arrays
    if (type === "function" || type === "symbol") {
      dropped.push(path);
      return undefined;
    }

    // Dates -> ISO strings.
    try {
      if (value instanceof Date) return (value as Date).toISOString();
    } catch {
      dropped.push(path);
      return undefined;
    }

    // Binary data must be uploaded first; never send raw File/Blob.
    try {
      if (typeof File !== "undefined" && value instanceof File) {
        dropped.push(path);
        return undefined;
      }
      if (typeof Blob !== "undefined" && value instanceof Blob) {
        dropped.push(path);
        return undefined;
      }
    } catch {
      dropped.push(path);
      return undefined;
    }

    // Cross-origin Window/DOM handles throw on ANY property access — including
    // prototype lookups — so resolve the prototype defensively.
    let proto: object | null;
    try {
      proto = Object.getPrototypeOf(value);
    } catch {
      dropped.push(path);
      return undefined;
    }

    if (Array.isArray(value)) {
      const arr: unknown[] = [];
      (value as unknown[]).forEach((item, index) => {
        const result = walk(item, `${path}[${index}]`);
        arr.push(result === undefined ? null : result);
      });
      return arr;
    }

    // Only plain objects survive; Window, DOM nodes, Map/Set, class instances
    // (anything with a non-Object prototype) are dropped.
    if (proto !== Object.prototype && proto !== null) {
      dropped.push(path);
      return undefined;
    }

    const obj: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      let child: unknown;
      try {
        child = (value as Record<string, unknown>)[key];
      } catch {
        dropped.push(path ? `${path}.${key}` : key);
        continue;
      }
      const result = walk(child, path ? `${path}.${key}` : key);
      if (result !== undefined) obj[key] = result;
    }
    return obj;
  };

  return { value: walk(input, "$") as T, dropped };
}
