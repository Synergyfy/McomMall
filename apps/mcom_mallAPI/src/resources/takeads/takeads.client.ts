import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { RawRecord } from './takeads.mapper';

type KeyType = 'platform' | 'account';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  key?: KeyType;
}

interface ListResponse {
  data?: RawRecord[];
  meta?: {
    next?: number | string | null;
    offset?: number | null;
    limit?: number | null;
    total?: number | null;
  };
}

@Injectable()
export class TakeadsClient {
  private readonly logger = new Logger(TakeadsClient.name);

  get baseUrl(): string {
    return (process.env.TAKEADS_API_BASE || 'https://api.takeads.com').replace(
      /\/$/,
      '',
    );
  }

  get platformKey(): string | undefined {
    return process.env.TAKEADS_PLATFORM_API_KEY || process.env.TAKEADS_KEY;
  }

  get accountKey(): string | undefined {
    return (
      process.env.TAKEADS_ACCOUNT_API_KEY ||
      process.env.TAKEADS_KEY ||
      process.env.TAKEADS_PLATFORM_API_KEY
    );
  }

  get isPlatformConfigured(): boolean {
    return Boolean(this.platformKey);
  }

  get isAccountConfigured(): boolean {
    return Boolean(this.accountKey);
  }

  get hasDedicatedAccountKey(): boolean {
    return Boolean(process.env.TAKEADS_ACCOUNT_API_KEY);
  }

  async listMerchants(
    query: Record<string, string | number | boolean | undefined | null> = {},
  ): Promise<ListResponse> {
    return this.request<ListResponse>(
      '/v1/product/monetize-api/v2/merchant',
      { query, key: 'platform' },
    );
  }

  async resolveLinks(
    iris: string[],
    subId?: string,
    withImages = true,
  ): Promise<ListResponse> {
    return this.request<ListResponse>(
      '/v1/product/monetize-api/v2/resolve',
      {
        method: 'PUT',
        body: { iris, subId, withImages },
        key: 'platform',
      },
    );
  }

  async listCoupons(
    query: Record<string, string | number | boolean | undefined | null> = {},
  ): Promise<ListResponse> {
    return this.request<ListResponse>(
      '/v1/product/monetize-api/v1/coupon',
      { query, key: 'platform' },
    );
  }

  async searchCoupons(body: Record<string, unknown>): Promise<ListResponse> {
    return this.request<ListResponse>(
      '/v1/product/monetize-api/v1/coupon/search',
      { method: 'POST', body, key: 'platform' },
    );
  }

  async recommendedCoupons(
    query: Record<string, string | number | boolean | undefined | null> = {},
  ): Promise<ListResponse> {
    return this.request<ListResponse>(
      '/v1/product/monetize-api/v1/coupon/recommended',
      { query, key: 'platform' },
    );
  }

  async clickReport(
    query: Record<string, string | number | boolean | undefined | null>,
  ): Promise<ListResponse> {
    return this.request<ListResponse>('/v2/api/stats/click', {
      query,
      key: 'account',
    });
  }

  async actionReport(
    query: Record<string, string | number | boolean | undefined | null>,
  ): Promise<ListResponse> {
    return this.request<ListResponse>('/v3/api/stats/action', {
      query,
      key: 'account',
    });
  }

  /** Fetch every page of a catalog endpoint, following `meta.next`. */
  async fetchAllMerchants(
    query: Record<string, string | number | boolean | undefined | null> = {},
    maxPages = 50,
  ): Promise<RawRecord[]> {
    const rows: RawRecord[] = [];
    let next: number | string | null | undefined;

    for (let page = 0; page < maxPages; page += 1) {
      const response = await this.listMerchants({
        ...query,
        next: next ?? undefined,
      });
      rows.push(...(response.data ?? []));
      next = response.meta?.next ?? null;
      if (next === null || next === undefined) break;
    }

    return rows;
  }

  async fetchAllCoupons(
    query: Record<string, string | number | boolean | undefined | null> = {},
    maxPages = 50,
  ): Promise<RawRecord[]> {
    const rows: RawRecord[] = [];
    let next: number | string | null | undefined;

    for (let page = 0; page < maxPages; page += 1) {
      const response = await this.listCoupons({
        ...query,
        next: next ?? undefined,
      });
      rows.push(...(response.data ?? []));
      next = response.meta?.next ?? null;
      if (next === null || next === undefined) break;
    }

    return rows;
  }

  async fetchAllActions(
    query: Record<string, string | number | boolean | undefined | null>,
    maxPages = 50,
  ): Promise<RawRecord[]> {
    const rows: RawRecord[] = [];
    let next: number | string | null | undefined;

    for (let page = 0; page < maxPages; page += 1) {
      const response = await this.actionReport({
        ...query,
        next: next ?? undefined,
      });
      rows.push(...(response.data ?? []));
      next = response.meta?.next ?? null;
      if (next === null || next === undefined) break;
    }

    return rows;
  }

  async fetchAllClickReports(
    query: Record<string, string | number | boolean | undefined | null>,
    maxPages = 50,
  ): Promise<RawRecord[]> {
    const rows: RawRecord[] = [];
    let offset = 0;
    const limit = 500;

    for (let page = 0; page < maxPages; page += 1) {
      const response = await this.clickReport({ ...query, offset, limit });
      const data = response.data ?? [];
      rows.push(...data);
      offset += data.length;
      const total = response.meta?.total;
      if (!data.length || (typeof total === 'number' && offset >= total)) break;
    }

    return rows;
  }

  private async request<T>(path: string, options: RequestOptions): Promise<T> {
    const key =
      options.key === 'account' ? this.accountKey : this.platformKey;
    if (!key) {
      throw new ServiceUnavailableException(
        `TakeAds ${options.key === 'account' ? 'account' : 'platform'} API key is not configured.`,
      );
    }

    const url = new URL(`${this.baseUrl}${path}`);
    for (const [name, value] of Object.entries(options.query ?? {})) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(name, String(value));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    try {
      const response = await fetch(url.toString(), {
        method: options.method ?? 'GET',
        headers: {
          Authorization: `Bearer ${key}`,
          Accept: 'application/json',
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      const text = await response.text();
      if (!response.ok) {
        this.logger.warn(
          `TakeAds ${options.method ?? 'GET'} ${path} failed with ${response.status}`,
        );
        throw new BadGatewayException(
          `TakeAds request failed with status ${response.status}${
            response.status === 401 || response.status === 403
              ? ' (check the API key and platform approval)'
              : ''
          }.`,
        );
      }

      if (!text) return {} as T;
      try {
        return JSON.parse(text) as T;
      } catch {
        throw new BadGatewayException('TakeAds returned a non-JSON response.');
      }
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      if (error instanceof ServiceUnavailableException) throw error;
      const message =
        error instanceof Error && error.name === 'AbortError'
          ? 'TakeAds request timed out.'
          : 'TakeAds request failed.';
      this.logger.error(
        `TakeAds ${options.method ?? 'GET'} ${path}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new BadGatewayException(message);
    } finally {
      clearTimeout(timeout);
    }
  }
}
