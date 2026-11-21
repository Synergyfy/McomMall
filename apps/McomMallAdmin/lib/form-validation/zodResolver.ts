import { toNestErrors } from '@hookform/resolvers';
import type {
  FieldErrors,
  FieldValues,
  Resolver,
  ResolverOptions,
  ResolverResult,
} from 'react-hook-form';
import type { ZodType } from 'zod';

/**
 * Zod → react-hook-form resolver.
 *
 * The `zodResolver` shipped with the currently pinned `@hookform/resolvers`
 * version reads `ZodError.errors`, which zod v4 removed in favour of
 * `ZodError.issues`. As a result validation *failures* are thrown instead of
 * being reported, so invalid forms silently never submit.
 *
 * This resolver reads `issues` (zod v3 + v4 compatible) and nests the errors
 * the way react-hook-form expects.
 */
export function zodResolver<TFieldValues extends FieldValues = FieldValues>(
  schema: ZodType,
  options?: { raw?: boolean },
): Resolver<TFieldValues, any> {
  return async (
    values,
    _context,
    resolverOptions: ResolverOptions<TFieldValues>,
  ): Promise<ResolverResult<TFieldValues>> => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return {
        values: (options?.raw ? values : result.data) as TFieldValues,
        errors: {},
      } as ResolverResult<TFieldValues>;
    }

    const flatErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const path = issue.path.map(String).join('.');
      // Keep the first error per field path, matching react-hook-form defaults.
      if (!path || flatErrors[path]) continue;
      flatErrors[path] = { type: issue.code, message: issue.message } as never;
    }

    return {
      values: {} as TFieldValues,
      errors: toNestErrors(flatErrors, resolverOptions),
    } as ResolverResult<TFieldValues>;
  };
}
