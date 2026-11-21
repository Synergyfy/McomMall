import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { SsoModule } from '../sso/sso.module';
import { ProfileSyncController } from './profile-sync.controller';
import { ProfileSyncService } from './profile-sync.service';
import { ProfileSyncEvent } from './entities/profile-sync-event.entity';

/**
 * Central -> Mall profile propagation.
 *
 * Central remains the source of truth; this module only stores the delivery
 * inbox and mirrors the canonical profile onto local records. The outbound
 * pull uses the global ServiceMeshModule.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileSyncEvent, User]),
    UsersModule,
    SsoModule,
  ],
  controllers: [ProfileSyncController],
  providers: [ProfileSyncService],
  exports: [ProfileSyncService],
})
export class ProfileSyncModule {}
