import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingAddress } from './entities/shipping-address.entity';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ShippingAddressService {
  constructor(
    @InjectRepository(ShippingAddress)
    private readonly shippingAddressRepository: Repository<ShippingAddress>,
  ) {}

  async create(
    user: User,
    createDto: CreateShippingAddressDto,
  ): Promise<ShippingAddress> {
    if (createDto.isMain) {
      await this.unsetMainAddress(user.id);
    }

    // If it's the first address, make it main anyway
    const count = await this.shippingAddressRepository.count({
      where: { user: { id: user.id } },
    });
    const isMain = count === 0 ? true : !!createDto.isMain;

    const address = this.shippingAddressRepository.create({
      ...createDto,
      isMain,
      user,
    });

    return this.shippingAddressRepository.save(address);
  }

  async findAll(userId: string, page: number = 1, limit: number = 10) {
    const [data, total] = await this.shippingAddressRepository.findAndCount({
      where: { user: { id: userId } },
      order: { isMain: 'DESC', created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(userId: string, id: string): Promise<ShippingAddress> {
    const address = await this.shippingAddressRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException('Shipping address not found');
    }

    return address;
  }

  async update(
    userId: string,
    id: string,
    updateDto: UpdateShippingAddressDto,
  ): Promise<ShippingAddress> {
    const address = await this.findOne(userId, id);

    if (updateDto.isMain && !address.isMain) {
      await this.unsetMainAddress(userId);
    }

    Object.assign(address, updateDto);
    return this.shippingAddressRepository.save(address);
  }

  async remove(userId: string, id: string): Promise<void> {
    const address = await this.findOne(userId, id);
    const wasMain = address.isMain;

    await this.shippingAddressRepository.remove(address);

    // If we deleted the main address, make the most recent one main
    if (wasMain) {
      const nextAddress = await this.shippingAddressRepository.findOne({
        where: { user: { id: userId } },
        order: { created_at: 'DESC' },
      });
      if (nextAddress) {
        nextAddress.isMain = true;
        await this.shippingAddressRepository.save(nextAddress);
      }
    }
  }

  async setMain(userId: string, id: string): Promise<ShippingAddress> {
    await this.unsetMainAddress(userId);
    const address = await this.findOne(userId, id);
    address.isMain = true;
    return this.shippingAddressRepository.save(address);
  }

  private async unsetMainAddress(userId: string): Promise<void> {
    await this.shippingAddressRepository.update(
      { user: { id: userId }, isMain: true },
      { isMain: false },
    );
  }

  async findMain(userId: string): Promise<ShippingAddress | null> {
    return this.shippingAddressRepository.findOne({
      where: { user: { id: userId }, isMain: true },
    });
  }
}
