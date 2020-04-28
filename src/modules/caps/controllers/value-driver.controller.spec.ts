import { Repository, TreeRepository } from 'typeorm';

import { User } from '@modules/users/user.entity';
import { Neo4jService } from '@modules/neo4j/services';

import { ValueDriver, Industry } from '../entities';
import { ValueDriverService } from '../services';
import { ValueDriverController } from '.';

const data: ValueDriver[] = [
  new ValueDriver({
    id: 1,
    name: 'ValueDriver 1',
    kpis: [],
    userId: 1,
    industryId: 1,
    companyId: 1,
  }),
  new ValueDriver({
    id: 2,
    name: 'ValueDriver 2',
    userId: 1,
    industryId: 1,
    companyId: 1,
  }),
];

const user: User = {
  id: 1,
  email: 't@t.com',
  firstName: 'John',
  lastName: 'Doe',
};

describe('ValueDriverController', () => {
  let valueDriverController: ValueDriverController;
  let valueDriverService: ValueDriverService;
  const valueDriverRepository: Repository<ValueDriver> = null;
  const valueDriverTreeRepository: TreeRepository<ValueDriver> = null;
  const industryRepository: Repository<Industry> = null;

  beforeEach(async () => {
    valueDriverService = new ValueDriverService(
      valueDriverRepository,
      valueDriverTreeRepository,
      industryRepository
    );
    valueDriverController = new ValueDriverController(valueDriverService);
  });

  describe('findAll', () => {
    it('should return an array of valueDriver', async () => {
      jest.spyOn(valueDriverService, 'findAll').mockImplementation(() => Promise.resolve(data));

      expect(await valueDriverController.findAll({})).toBe(data);
    });
  });

  describe('tree', () => {
    it('should return a tree of valueDriver', async () => {
      const query = { industryId: 1 };
      const result = {
        ...data[0],
        children: [],
      };
      jest
        .spyOn(valueDriverService, 'tree')
        .mockImplementation(() => Promise.resolve(result));

      expect(await valueDriverController.tree(query)).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a valueDriver by id', async () => {
      const id = 1;
      const result = data.find(item => item.id === id);
      jest
        .spyOn(valueDriverService, 'findOneById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await valueDriverController.findOne(1)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a valueDriver', async () => {
      const inputData = {
        name: 'ValueDriver new',
        kpis: [],
        userId: 1,
        industryId: 1,
        companyId: 1,
      };
      const result = { ...inputData, id: 10 };
      jest.spyOn(valueDriverService, 'create').mockImplementation(() => Promise.resolve(result));

      expect(await valueDriverController.create(inputData)).toBe(result);
    });
  });

  describe('save', () => {
    it('should save a valueDriver', async () => {
      const id = 1;
      const inputData = data.find(item => item.id === id);
      const result = { ...inputData };
      jest.spyOn(valueDriverService, 'save').mockImplementation(() => Promise.resolve(result));

      expect(await valueDriverController.save(id, inputData)).toBe(result);
    });
  });

  describe('saveMany', () => {
    it('should save many valueDriver', async () => {
      const inputData = data.slice(0, 2);
      const result = { ...data };
      jest.spyOn(valueDriverService, 'saveMany').mockImplementation(() => Promise.resolve(result));

      expect(await valueDriverController.saveMany(inputData)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a valueDriver', async () => {
      const id = 1;
      const result = { id };
      jest.spyOn(valueDriverService, 'remove').mockImplementation(() => Promise.resolve(result));

      expect(await valueDriverController.remove(id)).toBe(result);
    });
  });
});
