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
import { OnboardingService } from './onboarding.service';
import { OnboardingQuestion } from './entities/onboarding-question.entity';
import {
  CreateOnboardingQuestionDto,
  ReorderOnboardingQuestionsDto,
  UpdateOnboardingQuestionDto,
} from './dto/onboarding-question.dto';

@ApiTags('Onboarding')
@ApiBearerAuth()
@Controller('onboarding/questions')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  @ApiOperation({ summary: 'Add a question to the onboarding flow (Admin only)' })
  @ApiCreatedResponse({ description: 'Question created', type: OnboardingQuestion })
  @ApiBadRequestResponse({ description: 'Invalid input payload' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT bearer token' })
  create(@Body() dto: CreateOnboardingQuestionDto): Promise<OnboardingQuestion> {
    return this.onboardingService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List onboarding questions in display order (Admin only)' })
  @ApiOkResponse({ description: 'Question list', type: [OnboardingQuestion] })
  findAll(): Promise<OnboardingQuestion[]> {
    return this.onboardingService.findAll();
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder onboarding questions (Admin only)' })
  @ApiOkResponse({ description: 'Questions reordered', type: [OnboardingQuestion] })
  @ApiBadRequestResponse({ description: 'Invalid input payload' })
  reorder(@Body() dto: ReorderOnboardingQuestionsDto): Promise<OnboardingQuestion[]> {
    return this.onboardingService.reorder(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an onboarding question (Admin only)' })
  @ApiOkResponse({ description: 'Question detail', type: OnboardingQuestion })
  @ApiNotFoundResponse({ description: 'Onboarding question with specified ID was not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<OnboardingQuestion> {
    return this.onboardingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an onboarding question (Admin only)' })
  @ApiOkResponse({ description: 'Question updated', type: OnboardingQuestion })
  @ApiNotFoundResponse({ description: 'Onboarding question with specified ID was not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOnboardingQuestionDto,
  ): Promise<OnboardingQuestion> {
    return this.onboardingService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an onboarding question (Admin only)' })
  @ApiOkResponse({ description: 'Question removed' })
  @ApiNotFoundResponse({ description: 'Onboarding question with specified ID was not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.onboardingService.remove(id);
  }
}
