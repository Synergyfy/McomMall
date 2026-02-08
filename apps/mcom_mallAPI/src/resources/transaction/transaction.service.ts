import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const { userId, offerId, discountAmount } = createTransactionDto;

    const transaction = this.transactionRepository.create({
      user: { id: userId },
      offer: { id: offerId },
      discountAmount,
    });

    return this.transactionRepository.save(transaction);
  }

  async findByUserAndOffer(
    userId: string,
    offerId: string,
  ): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { user: { id: userId }, offer: { id: offerId } },
    });
  }
}
