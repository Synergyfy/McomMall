import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { MembershipService } from './membership.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Membership } from './entities/membership.entity';
import { InitiateMembershipPaymentDto } from './dto/initiate-membership-payment.dto';
import { VerifyMembershipPaymentDto } from './dto/verify-membership-payment.dto';
import { PaymentMethod } from '../order/entities/order-payment.entity';
import { JoinTrialDto } from './dto/join-trial.dto';

@ApiTags('Membership')
@ApiBearerAuth()
@Controller('membership')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get('my')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: "Get the current user's membership details" })
  @ApiResponse({
    status: 200,
    description: 'Returns the membership details.',
    type: Membership,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Membership not found.' })
  findOne(@CurrentUser() user: User): Promise<Membership> {
    return this.membershipService.findOne(user);
  }

  @Post('initiate-payment')
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Initiate a payment for a membership',
    description:
      'Starts the payment process for a membership tier subscription. Supports Stripe and PayPal. Returns a client secret (Stripe) or Order ID (PayPal) to complete the transaction on the frontend.',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully.',
    schema: {
      type: 'object',
      properties: {
        clientSecret: {
          type: 'string',
          description: 'The client secret from Stripe (if provider is Stripe).',
        },
        orderId: {
          type: 'string',
          description: 'The order ID from PayPal (if provider is PayPal).',
        },
        provider: {
          type: 'string',
          enum: Object.values(PaymentMethod),
          description: 'The payment provider used.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid payment provider or tier.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict. User already has an active membership.',
  })
  initiatePayment(
    @Body() initiateDto: InitiateMembershipPaymentDto,
    @CurrentUser() user: User,
  ): Promise<{
    clientSecret?: string;
    orderId?: string;
    provider: PaymentMethod;
  }> {
    return this.membershipService.initiateMembershipPayment(initiateDto, user);
  }

  @Post('verify-payment')
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Verify a payment and create the membership',
    description:
      'Verifies the payment with the provider (Stripe/PayPal) and creates the membership record linked to the purchased Tier. Must be called after successful frontend payment.',
  })
  @ApiResponse({
    status: 201,
    description: 'Membership created successfully after payment verification.',
    type: Membership,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Payment verification failed.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict. User already has an active membership.',
  })
  verifyPayment(
    @Body() verifyDto: VerifyMembershipPaymentDto,
    @CurrentUser() user: User,
  ): Promise<Membership> {
    return this.membershipService.verifyAndCreateMembership(verifyDto, user);
  }

  @Post('join-trial')
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Join a 7-day trial for a specific tier',
    description:
      'Grants a 7-day trial membership for the specified tier. Allows users to test features before purchasing. Users are limited to one trial.',
  })
  @ApiResponse({
    status: 201,
    description: 'Trial membership created successfully.',
    type: Membership,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Tier not found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict. User already has an active membership.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User has already used their trial period.',
  })
  joinTrial(
    @Body() joinTrialDto: JoinTrialDto,
    @CurrentUser() user: User,
  ): Promise<Membership> {
    return this.membershipService.joinTrial(joinTrialDto.tierId, user);
  }
}
