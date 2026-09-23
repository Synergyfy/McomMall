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
import { WebhooksService } from './webhooks.service';
import { Webhook } from './entities/webhook.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';

@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller('webhooks')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @ApiOperation({ summary: 'Register a webhook endpoint (Admin only)' })
  @ApiCreatedResponse({ description: 'Webhook created', type: Webhook })
  @ApiBadRequestResponse({ description: 'Invalid input payload' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT bearer token' })
  create(@Body() dto: CreateWebhookDto): Promise<Webhook> {
    return this.webhooksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List webhook endpoints (Admin only)' })
  @ApiOkResponse({ description: 'Webhook list', type: [Webhook] })
  findAll(): Promise<Webhook[]> {
    return this.webhooksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a webhook endpoint (Admin only)' })
  @ApiOkResponse({ description: 'Webhook detail', type: Webhook })
  @ApiNotFoundResponse({ description: 'Webhook with specified ID was not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Webhook> {
    return this.webhooksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a webhook endpoint (Admin only)' })
  @ApiOkResponse({ description: 'Webhook updated', type: Webhook })
  @ApiNotFoundResponse({ description: 'Webhook with specified ID was not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWebhookDto,
  ): Promise<Webhook> {
    return this.webhooksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a webhook endpoint (Admin only)' })
  @ApiOkResponse({ description: 'Webhook removed' })
  @ApiNotFoundResponse({ description: 'Webhook with specified ID was not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.webhooksService.remove(id);
  }
}
