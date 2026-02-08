import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { HelpRequestsService } from './help-requests.service';
import { CreateHelpRequestDto } from './dto/create-help-request.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Help Requests')
@Controller('help-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class HelpRequestsController {
  constructor(private readonly helpRequestsService: HelpRequestsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Submit a new help request', 
    description: 'Allows Mall Owners/Sellers to request assistance from the 247GBS support team. Requests are synced to the central hub.' 
  })
  @ApiBody({ 
    type: CreateHelpRequestDto,
    examples: {
      productHelp: {
        summary: 'Product Variation Help',
        value: {
          type: 'PRODUCT_VARIATION_SETUP',
          title: 'Setup Size/Color for T-Shirts',
          description: 'I have a T-Shirt product but I am struggling to set up the matrix for Sizes (S, M, L) and Colors (Red, Blue).'
        }
      },
      inventoryHelp: {
        summary: 'Inventory Sync Issue',
        value: {
          type: 'INVENTORY_MANAGEMENT',
          title: 'Stock Not Updating',
          description: 'My inventory count does not seem to decrease when an order is placed. Can someone look into my settings?'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Help request successfully submitted.',
    schema: {
      example: {
        id: 'uuid-1234',
        requesterId: 'owner-uuid-567',
        type: 'PRODUCT_VARIATION_SETUP',
        title: 'Setup Size/Color for T-Shirts',
        description: 'I have a T-Shirt product...',
        status: 'SUBMITTED',
        createdAt: '2023-10-27T10:00:00.000Z',
        updatedAt: '2023-10-27T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. User must be logged in.' })
  create(@Request() req, @Body() createDto: CreateHelpRequestDto) {
    return this.helpRequestsService.create(req.user.id, createDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'List submitted help requests', 
    description: 'Retrieves the history of all help requests submitted by the currently logged-in user.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of help requests.',
    schema: {
      example: [
        {
          id: 'uuid-1234',
          type: 'PRODUCT_VARIATION_SETUP',
          title: 'Setup Size/Color',
          status: 'SUBMITTED',
          createdAt: '2023-10-27T10:00:00.000Z'
        }
      ]
    }
  })
  findAll(@Request() req) {
    return this.helpRequestsService.findAll(req.user.id);
  }
}
