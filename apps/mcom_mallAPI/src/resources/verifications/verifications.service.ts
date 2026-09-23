import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Verification,
  VerificationStatus,
  VerificationSubjectType,
} from './entities/verification.entity';
import { Business } from '../listings/entities/listing.entity';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';

@Injectable()
export class VerificationsService {
  constructor(
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async submit(dto: CreateVerificationDto): Promise<Verification> {
    const verification = this.verificationRepository.create({
      ...dto,
      status: VerificationStatus.PENDING,
    });
    return this.verificationRepository.save(verification);
  }

  async findAll(status?: VerificationStatus, subjectType?: VerificationSubjectType): Promise<Verification[]> {
    return this.verificationRepository.find({
      where: {
        ...(status ? { status } : {}),
        ...(subjectType ? { subjectType } : {}),
      },
      order: { created_at: 'DESC' },
    });
  }

  async getStats(): Promise<{ total: number; pending: number; approved: number; rejected: number }> {
    const [total, pending, approved, rejected] = await Promise.all([
      this.verificationRepository.count(),
      this.verificationRepository.count({ where: { status: VerificationStatus.PENDING } }),
      this.verificationRepository.count({ where: { status: VerificationStatus.APPROVED } }),
      this.verificationRepository.count({ where: { status: VerificationStatus.REJECTED } }),
    ]);
    return { total, pending, approved, rejected };
  }

  async findOne(id: string): Promise<Verification> {
    const verification = await this.verificationRepository.findOne({ where: { id } });
    if (!verification) {
      throw new NotFoundException(`Verification with ID ${id} was not found`);
    }
    return verification;
  }

  async approve(id: string, dto: ReviewVerificationDto, reviewerId: string): Promise<Verification> {
    const verification = await this.findOne(id);
    if (verification.status !== VerificationStatus.PENDING) {
      throw new BadRequestException('Only pending verifications can be reviewed');
    }
    verification.status = VerificationStatus.APPROVED;
    verification.reviewNote = dto.reviewNote;
    verification.reviewedBy = reviewerId;
    const saved = await this.verificationRepository.save(verification);

    // Real side effect: approving a business verification marks the business verified
    if (verification.subjectType === VerificationSubjectType.BUSINESS && verification.subjectId) {
      await this.businessRepository.update(
        { id: verification.subjectId },
        { isVerified: true },
      );
    }
    return saved;
  }

  async reject(id: string, dto: ReviewVerificationDto, reviewerId: string): Promise<Verification> {
    const verification = await this.findOne(id);
    if (verification.status !== VerificationStatus.PENDING) {
      throw new BadRequestException('Only pending verifications can be reviewed');
    }
    verification.status = VerificationStatus.REJECTED;
    verification.reviewNote = dto.reviewNote;
    verification.reviewedBy = reviewerId;
    return this.verificationRepository.save(verification);
  }
}
