import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwksService } from './services/jwks.service';
import { ServiceMeshService } from './services/service-mesh.service';
import { ServiceAuthGuard } from './guards/service-auth.guard';
import { ServiceScopesGuard } from './guards/service-scopes.guard';

/**
 * Global MCOM ecosystem service mesh (inbound verification + outbound peer
 * client). Exposes the guards/services to every feature module.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    JwksService,
    ServiceMeshService,
    ServiceAuthGuard,
    ServiceScopesGuard,
  ],
  exports: [
    JwksService,
    ServiceMeshService,
    ServiceAuthGuard,
    ServiceScopesGuard,
  ],
})
export class ServiceMeshModule {}
