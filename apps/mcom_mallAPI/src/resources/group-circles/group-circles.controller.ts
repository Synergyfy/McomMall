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
  Patch,
  Query,
} from '@nestjs/common';
import { GroupCirclesService } from './group-circles.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
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
import { VerifyContributionPaymentDto } from './dto/verify-contribution-payment.dto';
import {
  GroupCircleMessage,
  GroupMessageType,
} from './entities/group-circle-message.entity';

@ApiTags('Group Circles')
@ApiBearerAuth()
@Controller('group-circles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class GroupCirclesController {
  constructor(private readonly groupCirclesService: GroupCirclesService) {}

  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create a new group circle' })
  @ApiResponse({
    status: 201,
    description: 'The group circle has been successfully created.',
    type: Group,
  })
  create(
    @Body() createGroupDto: CreateGroupDto,
    @CurrentUser() user: User,
  ): Promise<Group> {
    return this.groupCirclesService.create(createGroupDto, user);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update a group circle' })
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @CurrentUser() user: User,
  ): Promise<Group> {
    return this.groupCirclesService.update(id, updateGroupDto, user);
  }

  @Get()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Find all group circles for the current user' })
  findAll(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<any> {
    return this.groupCirclesService.findAll(user, { page, limit });
  }

  @Get('discover')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Find discoverable group circles' })
  discover(): Promise<any> {
    return this.groupCirclesService.discover();
  }

  @Get('referred-businesses')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Find businesses referred by the current user' })
  getReferredBusinesses(@CurrentUser() user: User): Promise<any[]> {
    return this.groupCirclesService.getReferredBusinesses(user);
  }

  @Get(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Find a specific group circle by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: User): Promise<any> {
    return this.groupCirclesService.findOne(id, user);
  }

  @Post(':id/join')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Join an existing group circle' })
  joinGroup(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<GroupMember> {
    return this.groupCirclesService.joinGroup(id, user);
  }

  @Delete(':id/members/:memberId')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Remove a member from a group circle' })
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.groupCirclesService.removeMember(id, memberId, user);
  }

  @Post(':id/members')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Add/Invite members to a group circle' })
  addMember(
    @Param('id') id: string,
    @Body() data: any,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.groupCirclesService.addMembers(id, data, user);
  }

  @Get(':id/messages')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get group circle messages' })
  getMessages(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('type') type?: GroupMessageType,
    @Query('memberId') memberId?: string,
  ): Promise<any> {
    return this.groupCirclesService.getMessages(id, user, {
      page,
      limit,
      type,
      memberId,
    });
  }

  @Post(':id/messages')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Send a message to a group circle' })
  sendMessage(
    @Param('id') id: string,
    @Body() data: any,
    @CurrentUser() user: User,
  ): Promise<GroupCircleMessage> {
    return this.groupCirclesService.sendMessage(id, data, user);
  }

  @Post(':id/contributions/initiate')
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Initiate a payment for a group circle contribution',
  })
  initiateContributionPayment(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() initiateDto: InitiateContributionPaymentDto,
  ): Promise<any> {
    return this.groupCirclesService.initiateContributionPayment(
      id,
      user,
      initiateDto,
    );
  }

  @Post(':id/contributions/verify')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Verify a payment for a group circle contribution' })
  verifyContributionPayment(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() verifyDto: VerifyContributionPaymentDto,
  ): Promise<any> {
    return this.groupCirclesService.verifyContributionPayment(
      id,
      user,
      verifyDto,
    );
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a group circle' })
  delete(@Param('id') id: string, @CurrentUser() user: User): Promise<void> {
    return this.groupCirclesService.delete(id, user);
  }
}
