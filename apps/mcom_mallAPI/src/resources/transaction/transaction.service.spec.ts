import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionService } from './transaction.service';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

describe('TransactionService', () => {
  let service: TransactionService;
  let repository: Repository<Transaction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    repository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const createTransactionDto: CreateTransactionDto = {
        userId: 'user-id',
        offerId: 'offer-id',
        discountAmount: 10,
      };
      const transaction = new Transaction();
      jest.spyOn(repository, 'create').mockReturnValue(transaction);
      jest.spyOn(repository, 'save').mockResolvedValue(transaction);

      const result = await service.create(createTransactionDto);

      expect(repository.create).toHaveBeenCalledWith({
        user: { id: 'user-id' },
        offer: { id: 'offer-id' },
        discountAmount: 10,
      });
      expect(repository.save).toHaveBeenCalledWith(transaction);
      expect(result).toEqual(transaction);
    });
  });

  describe('findByUserAndOffer', () => {
    it('should find transactions by user and offer', async () => {
      const transactions = [new Transaction()];
      jest.spyOn(repository, 'find').mockResolvedValue(transactions);

      const result = await service.findByUserAndOffer('user-id', 'offer-id');

      expect(repository.find).toHaveBeenCalledWith({
        where: { user: { id: 'user-id' }, offer: { id: 'offer-id' } },
      });
      expect(result).toEqual(transactions);
    });
  });
});
