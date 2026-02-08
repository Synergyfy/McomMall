import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partnership } from './entities/partnership.entity';
import { PartnershipRequest } from './entities/partnership-request.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { User } from '../users/entities/user.entity';
import { CreatePartnershipRequestDto } from './dto/create-partnership-request.dto';
import { PartnershipRequestStatus } from './partnership.enum';
import { RespondToPartnershipRequestDto } from './dto/respond-to-partnership-request.dto';

@Injectable()
export class PartnershipService {
  constructor(
    @InjectRepository(Partnership)
    private readonly partnershipRepository: Repository<Partnership>,
    @InjectRepository(PartnershipRequest)
    private readonly partnershipRequestRepository: Repository<PartnershipRequest>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async createPartnershipRequest(
    createPartnershipRequestDto: CreatePartnershipRequestDto,
    requestingUser: User,
  ): Promise<PartnershipRequest> {
    const { productId, serviceId } = createPartnershipRequestDto;

    const product = await this.productRepository.findOne({ where: { id: productId }, relations: ['business', 'business.user'] });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.business.user.id !== requestingUser.id) {
      throw new UnauthorizedException('You do not own this product');
    }

    const service = await this.serviceRepository.findOne({ where: { id: serviceId }, relations: ['business', 'business.user'] });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const partnershipRequest = this.partnershipRequestRepository.create({
      product,
      service,
      requestingUser,
      serviceOwner: service.business.user,
    });

    return this.partnershipRequestRepository.save(partnershipRequest);
  }

  async getReceivedPartnershipRequests(user: User): Promise<PartnershipRequest[]> {
    return this.partnershipRequestRepository.find({
      where: { serviceOwner: { id: user.id } },
      relations: ['product', 'service', 'requestingUser'],
    });
  }

  async getSentPartnershipRequests(user: User): Promise<PartnershipRequest[]> {
    return this.partnershipRequestRepository.find({
      where: { requestingUser: { id: user.id } },
      relations: ['product', 'service', 'serviceOwner'],
    });
  }

  async respondToPartnershipRequest(
    id: string,
    respondToPartnershipRequestDto: RespondToPartnershipRequestDto,
    user: User,
  ): Promise<PartnershipRequest> {
    const partnershipRequest = await this.partnershipRequestRepository.findOne({
        where: { id },
        relations: ['service', 'service.business', 'service.business.user', 'product']
    });

    if (!partnershipRequest) {
      throw new NotFoundException('Partnership request not found');
    }

    if (partnershipRequest.service.business.user.id !== user.id) {
      throw new UnauthorizedException('You are not authorized to respond to this request');
    }

    partnershipRequest.status = respondToPartnershipRequestDto.status;

    if (respondToPartnershipRequestDto.status === PartnershipRequestStatus.ACCEPTED) {
      const partnership = this.partnershipRepository.create({
        product: partnershipRequest.product,
        service: partnershipRequest.service,
        partnershipRequest,
      });
      await this.partnershipRepository.save(partnership);
    }

    return this.partnershipRequestRepository.save(partnershipRequest);
  }

  async getProductPartnerships(productId: string): Promise<Service[]> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const partnerships = await this.partnershipRepository.find({
      where: {
        product: { id: productId },
        isActive: true,
      },
      relations: ['service'],
    });

    return partnerships.map(p => p.service);
  }
}