import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from 'src/resources/listings/entities/listing.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminListingsService {
  constructor(
    @InjectRepository(Business)
    private listingsRepository: Repository<Business>,
  ) {}

  findAll() {
    return this.listingsRepository.find({
      relations: ['user', 'products', 'services', 'reviews', 'promotions'],
    });
  }
}