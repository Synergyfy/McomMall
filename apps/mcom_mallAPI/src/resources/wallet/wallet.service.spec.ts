import { WalletService } from './wallet.service';
import { McomWalletError } from '../payments/services/mcom-wallet.service';

describe('WalletService.getWalletDetails', () => {
  const userRepository = { findOne: jest.fn() };
  const mcomWalletService = {
    getTopUpUrl: jest.fn(() => 'http://central.test/dashboard/wallet'),
    isEnabled: jest.fn(() => false),
    getBalance: jest.fn(),
    getTransactions: jest.fn(),
  };

  let service: WalletService;

  beforeEach(() => {
    jest.clearAllMocks();
    mcomWalletService.getTopUpUrl.mockReturnValue(
      'http://central.test/dashboard/wallet',
    );
    mcomWalletService.isEnabled.mockReturnValue(false);

    service = new WalletService(
      {} as any, // walletRepository
      {} as any, // walletTransactionRepository
      {} as any, // withdrawalRepository
      userRepository as any,
      {} as any, // orderService
      {} as any, // giftCardService
      {} as any, // voucherService
      {} as any, // couponService
      {} as any, // bookingService
      {} as any, // paymentProviderService
      mcomWalletService as any,
      {} as any, // dataSource
    );
  });

  it('returns the central balance even when wallet payments are disabled', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 'mall-user-1',
      centralUserId: 'central-user-1',
    });
    mcomWalletService.getBalance.mockResolvedValue({
      success: true,
      balance: 250,
      availableBalance: 250,
      status: 'ACTIVE',
      currency: 'MCOM',
    });
    mcomWalletService.getTransactions.mockResolvedValue({ data: [] });

    const result = await service.getWalletDetails('mall-user-1');

    expect(result.success).toBe(true);
    expect(result.balance).toBe(250);
    expect(result.availableBalance).toBe(250);
    expect(result.status).toBe('ACTIVE');
    expect(result.centralWallet.enabled).toBe(false);
    expect(result.centralWallet.linked).toBe(true);
  });

  it('uses the JWT central user id when the database link is missing', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 'mall-user-1',
      centralUserId: null,
    });
    mcomWalletService.getBalance.mockResolvedValue({
      success: true,
      balance: 12.5,
      availableBalance: 12.5,
      status: 'ACTIVE',
      currency: 'MCOM',
    });
    mcomWalletService.getTransactions.mockResolvedValue({ data: [] });

    const result = await service.getWalletDetails(
      'mall-user-1',
      'central-user-from-jwt',
    );

    expect(mcomWalletService.getBalance).toHaveBeenCalledWith(
      'central-user-from-jwt',
    );
    expect(result.success).toBe(true);
    expect(result.balance).toBe(12.5);
  });

  it('surfaces an unavailable state instead of a fake zero when Central fails', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 'mall-user-1',
      centralUserId: 'central-user-1',
    });
    mcomWalletService.getBalance.mockRejectedValue(
      new McomWalletError('INVALID_SIGNATURE', 'Invalid HMAC signature', 401),
    );

    const result = await service.getWalletDetails('mall-user-1');

    expect(result.success).toBe(false);
    expect(result.status).toBe('UNAVAILABLE');
    expect(result.balance).toBeNull();
    expect(result.errorCode).toBe('INVALID_SIGNATURE');
    expect(result.centralWallet.linked).toBe(true);
  });

  it('returns an unlinked state when no central user id exists', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 'mall-user-1',
      centralUserId: null,
    });

    const result = await service.getWalletDetails('mall-user-1');

    expect(result.success).toBe(false);
    expect(result.status).toBe('UNLINKED');
    expect(result.balance).toBeNull();
    expect(result.errorCode).toBe('WALLET_NOT_LINKED');
    expect(result.centralWallet.linked).toBe(false);
    expect(mcomWalletService.getBalance).not.toHaveBeenCalled();
  });

  it('still returns the balance when the transaction ledger fails', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 'mall-user-1',
      centralUserId: 'central-user-1',
    });
    mcomWalletService.getBalance.mockResolvedValue({
      success: true,
      balance: 40,
      availableBalance: 30,
      status: 'ACTIVE',
      currency: 'MCOM',
    });
    mcomWalletService.getTransactions.mockRejectedValue(
      new McomWalletError('RATE_LIMITED', 'Too many requests', 429),
    );

    const result = await service.getWalletDetails('mall-user-1');

    expect(result.success).toBe(true);
    expect(result.balance).toBe(40);
    expect(result.availableBalance).toBe(30);
    expect(result.transactionHistory).toEqual([]);
    expect(result.transactionHistoryError).toBe('Too many requests');
  });
});
