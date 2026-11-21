import { Module } from '@nestjs/common';
import { MediaProxyController } from './media-proxy.controller';
import { MediaProxyService } from './media-proxy.service';

/**
 * Public image proxy for Central-hosted uploads. The outbound half of the
 * service mesh (ServiceMeshService) is provided globally.
 */
@Module({
  controllers: [MediaProxyController],
  providers: [MediaProxyService],
})
export class MediaProxyModule {}
