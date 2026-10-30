/**
 * Marks an entity as an idempotent replay so the controller can return `200`
 * instead of `201`. Non-enumerable so it never leaks into API responses or
 * database payloads.
 */
export function markReplayed<T extends object>(entity: T): T {
  Object.defineProperty(entity, '__replayed', {
    value: true,
    enumerable: false,
    configurable: true,
  });
  return entity;
}

export function isReplayed(entity: unknown): boolean {
  return !!(entity as any)?.__replayed;
}
