import { Test, TestingModule } from '@nestjs/testing';
import { ClaimController } from './claim.controller';
import { GoogleOAuthService } from './google-oauth.service';
import { BusinessVerificationService } from './business-verification.service';

describe('ClaimController', () => {
  let controller: ClaimController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClaimController],
      providers: [
        {
          provide: GoogleOAuthService,
          useValue: {
            getAuthUrl: jest.fn(),
            getClientFromCode: jest.fn(),
          },
        },
        {
          provide: BusinessVerificationService,
          useValue: {
            verifyPlaceOwnership: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ClaimController>(ClaimController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
