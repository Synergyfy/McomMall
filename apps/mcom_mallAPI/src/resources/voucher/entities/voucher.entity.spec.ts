import { getMetadataArgsStorage } from 'typeorm';
import { Voucher } from './voucher.entity';

/**
 * Schema-contract guard.
 *
 * Partner-scoped instrument columns are snake_case in the database migration
 * (`business_id`, `issuance_id`, `source_app`). A camelCase drift here caused
 * `column Voucher.businessId does not exist` on every voucher creation, so
 * assert the entity maps to the migrated column names explicitly.
 */
describe('Voucher entity schema contract', () => {
  const columns = getMetadataArgsStorage().columns.filter(
    (column) => column.target === Voucher,
  );

  const columnName = (propertyName: string): string | undefined =>
    columns.find((column) => column.propertyName === propertyName)?.options.name;

  it('maps the business binding to the migrated business_id column', () => {
    expect(columnName('businessId')).toBe('business_id');
  });

  it('maps partner linkage columns to their migrated snake_case names', () => {
    expect(columnName('issuanceId')).toBe('issuance_id');
    expect(columnName('sourceApp')).toBe('source_app');
  });

  it('keeps the business relation joined on business_id', () => {
    const joinColumn = getMetadataArgsStorage().joinColumns.find(
      (join) => join.target === Voucher && join.propertyName === 'business',
    );
    expect(joinColumn?.name).toBe('business_id');
  });
});
