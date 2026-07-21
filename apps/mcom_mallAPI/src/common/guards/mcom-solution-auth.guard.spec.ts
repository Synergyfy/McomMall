import { McomSolutionAuthGuard } from './mcom-solution-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('McomSolutionAuthGuard', () => {
  let guard: McomSolutionAuthGuard;

  const mockRequest = (headers: Record<string, string>) =>
    ({ headers } as any);

  const mockExecutionContext = (req: any) =>
    ({
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    }) as any;

  beforeEach(() => {
    guard = new McomSolutionAuthGuard();
    process.env.MCOM_SOLUTION_API_KEY = 'test-solution-key';
  });

  afterEach(() => {
    delete process.env.MCOM_SOLUTION_API_KEY;
  });

  it('should allow access with valid API key', () => {
    const req = mockRequest({ 'x-mcom-solution-api-key': 'test-solution-key' });
    const context = mockExecutionContext(req);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException when API key is missing', () => {
    const req = mockRequest({});
    const context = mockExecutionContext(req);
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when API key is invalid', () => {
    const req = mockRequest({ 'x-mcom-solution-api-key': 'wrong-key' });
    const context = mockExecutionContext(req);
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when env var is not configured', () => {
    delete process.env.MCOM_SOLUTION_API_KEY;
    const req = mockRequest({ 'x-mcom-solution-api-key': 'test-solution-key' });
    const context = mockExecutionContext(req);
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
