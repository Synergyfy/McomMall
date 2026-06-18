import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  submitClaim(@Body() createDto: CreateClaimDto) {
    return this.claimsService.submitClaim(createDto);
  }

  @Get()
  findAll() {
    return this.claimsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.claimsService.findOne(id);
  }

  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateClaimDto,
  ) {
    return this.claimsService.updateStatus(id, updateDto);
  }
}
