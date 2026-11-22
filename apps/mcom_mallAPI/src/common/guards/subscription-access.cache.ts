/**
 * Short-lived cache for subscription decisions.
 *
 * Kept in its own module (rather than on the guard) so the membership service
 * can invalidate it after a purchase/trial without importing the guard, which
 * would create a circular dependency.
 */
export class SubscriptionAccessCache {
  private static readonly cache = new Map<
    string,
    { result: boolean; timestamp: number }
  >();

  private static readonly TTL_MS = 5 * 60 * 1000;

  static get(key: string): boolean | null {
    const cached = SubscriptionAccessCache.cache.get(key);
    if (
      !cached ||
      Date.now() - cached.timestamp >= SubscriptionAccessCache.TTL_MS
    ) {
      return null;
    }
    return cached.result;
  }

  static set(key: string, result: boolean): void {
    SubscriptionAccessCache.cache.set(key, {
      result,
      timestamp: Date.now(),
    });
  }

  static clear(key?: string): void {
    if (key) {
      SubscriptionAccessCache.cache.delete(key);
    } else {
      SubscriptionAccessCache.cache.clear();
    }
  }
}
