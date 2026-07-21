import { Test, TestingModule } from '@nestjs/testing';
import { GoogleBusinessService } from './google-business.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sector } from '../taxonomy/entities/sector.entity';
import { TaxonomyCategory } from '../taxonomy/entities/taxonomy-category.entity';
import { TaxonomySubcategory } from '../taxonomy/entities/taxonomy-subcategory.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ListingsService } from '../listings/listing.service';
import { AuthService } from '../auth/auth.service';
import { DataSource } from 'typeorm';

describe('GoogleBusinessService', () => {
  let service: GoogleBusinessService;
  let sectorRepository: any;

  const mockSectors = [
    {
      id: 'sector-electronics',
      name: 'Electronics & Gadgets',
      categories: [
        {
          id: 'category-computers',
          name: 'Computers & Technology',
          subcategories: [
            {
              id: 'subcategory-laptops',
              name: 'Laptops & Devices',
            },
          ],
        },
      ],
    },
    {
      id: 'sector-food',
      name: 'Food & Drink Cafe',
      categories: [
        {
          id: 'category-coffee',
          name: 'Coffee & Drinks',
          subcategories: [
            {
              id: 'subcategory-espresso',
              name: 'Espresso Bar',
            },
          ],
        },
      ],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleBusinessService,
        {
          provide: getRepositoryToken(Sector),
          useValue: {
            find: jest.fn().mockResolvedValue(mockSectors),
          },
        },
        {
          provide: getRepositoryToken(TaxonomyCategory),
          useValue: {},
        },
        {
          provide: getRepositoryToken(TaxonomySubcategory),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            updateLastLogin: jest.fn(),
          },
        },
        {
          provide: ListingsService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            createLogin: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GoogleBusinessService>(GoogleBusinessService);
    sectorRepository = module.get(getRepositoryToken(Sector));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mapGoogleCategory', () => {
    it('should map a computer store to electronics sector and category', async () => {
      const result = await service.mapGoogleCategory('gcid:computer_store');
      expect(result).toBeDefined();
      expect(result.sectorId).toBe('sector-electronics');
      expect(result.categoryId).toBe('category-computers');
      expect(result.subCategoryId).toBe('subcategory-laptops');
    });

    it('should map a coffee shop to food and drink sector and category', async () => {
      const result = await service.mapGoogleCategory('gcid:coffee_shop');
      expect(result).toBeDefined();
      expect(result.sectorId).toBe('sector-food');
      expect(result.categoryId).toBe('category-coffee');
      expect(result.subCategoryId).toBe('subcategory-espresso');
    });

    it('should return null for an unknown category ID', async () => {
      const result = await service.mapGoogleCategory(
        'gcid:unknown_or_generic_category',
      );
      expect(result).toBeNull();
    });
  });
});
