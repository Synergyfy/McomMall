import { Global, Module } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';

/**
 * Global so any resource module can inject `FeatureFlagsService` without
 * adding an import. Flags are read from `ConfigService`, which is itself
 * registered globally by `ConfigModule.forRoot({ isGlobal: true })`.
 */
@Global()
@Module({
  providers: [FeatureFlagsService],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
