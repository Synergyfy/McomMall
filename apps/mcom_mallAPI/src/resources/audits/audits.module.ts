import { Module } from '@nestjs/common';
import { AuditsService } from './audits.service';
import { AuditsController } from './audits.controller';
import { AdminAuditsController } from './admin-audits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Audit } from './entities/audit.entity';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Audit, User, Business])],
  controllers: [AuditsController, AdminAuditsController],
  providers: [AuditsService],
  exports: [AuditsService],
})
export class AuditsModule {}
