import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessClaim, ClaimStatus } from './entities/business-claim.entity';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(BusinessClaim)
    private readonly businessClaimRepository: Repository<BusinessClaim>,
  ) {}

  async submitClaim(createDto: CreateClaimDto): Promise<BusinessClaim> {
    const claim = this.businessClaimRepository.create({
      businessId: createDto.businessId,
      status: ClaimStatus.PENDING,
      verificationDocs: {
        businessLicenseUrl: createDto.businessLicenseUrl,
        ownerName: createDto.ownerName,
        notes: createDto.notes,
      },
      activationScore: Math.round(50 + Math.random() * 30), // Initial random profile score
    });
    return this.businessClaimRepository.save(claim);
  }

  async findAll(): Promise<BusinessClaim[]> {
    return this.businessClaimRepository.find({
      relations: ['business'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<BusinessClaim> {
    const claim = await this.businessClaimRepository.findOne({
      where: { id },
      relations: ['business'],
    });
    if (!claim) {
      throw new NotFoundException(`Storefront claim request with ID ${id} not found`);
    }
    return claim;
  }

  async updateStatus(id: string, updateDto: UpdateClaimDto): Promise<BusinessClaim> {
    const claim = await this.findOne(id);
    claim.status = updateDto.status;
    return this.businessClaimRepository.save(claim);
  }
}
