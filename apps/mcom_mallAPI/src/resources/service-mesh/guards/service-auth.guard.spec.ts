import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

// `jose` is ESM-only; mock it so the CJS Jest runtime can load the guard module.
jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn(),
  jwtVerify: jest.fn(),
}));

import { ServiceAuthGuard } from './service-auth.guard';

function makeContext(headers: Record<string, string>): {
  context: ExecutionContext;
  request: any;
} {
  const request: any = { headers };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

function makeGuard(opts: {
  verify?: jest.Mock;
  allowedCallersEnv?: string | undefined;
  registryCallers?: string[];
}) {
  const jwksService = {
    verifyServiceToken: opts.verify ?? jest.fn(),
  };
  const serviceMesh = {
    getClientId: jest.fn().mockReturnValue('mcom-mall'),
    findService: jest.fn().mockResolvedValue({
      clientId: 'mcom-mall',
      allowedCallers: opts.registryCallers ?? [],
    }),
  };
  const configService = {
    get: jest.fn((key: string) =>
      key === 'MCOM_ALLOWED_CALLERS' ? opts.allowedCallersEnv : undefined,
    ),
  };
  const guard = new ServiceAuthGuard(
    jwksService as any,
    serviceMesh as any,
    configService as any,
  );
  return { guard, jwksService, serviceMesh };
}

describe('ServiceAuthGuard (inbound mesh verification)', () => {
  it('rejects when no Bearer token is present', async () => {
    const { guard } = makeGuard({ allowedCallersEnv: 'mcom-rewards' });
    const { context } = makeContext({});
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects when offline JWKS verification fails', async () => {
    const { guard } = makeGuard({
      verify: jest.fn().mockRejectedValue(new Error('bad signature')),
      allowedCallersEnv: 'mcom-rewards',
    });
    const { context } = makeContext({ authorization: 'Bearer nope' });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a token with no caller identity', async () => {
    const { guard } = makeGuard({
      verify: jest.fn().mockResolvedValue({ typ: 'service' }),
      allowedCallersEnv: 'mcom-rewards',
    });
    const { context } = makeContext({ authorization: 'Bearer tok' });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('denies-by-default a caller not in allowedCallers', async () => {
    const { guard } = makeGuard({
      verify: jest
        .fn()
        .mockResolvedValue({ typ: 'service', sub: 'mcom-other' }),
      registryCallers: [],
    });
    const { context } = makeContext({ authorization: 'Bearer tok' });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('accepts an allowlisted caller and attaches the service context', async () => {
    const { guard } = makeGuard({
      verify: jest.fn().mockResolvedValue({
        typ: 'service',
        sub: 'mcom-rewards',
        scope: 'mall:read mall:write',
      }),
      allowedCallersEnv: 'mcom-rewards',
    });
    const { context, request } = makeContext({ authorization: 'Bearer tok' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.serviceCaller).toMatchObject({
      callerAppId: 'mcom-rewards',
      isDelegated: false,
      scopes: ['mall:read', 'mall:write'],
    });
  });

  it('resolves the caller from act.sub for delegated tokens', async () => {
    const { guard } = makeGuard({
      verify: jest.fn().mockResolvedValue({
        typ: 'delegated',
        sub: 'central-user-1',
        act: { sub: 'mcom-rewards' },
        scope: 'mall:write',
      }),
      allowedCallersEnv: 'mcom-rewards',
    });
    const { context, request } = makeContext({ authorization: 'Bearer tok' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.serviceCaller).toMatchObject({
      callerAppId: 'mcom-rewards',
      isDelegated: true,
      userId: 'central-user-1',
    });
  });

  it('falls back to the cached registry when no env allowlist is set', async () => {
    const { guard } = makeGuard({
      verify: jest
        .fn()
        .mockResolvedValue({ typ: 'service', sub: 'mcom-rewards' }),
      registryCallers: ['mcom-rewards'],
    });
    const { context } = makeContext({ authorization: 'Bearer tok' });
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
