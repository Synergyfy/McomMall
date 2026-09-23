import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/role.enum';
import { AdminRolesService } from './admin-roles.service';
import { AdminRole } from './entities/admin-role.entity';
import { CreateAdminRoleDto } from './dto/create-admin-role.dto';
import { AssignAdminRoleDto, UpdateAdminRoleDto } from './dto/update-admin-role.dto';

@ApiTags('AdminRoles')
@ApiBearerAuth()
@Controller('admin/roles')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminRolesController {
  constructor(private readonly adminRolesService: AdminRolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an admin role (Admin only)' })
  @ApiCreatedResponse({ description: 'Role created', type: AdminRole })
  @ApiConflictResponse({ description: 'Role name already exists' })
  @ApiBadRequestResponse({ description: 'Invalid input payload' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT bearer token' })
  create(@Body() dto: CreateAdminRoleDto): Promise<AdminRole> {
    return this.adminRolesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List admin roles with live member counts (Admin only)' })
  @ApiOkResponse({ description: 'Role list' })
  findAll() {
    return this.adminRolesService.findAll();
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List members assigned to a role (Admin only)' })
  @ApiOkResponse({ description: 'Role members' })
  @ApiNotFoundResponse({ description: 'Admin role with specified ID was not found' })
  getMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminRolesService.getMembers(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an admin role (Admin only)' })
  @ApiOkResponse({ description: 'Role updated', type: AdminRole })
  @ApiNotFoundResponse({ description: 'Admin role with specified ID was not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminRoleDto,
  ): Promise<AdminRole> {
    return this.adminRolesService.update(id, dto);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign a user to a role (Admin only)' })
  @ApiOkResponse({ description: 'User assigned to role' })
  @ApiNotFoundResponse({ description: 'Role or user was not found' })
  assignMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignAdminRoleDto,
  ) {
    return this.adminRolesService.assignMember(id, dto.userId ?? null);
  }

  @Delete('members/:userId')
  @ApiOperation({ summary: 'Unassign a user from their role (Admin only)' })
  @ApiOkResponse({ description: 'User unassigned' })
  @ApiNotFoundResponse({ description: 'User was not found' })
  unassignMember(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.adminRolesService.unassignMember(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an admin role (Admin only)' })
  @ApiOkResponse({ description: 'Role removed' })
  @ApiNotFoundResponse({ description: 'Admin role with specified ID was not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.adminRolesService.remove(id);
  }
}
