import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionalPartner } from './entities/institutional-partner.entity';
import { InstitutionalPartnersService } from './institutional-partners.service';
import { InstitutionalPartnersController } from './institutional-partners.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstitutionalPartner])],
  controllers: [InstitutionalPartnersController],
  providers: [InstitutionalPartnersService],
  exports: [InstitutionalPartnersService],
})
export class InstitutionalPartnersModule {}
