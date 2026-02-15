import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ErrorFactory } from '../../common/errors/error.factory';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserPromotionsDto } from './dto/query-user-promotions.dto';
import { QueryTransactionHistoryDto } from './dto/query-transaction-history.dto';
import { QueryRedeemedOffersDto } from './dto/query-redeemed-offers.dto';
import { SearchOwnerDto } from './dto/search-owner.dto';
import { User } from './entities/user.entity';
import { UpdateUserFeaturesDto } from './dto/update-user-features.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Check if email exists' })
  @ApiResponse({ status: 200, description: 'Returns true if email exists, false otherwise.' })
  @Public()
  @Get('check-email')
  async checkEmail(@Query('email') email: string) {
    const exists = await this.usersService.checkEmailExists(email);
    return { exists };
  }

  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({
    status: 201,
    description: ' user created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Public()
  @Post('/create')
  async create(@Body() payload: CreateUserDto) {
    const { email, password, confirm_password, phoneNumber } = payload;
    const emailExists = await this.usersService.checkEmailExists(email);
    if (emailExists) throw ErrorFactory.existingEmail();

    const numberExists =
      await this.usersService.checkPhoneNumberExists(phoneNumber);
    if (numberExists) throw ErrorFactory.existingPhoneNumber();
    if (password !== confirm_password)
      throw ErrorFactory.passwordsFieldMismatch();

    return this.usersService.create(payload);
  }

  @ApiOperation({ summary: 'Create a user (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully (Auto-verified).',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Roles(UserRole.ADMIN)
  @Post('admin/create')
  async createByAdmin(@Body() payload: CreateUserDto) {
    const { email, password, confirm_password, phoneNumber } = payload;
    const emailExists = await this.usersService.checkEmailExists(email);
    if (emailExists) throw ErrorFactory.existingEmail();

    const numberExists =
      await this.usersService.checkPhoneNumberExists(phoneNumber);
    if (numberExists) throw ErrorFactory.existingPhoneNumber();
    if (password !== confirm_password)
      throw ErrorFactory.passwordsFieldMismatch();

    return this.usersService.createByAdmin(payload);
  }

  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'Return user.' })
  @Get('me')
  findMe(@Req() req) {
    return this.usersService.findOne(req.user.id);
  }

  @ApiOperation({ summary: 'Get user info by ID' })
  @ApiResponse({ status: 200, description: 'Return user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    if (req.user.id !== id) {
      throw new ForbiddenException();
    }
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException();
    }
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: "Get user's redeemed offers" })
  @ApiResponse({ status: 200, description: 'Return redeemed offers.' })
  @Get(':id/redeemed-offers')
  getRedeemedOffers(
    @Req() req,
    @Param('id') id: string,
    @Query() query: QueryRedeemedOffersDto,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException();
    }
    return this.usersService.getRedeemedOffers(id, query);
  }

  @ApiOperation({ summary: "Get user's promotions and balances" })
  @ApiResponse({ status: 200, description: 'Return promotions and balances.' })
  @Get(':id/promotions')
  getPromotions(
    @Req() req,
    @Param('id') id: string,
    @Query() query: QueryUserPromotionsDto,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException();
    }
    return this.usersService.getPromotions(id, query);
  }

  @ApiOperation({ summary: "Get user's transaction history" })
  @ApiResponse({ status: 200, description: 'Return transaction history.' })
  @Get(':id/transactions')
  getTransactionHistory(
    @Req() req,
    @Param('id') id: string,
    @Query() query: QueryTransactionHistoryDto,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException();
    }
    return this.usersService.getTransactionHistory(id, query);
  }

  @ApiOperation({ summary: 'Update user features by ID' })
  @ApiResponse({ status: 200, description: 'User features updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Patch('features')
  updateFeatures(
    @Req() req,
    @Body() updateUserFeaturesDto: UpdateUserFeaturesDto,
  ) {
    return this.usersService.updateFeatures(req.user.id, updateUserFeaturesDto);
  }
}
