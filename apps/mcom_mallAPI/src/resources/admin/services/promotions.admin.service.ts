import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Promotion } from '../../../resources/promotion/entities/promotion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminPromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionsRepository: Repository<Promotion>,
  ) {}

  findAll() {
    return this.promotionsRepository.find({
      relations: ['user', 'businesses', 'participants', 'excludedProducts', 'includedProducts'],
    });
  }
}