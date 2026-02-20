import { Controller, Post, Body, UseGuards, Headers, UnauthorizedException } from "@nestjs/common";
import { VoucherService } from "./voucher.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { IpWhitelistGuard } from "../../common/middleware/ip-whitelist.guard";
import { Public } from "../../common/decorators/public.decorator";

// Simple Guard for System API Key
// In a real app, move this to common/guards
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class SystemAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers["x-system-api-key"];
    const validKey = process.env.SYSTEM_API_KEY || "secret-system-key"; // Set this in .env
    return apiKey === validKey;
  }
}

@ApiTags("System Integration")
@Public()
@Controller("system/vouchers")
@UseGuards(SystemAuthGuard, IpWhitelistGuard)
export class SystemVoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post("create")
  @ApiOperation({ summary: "Create a voucher from external system (Loyalty API)" })
  async createVoucher(@Body() payload: {
    amount: number;
    recipientEmail: string;
    recipientName?: string;
    message?: string;
    businessName: string;
  }) {
    return this.voucherService.createSystemVoucher(payload);
  }
}
