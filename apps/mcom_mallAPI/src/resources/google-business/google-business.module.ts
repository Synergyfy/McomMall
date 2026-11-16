import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleBusinessController } from './google-business.controller';
import { GoogleBusinessService } from './google-business.service';
import { User } from '../users/entities/user.entity';
import { Sector } from '../taxonomy/entities/sector.entity';
import { TaxonomyCategory } from '../taxonomy/entities/taxonomy-category.entity';
import { TaxonomySubcategory } from '../taxonomy/entities/taxonomy-subcategory.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Sector,
      TaxonomyCategory,
      TaxonomySubcategory,
    ]),
    UsersModule,
    AuthModule,
  ],
  controllers: [GoogleBusinessController],
  providers: [GoogleBusinessService],
  exports: [GoogleBusinessService],
})
export class GoogleBusinessModule {}
