import { Repository, TreeRepository } from 'typeorm';

import { User } from '@modules/users/user.entity';
import { Neo4jService } from '@modules/neo4j/services';

import { KpiBenchmark, Industry } from '../entities';
import { KpiBenchmarkService } from '../services';
import { KpiBenchmarkController } from '.';

const data: KpiBenchmark[] = [
  new KpiBenchmark({
    id: 1,
    benchmark: 1,
    kpilibId: 1,
    industryId: 1,
  }),
  new KpiBenchmark({
    id: 2,
    benchmark: 1,
    kpilibId: 1,
    industryId: 1,
  }),
];

const user: User = {
  id: 1,
  email: 't@t.com',
  firstName: 'John',
  lastName: 'Doe',
};

describe('KpiBenchmarkController', () => {
  let kpiBenchmarkController: KpiBenchmarkController;
  let kpiBenchmarkService: KpiBenchmarkService;
  const kpiBenchmarkRepository: Repository<KpiBenchmark> = null;

  beforeEach(async () => {
    kpiBenchmarkService = new KpiBenchmarkService(
      kpiBenchmarkRepository,
    );
    kpiBenchmarkController = new KpiBenchmarkController(kpiBenchmarkService);
  });

  describe('findAll', () => {
    it('should return an array of kpiBenchmark', async () => {
      jest.spyOn(kpiBenchmarkService, 'findAll').mockImplementation(() => Promise.resolve(data));

      expect(await kpiBenchmarkController.findAll({})).toBe(data);
    });
  });
  describe('findOne', () => {
    it('should return a kpiBenchmark by id', async () => {
      const id = 1;
      const result = data.find(item => item.id === id);
      jest
        .spyOn(kpiBenchmarkService, 'findOneById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await kpiBenchmarkController.findOne(1)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a kpiBenchmark', async () => {
      const inputData = {
        benchmark: 1,
        kpilibId: 1,
        industryId: 1,
      };
      const result = { ...inputData, id: 10 };
      jest.spyOn(kpiBenchmarkService, 'create').mockImplementation(() => Promise.resolve(result));

      expect(await kpiBenchmarkController.create(inputData)).toBe(result);
    });
  });

  describe('save', () => {
    it('should save a kpiBenchmark', async () => {
      const id = 1;
      const inputData = data.find(item => item.id === id);
      const result = { ...inputData };
      jest.spyOn(kpiBenchmarkService, 'save').mockImplementation(() => Promise.resolve(result));

      expect(await kpiBenchmarkController.save(id, inputData)).toBe(result);
    });
  });

  describe('saveMany', () => {
    it('should save many kpiBenchmark', async () => {
      const inputData = data.slice(0, 2);
      const result = { ...data };
      jest.spyOn(kpiBenchmarkService, 'saveMany').mockImplementation(() => Promise.resolve(result));

      expect(await kpiBenchmarkController.saveMany(inputData)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a kpiBenchmark', async () => {
      const id = 1;
      const result = { id };
      jest.spyOn(kpiBenchmarkService, 'remove').mockImplementation(() => Promise.resolve(result));

      expect(await kpiBenchmarkController.remove(id)).toBe(result);
    });
  });
});
