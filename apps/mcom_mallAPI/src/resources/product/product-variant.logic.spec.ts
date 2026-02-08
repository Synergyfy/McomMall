import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Partnership } from '../partnership/entities/partnership.entity';
import { PartnershipRequest } from '../partnership/entities/partnership-request.entity';
import { Trial } from '../payments/entities/trial.entity';
import { ActivitiesService } from '../activities/activities.service';
import { TrialService } from '../trial/trial.service';
import { PromotionService } from '../promotion/promotion.service';
import { CapabilityService } from '../capability/capability.service';

describe('ProductService - Variant Logic', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getRepositoryToken(Product), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Partnership), useValue: {} },
        { provide: getRepositoryToken(PartnershipRequest), useValue: {} },
        { provide: getRepositoryToken(Trial), useValue: {} },
        { provide: ActivitiesService, useValue: {} },
        { provide: TrialService, useValue: {} },
        { provide: PromotionService, useValue: {} },
        { provide: CapabilityService, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  describe('calculatePrice', () => {
    it('should return base price if no variants configured', () => {
      const product = new Product();
      product.price = 20;
      product.variantConfig = [];

      const price = service.calculatePrice(product, {});
      expect(price).toBe(20);
    });

    it('should return base price if no options selected', () => {
      const product = new Product();
      product.price = 20;
      product.variantConfig = [
        {
          name: 'Color',
          type: 'select',
          options: [{ name: 'Blue', priceModifier: 3 }],
        },
      ];

      const price = service.calculatePrice(product, {});
      expect(price).toBe(20);
    });

    it('should add price modifier for selected option', () => {
      const product = new Product();
      product.price = 20;
      product.variantConfig = [
        {
          name: 'Color',
          type: 'select',
          options: [
            { name: 'Red', priceModifier: 0 },
            { name: 'Blue', priceModifier: 3 },
          ],
        },
      ];

      const price = service.calculatePrice(product, { Color: 'Blue' });
      expect(price).toBe(23); // 20 + 3
    });

    it('should add price modifiers for multiple selected options', () => {
      const product = new Product();
      product.price = 20;
      product.variantConfig = [
        {
          name: 'Color',
          type: 'select',
          options: [{ name: 'Blue', priceModifier: 3 }],
        },
        {
          name: 'Size',
          type: 'select',
          options: [{ name: 'XL', priceModifier: 5 }],
        },
      ];

      const price = service.calculatePrice(product, { Color: 'Blue', Size: 'XL' });
      expect(price).toBe(28); // 20 + 3 + 5
    });

    it('should ignore invalid options', () => {
      const product = new Product();
      product.price = 20;
      product.variantConfig = [
        {
          name: 'Color',
          type: 'select',
          options: [{ name: 'Blue', priceModifier: 3 }],
        },
      ];

      const price = service.calculatePrice(product, { Color: 'Green' }); // Green doesn't exist
      expect(price).toBe(20);
    });

    it('should handle negative modifiers', () => {
        const product = new Product();
        product.price = 20;
        product.variantConfig = [
          {
            name: 'Condition',
            type: 'select',
            options: [{ name: 'Used', priceModifier: -5 }],
          },
        ];
  
        const price = service.calculatePrice(product, { Condition: 'Used' });
        expect(price).toBe(15);
      });
  });
});