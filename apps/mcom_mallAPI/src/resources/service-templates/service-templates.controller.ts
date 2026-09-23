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
import { ServiceTemplatesService } from './service-templates.service';
import { ServiceTemplate } from './entities/service-template.entity';
import { CreateServiceTemplateDto } from './dto/create-service-template.dto';
import { UpdateServiceTemplateDto } from './dto/update-service-template.dto';

@ApiTags('ServiceTemplates')
@ApiBearerAuth()
@Controller('service-templates')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class ServiceTemplatesController {
  constructor(private readonly serviceTemplatesService: ServiceTemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a service template (Admin only)' })
  @ApiCreatedResponse({ description: 'Template created', type: ServiceTemplate })
  @ApiBadRequestResponse({ description: 'Invalid input payload' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT bearer token' })
  create(@Body() dto: CreateServiceTemplateDto): Promise<ServiceTemplate> {
    return this.serviceTemplatesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List service templates (Admin only)' })
  @ApiOkResponse({ description: 'Template list', type: [ServiceTemplate] })
  findAll(@Query('search') search?: string): Promise<ServiceTemplate[]> {
    return this.serviceTemplatesService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service template (Admin only)' })
  @ApiOkResponse({ description: 'Template detail', type: ServiceTemplate })
  @ApiNotFoundResponse({ description: 'Service template with specified ID was not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ServiceTemplate> {
    return this.serviceTemplatesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service template (Admin only)' })
  @ApiOkResponse({ description: 'Template updated', type: ServiceTemplate })
  @ApiNotFoundResponse({ description: 'Service template with specified ID was not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceTemplateDto,
  ): Promise<ServiceTemplate> {
    return this.serviceTemplatesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service template (Admin only)' })
  @ApiOkResponse({ description: 'Template removed' })
  @ApiNotFoundResponse({ description: 'Service template with specified ID was not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.serviceTemplatesService.remove(id);
  }
}
