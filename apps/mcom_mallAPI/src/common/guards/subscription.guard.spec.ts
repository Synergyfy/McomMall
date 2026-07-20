import { SubscriptionGuard } from './subscription.guard';
import { McomCentralService } from '../../resources/sso/mcom-central.service';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('SubscriptionGuard', () => {
  let guard: SubscriptionGuard;
  let mockMcomCentralService: jest.Mocked<McomCentralService>;
  let mockReflector: jest.Mocked<Reflector>;

  const mockRequest = (userId?: string) =>
    ({
      user: userId ? { id: userId, userId } : undefined,
    }) as any;

  const mockExecutionContext = (req: any, requireSubscription = true) => {
    mockReflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === 'requireSubscription') return requireSubscription;
      return undefined;
    });

    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    SubscriptionGuard['cache'] = new Map();

    mockMcomCentralService = {
      getUserPackages: jest.fn(),
    } as any;

    mockReflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    guard = new SubscriptionGuard(mockReflector, mockMcomCentralService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when requireSubscription is not set', async () => {
    const context = mockExecutionContext(mockRequest('user-1'), false);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should deny access when user is not authenticated', async () => {
    const context = mockExecutionContext(mockRequest());

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow access when subscription is active', async () => {
    mockMcomCentralService.getUserPackages.mockResolvedValue({
      tierId: 'tier-1',
      isActive: true,
      packages: [],
    });

    const context = mockExecutionContext(mockRequest('user-1'));

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockMcomCentralService.getUserPackages).toHaveBeenCalledWith('user-1');
  });

  it('should deny access when subscription is inactive', async () => {
    mockMcomCentralService.getUserPackages.mockResolvedValue({
      tierId: null,
      isActive: false,
      packages: [],
    });

    const context = mockExecutionContext(mockRequest('user-1'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should deny access when getUserPackages returns null', async () => {
    mockMcomCentralService.getUserPackages.mockResolvedValue(null);

    const context = mockExecutionContext(mockRequest('user-1'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should cache subscription status for 5 minutes', async () => {
    mockMcomCentralService.getUserPackages.mockResolvedValue({
      tierId: 'tier-1',
      isActive: true,
      packages: [],
    });

    const context = mockExecutionContext(mockRequest('user-1'));

    // First call
    await guard.canActivate(context);
    expect(mockMcomCentralService.getUserPackages).toHaveBeenCalledTimes(1);

    // Second call should use cache
    await guard.canActivate(context);
    expect(mockMcomCentralService.getUserPackages).toHaveBeenCalledTimes(1);
  });

  it('should deny access from cache when subscription was inactive', async () => {
    mockMcomCentralService.getUserPackages.mockResolvedValue({
      tierId: null,
      isActive: false,
      packages: [],
    });

    const context = mockExecutionContext(mockRequest('user-1'));

    // First call - should deny
    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );

    // Second call - should also deny from cache
    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
    expect(mockMcomCentralService.getUserPackages).toHaveBeenCalledTimes(1);
  });

  it('should re-query after cache expires', async () => {
    mockMcomCentralService.getUserPackages.mockResolvedValue({
      tierId: null,
      isActive: false,
      packages: [],
    });

    const context = mockExecutionContext(mockRequest('user-1'));

    // First call
    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );

    // Simulate cache expiry by setting timestamp to 6 minutes ago
    const cache = SubscriptionGuard['cache'] as Map<string, { result: boolean; timestamp: number }>;
    const entry = cache.get('user-1');
    if (entry) {
      entry.timestamp = Date.now() - 6 * 60 * 1000;
    }

    // Mock now returning active
    mockMcomCentralService.getUserPackages.mockResolvedValue({
      tierId: 'tier-1',
      isActive: true,
      packages: [],
    });

    // Should re-query and allow
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockMcomCentralService.getUserPackages).toHaveBeenCalledTimes(2);
  });

  it('should use userId from request.user.userId when user.id is not set', async () => {
    mockMcomCentralService.getUserPackages.mockResolvedValue({
      tierId: 'tier-1',
      isActive: true,
      packages: [],
    });

    const req = { user: { userId: 'user-from-userId' } } as any;
    const context = mockExecutionContext(req);

    await guard.canActivate(context);

    expect(mockMcomCentralService.getUserPackages).toHaveBeenCalledWith(
      'user-from-userId',
    );
  });

  it('should handle McomCentralService errors gracefully by denying access', async () => {
    mockMcomCentralService.getUserPackages.mockRejectedValue(
      new Error('Network error'),
    );

    const context = mockExecutionContext(mockRequest('user-1'));

    await expect(guard.canActivate(context)).rejects.toThrow();
  });
});
