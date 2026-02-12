import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { TrialService } from './trial.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TrialGuard } from './trial.guard';
import { Request } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('trial')
@UseGuards(JwtAuthGuard, TrialGuard)
export class TrialController {
  constructor(private readonly trialService: TrialService) { }

  @Get()
  async getTrialStatus(@Req() req: Request) {
    const userId = req.user.id;
    return this.trialService.getTrialStatus(userId);
  }

  @Post('pause')
  async pauseTrial(@Req() req: Request) {
    const userId = req.user.id;
    return this.trialService.pauseTrial(userId);
  }

  @Post('resume')
  async resumeTrial(@Req() req: Request) {
    const userId = req.user.id;
    return this.trialService.resumeTrial(userId);
  }
}
