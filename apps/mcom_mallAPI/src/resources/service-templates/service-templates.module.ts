import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceTemplate } from './entities/service-template.entity';
import { ServiceTemplatesService } from './service-templates.service';
import { ServiceTemplatesController } from './service-templates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceTemplate])],
  controllers: [ServiceTemplatesController],
  providers: [ServiceTemplatesService],
  exports: [ServiceTemplatesService],
})
export class ServiceTemplatesModule {}
