import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/resources/order/entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminOrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  findAll() {
    return this.ordersRepository.find({
      relations: ['user', 'items', 'items.product','items.product.business'],
    });
  }
}