import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { InstitutionalPartnersService } from './institutional-partners.service';
import { InstitutionalPartner, PartnerStatus } from './entities/institutional-partner.entity';
import { CreateInstitutionalPartnerDto } from './dto/create-institutional-partner.dto';
import { UpdateInstitutionalPartnerDto } from './dto/update-institutional-partner.dto';

@ApiTags('InstitutionalPartners')
@ApiBearerAuth()
@Controller('institutional-partners')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class InstitutionalPartnersController {
  constructor(private readonly partnersService: InstitutionalPartnersService) {}

  @Post()
  @ApiOperation({ summary: 'Add an institutional partner (Admin only)' })
  @ApiCreatedResponse({ description: 'Partner created', type: InstitutionalPartner })
  @ApiBadRequestResponse({ description: 'Invalid input payload' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT bearer token' })
  create(@Body() dto: CreateInstitutionalPartnerDto): Promise<InstitutionalPartner> {
    return this.partnersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List institutional partners with optional filters (Admin only)' })
  @ApiOkResponse({ description: 'Partner list', type: [InstitutionalPartner] })
  findAll(
    @Query('status') status?: PartnerStatus,
    @Query('search') search?: string,
  ): Promise<InstitutionalPartner[]> {
    return this.partnersService.findAll(status, search);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get partner totals (Admin only)' })
  @ApiOkResponse({ description: 'Partner statistics' })
  getStats() {
    return this.partnersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an institutional partner (Admin only)' })
  @ApiOkResponse({ description: 'Partner detail', type: InstitutionalPartner })
  @ApiNotFoundResponse({ description: 'Partner with specified ID was not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<InstitutionalPartner> {
    return this.partnersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an institutional partner (Admin only)' })
  @ApiOkResponse({ description: 'Partner updated', type: InstitutionalPartner })
  @ApiNotFoundResponse({ description: 'Partner with specified ID was not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInstitutionalPartnerDto,
  ): Promise<InstitutionalPartner> {
    return this.partnersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an institutional partner (Admin only)' })
  @ApiOkResponse({ description: 'Partner removed' })
  @ApiNotFoundResponse({ description: 'Partner with specified ID was not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.partnersService.remove(id);
  }
}
