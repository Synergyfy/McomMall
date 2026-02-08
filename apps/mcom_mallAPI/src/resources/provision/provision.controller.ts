import { Controller, Post, Body } from "@nestjs/common";
import { ProvisionService } from "./provision.service";
import { CreateProvisionDto } from "./dto/create-provision.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("Provision")
@Controller("provision")
export class ProvisionController {
  constructor(private readonly provisionService: ProvisionService) {}

  @Public() // Secure this in production (S2S only)
  @Post()
  @ApiOperation({ summary: "Provision a new voucher code" })
  @ApiResponse({ status: 201, description: "Provision created." })
  async create(@Body() createProvisionDto: CreateProvisionDto) {
    return this.provisionService.create(createProvisionDto);
  }
}
