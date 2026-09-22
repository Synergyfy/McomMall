import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
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
import { VerificationsService } from './verifications.service';
import { Verification, VerificationStatus, VerificationSubjectType } from './entities/verification.entity';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';

@ApiTags('Verifications')
@ApiBearerAuth()
@Controller('verifications')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class VerificationsController {
  constructor(private readonly verificationsService: VerificationsService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit a verification request (Admin only)' })
  @ApiCreatedResponse({ description: 'Verification submitted', type: Verification })
  @ApiBadRequestResponse({ description: 'Invalid input payload' })
  submit(@Body() dto: CreateVerificationDto): Promise<Verification> {
    return this.verificationsService.submit(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List verifications with optional filters (Admin only)' })
  @ApiOkResponse({ description: 'Verification queue', type: [Verification] })
  findAll(
    @Query('status') status?: VerificationStatus,
    @Query('subjectType') subjectType?: VerificationSubjectType,
  ): Promise<Verification[]> {
    return this.verificationsService.findAll(status, subjectType);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get verification queue counts (Admin only)' })
  @ApiOkResponse({ description: 'Verification statistics' })
  getStats() {
    return this.verificationsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a verification (Admin only)' })
  @ApiOkResponse({ description: 'Verification detail', type: Verification })
  @ApiNotFoundResponse({ description: 'Verification with specified ID was not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Verification> {
    return this.verificationsService.findOne(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a verification; business approvals mark the business verified (Admin only)' })
  @ApiOkResponse({ description: 'Verification approved', type: Verification })
  @ApiBadRequestResponse({ description: 'Verification is not pending' })
  @ApiNotFoundResponse({ description: 'Verification with specified ID was not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT bearer token' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewVerificationDto,
    @Req() req,
  ): Promise<Verification> {
    return this.verificationsService.approve(id, dto, req.user.id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a verification (Admin only)' })
  @ApiOkResponse({ description: 'Verification rejected', type: Verification })
  @ApiBadRequestResponse({ description: 'Verification is not pending' })
  @ApiNotFoundResponse({ description: 'Verification with specified ID was not found' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewVerificationDto,
    @Req() req,
  ): Promise<Verification> {
    return this.verificationsService.reject(id, dto, req.user.id);
  }
}
