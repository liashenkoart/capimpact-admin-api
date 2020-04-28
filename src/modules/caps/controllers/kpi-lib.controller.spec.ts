import { Repository, TreeRepository } from 'typeorm';

import { User } from '@modules/users/user.entity';
import { Neo4jService } from '@modules/neo4j/services';

import { KpiLib, Industry, BenefitType } from '../entities';
import { KpiLibService } from '../services';
import { KpiLibController } from '.';

const data: KpiLib[] = [
  new KpiLib({
    id: 1,
    label: 'KpiLib 1',
    description: '',
    kpi: 'kpi string',
    tags: [],
    source: '',
    benefitType: BenefitType.Revenue,
    isActive: true,
  }),
  new KpiLib({
    id: 2,
    label: 'KpiLib 2',
    description: '',
    kpi: 'kpi string',
    tags: [],
    source: '',
    benefitType: BenefitType.Revenue,
    isActive: true,
  }),
];

const user: User = {
  id: 1,
  email: 't@t.com',
  firstName: 'John',
  lastName: 'Doe',
};

describe('KpiLibController', () => {
  let kpiLibController: KpiLibController;
  let kpiLibService: KpiLibService;
  const kpiLibRepository: Repository<KpiLib> = null;

  beforeEach(async () => {
    kpiLibService = new KpiLibService(
      kpiLibRepository,
    );
    kpiLibController = new KpiLibController(kpiLibService);
  });

  describe('findAll', () => {
    it('should return an array of kpiLib', async () => {
      jest.spyOn(kpiLibService, 'findAll').mockImplementation(() => Promise.resolve(data));

      expect(await kpiLibController.findAll({})).toBe(data);
    });
  });

  describe('findOne', () => {
    it('should return a kpiLib by id', async () => {
      const id = 1;
      const result = data.find(item => item.id === id);
      jest
        .spyOn(kpiLibService, 'findOneById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await kpiLibController.findOne(1)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a kpiLib', async () => {
      const inputData = {
        label: 'KpiLib new',
        description: '',
        kpi: 'kpi string',
        tags: [],
        source: '',
        benefitType: BenefitType.Revenue,
        isActive: true,
      };
      const result = { ...inputData, id: 10 };
      jest.spyOn(kpiLibService, 'create').mockImplementation(() => Promise.resolve(result));

      expect(await kpiLibController.create(inputData)).toBe(result);
    });
  });

  describe('save', () => {
    it('should save a kpiLib', async () => {
      const id = 1;
      const inputData = data.find(item => item.id === id);
      const result = { ...inputData };
      jest.spyOn(kpiLibService, 'save').mockImplementation(() => Promise.resolve(result));

      expect(await kpiLibController.save(id, inputData)).toBe(result);
    });
  });

  describe('saveMany', () => {
    it('should save many kpiLib', async () => {
      const inputData = data.slice(0, 2);
      const result = { ...data };
      jest.spyOn(kpiLibService, 'saveMany').mockImplementation(() => Promise.resolve(result));

      expect(await kpiLibController.saveMany(inputData)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a kpiLib', async () => {
      const id = 1;
      const result = { id };
      jest.spyOn(kpiLibService, 'remove').mockImplementation(() => Promise.resolve(result));

      expect(await kpiLibController.remove(id)).toBe(result);
    });
  });
});
