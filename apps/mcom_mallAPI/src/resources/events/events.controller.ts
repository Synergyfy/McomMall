import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateLiveCommentDto } from './dto/create-live-comment.dto';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create a new physical or webinar event' })
  async create(
    @CurrentUser() user: User,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventsService.create(user.id, createEventDto);
  }

  @Get('my-events')
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Get all events created by the current business merchant',
  })
  async findAllMyEvents(@CurrentUser() user: User) {
    return this.eventsService.findAllForBusiness(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(id);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get event performance analytics' })
  async getPerformance(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.getPerformance(id);
  }

  @Get(':id/live')
  @ApiOperation({ summary: 'Get live event control room data' })
  async getLive(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.getLive(id);
  }

  @Post(':id/live/comments')
  @ApiOperation({ summary: 'Post a live event comment' })
  async createComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateLiveCommentDto,
  ) {
    return this.eventsService.createComment(id, dto);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update an existing event details' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update the live status of an event' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.eventsService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Delete an event' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.remove(id);
  }
}
