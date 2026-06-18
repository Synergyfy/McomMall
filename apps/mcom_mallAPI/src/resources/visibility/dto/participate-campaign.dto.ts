import { IsNotEmpty, IsUUID } from 'class-validator';

export class ParticipateCampaignDto {
  @IsUUID()
  @IsNotEmpty()
  businessId: string;
}
