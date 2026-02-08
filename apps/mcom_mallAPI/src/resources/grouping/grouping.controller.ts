import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Get,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GroupingService } from './grouping.service';
import { CreateGroupDto } from './dto/create-group.dto';
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
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { InitiateContributionPaymentDto } from './dto/initiate-contribution-payment.dto';
import { GroupResponseDto } from './dto/group-response.dto';
import { VerifyContributionPaymentDto } from './dto/verify-contribution-payment.dto';
import { PaymentMethod } from '../order/entities/order-payment.entity';

@ApiTags('Grouping')
@ApiBearerAuth()
@Controller('grouping')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class GroupingController {
  constructor(private readonly groupingService: GroupingService) {}

  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({
    status: 201,
    description: 'The group has been successfully created.',
    type: Group,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only professional members can create groups.',
  })
  create(
    @Body() createGroupDto: CreateGroupDto,
    @CurrentUser() user: User,
  ): Promise<Group> {
    return this.groupingService.create(createGroupDto, user);
  }

  @Post(':groupId/join')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Join an existing group' })
  @ApiResponse({
    status: 201,
    description: 'Successfully joined the group.',
    type: GroupMember,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  @ApiResponse({ status: 409, description: 'Conflict. User is already a member.' })
  joinGroup(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
  ): Promise<GroupMember> {
    return this.groupingService.joinGroup(groupId, user);
  }

  @Get()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Find all groups for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of groups the user is participating in.',
    type: [GroupResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@CurrentUser() user: User): Promise<GroupResponseDto[]> {
    return this.groupingService.findAll(user);
  }

  @Get(':groupId')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Find a specific group by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the group details.',
    type: GroupResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  findOne(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
  ): Promise<GroupResponseDto> {
    return this.groupingService.findOne(groupId, user);
  }

  @Post(':groupId/initiate-contribution')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Initiate a payment for a group contribution' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully.',
  })
  initiateContributionPayment(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
    @Body() initiateDto: InitiateContributionPaymentDto,
  ): Promise<{ clientSecret?: string; orderId?: string; provider: PaymentMethod }> {
    return this.groupingService.initiateContributionPayment(
      groupId,
      user,
      initiateDto,
    );
  }

  @Post(':groupId/verify-contribution')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Verify a payment and activate group membership' })
  @ApiResponse({
    status: 200,
    description: 'Contribution paid successfully. Member is now active.',
    type: GroupMember,
  })
  verifyContributionPayment(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
    @Body() verifyDto: VerifyContributionPaymentDto,
  ): Promise<GroupMember> {
    return this.groupingService.verifyContributionPayment(
      groupId,
      user,
      verifyDto,
    );
  }

  @Delete(':groupId')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a group' })
  @ApiResponse({
    status: 204,
    description: 'The group has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only the group founder can delete the group.',
  })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  delete(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.groupingService.delete(groupId, user);
  }
}