import { BadRequestException } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { UserRole } from '../../common/role.enum';
import { ApprovalStatus } from '../../common/moderation/catalog-approval';

describe('VoucherService.createVoucherProduct', () => {
  const buildService = () => {
    const service = Object.create(VoucherService.prototype) as VoucherService;
    const save = jest.fn(async (value) => value);
    const repository = {
      create: jest.fn((value) => value),
      save,
    };
    (service as any).userRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'owner-1',
        role: UserRole.OWNER,
        isActive: true,
      }),
    };
    (service as any).voucherProductRepository = repository;
    return { service, repository };
  };

  it('rejects a voucher with no purchase amounts', async () => {
    const { service, repository } = buildService();

    await expect(
      service.createVoucherProduct('owner-1', {
        name: 'Amountless voucher',
        voucherType: 'gift_voucher',
        valueType: 'percentage',
        value: 10,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('creates an amount-based voucher and leaves it pending approval', async () => {
    const { service, repository } = buildService();

    const created = await service.createVoucherProduct('owner-1', {
      name: '£10 / £25 voucher',
      voucherType: 'gift_voucher',
      fixedAmounts: [10, 25],
      allowCustomAmount: false,
    } as any);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fixedAmounts: [10, 25],
        allowCustomAmount: false,
        valueType: 'fixed',
        value: 0,
        approvalStatus: ApprovalStatus.PENDING,
      }),
    );
    expect(repository.save).toHaveBeenCalled();
    expect(created).toBe(
      (repository.create as jest.Mock).mock.results[0].value,
    );
  });
});
