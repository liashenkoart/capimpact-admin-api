import { Repository, TreeRepository } from 'typeorm';

import { User } from '@modules/users/user.entity';
import { Neo4jService } from '@modules/neo4j/services';

import { GroupFilter, Industry, Capability } from '../entities';
import { GroupFilterService } from '../services';
import { GroupFilterController } from '.';

const data: GroupFilter[] = [
  new GroupFilter({
    id: 1,
    name: 'GroupFilter 1',
    filters: [],
    companyId: 1,
  }),
  new GroupFilter({
    id: 2,
    name: 'GroupFilter 2',
    filters: [],
    companyId: 1,
  }),
];

const user: User = {
  id: 1,
  email: 't@t.com',
  firstName: 'John',
  lastName: 'Doe',
};

describe('GroupFilterController', () => {
  let groupFilterController: GroupFilterController;
  let groupFilterService: GroupFilterService;
  const groupFilterRepository: Repository<GroupFilter> = null;
  const capabilityRepository: Repository<Capability> = null;
  
  beforeEach(async () => {
    groupFilterService = new GroupFilterService(
      capabilityRepository,
      groupFilterRepository,
    );
    groupFilterController = new GroupFilterController(groupFilterService);
  });

  describe('findAll', () => {
    it('should return an array of groupFilter', async () => {
      jest.spyOn(groupFilterService, 'findAll').mockImplementation(() => Promise.resolve(data));

      expect(await groupFilterController.findAll({})).toBe(data);
    });
  });

  describe('findOne', () => {
    it('should return a groupFilter by id', async () => {
      const id = 1;
      const result = data.find(item => item.id === id);
      jest
        .spyOn(groupFilterService, 'findOneById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await groupFilterController.findOne(1)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a groupFilter', async () => {
      const inputData = {
        name: 'GroupFilter new',
        filters: [],
        companyId: 1,
      };
      const result = { ...inputData, id: 10 };
      jest.spyOn(groupFilterService, 'create').mockImplementation(() => Promise.resolve(result));

      expect(await groupFilterController.create(inputData)).toBe(result);
    });
  });

  describe('save', () => {
    it('should save a groupFilter', async () => {
      const id = 1;
      const inputData = data.find(item => item.id === id);
      const result = { ...inputData };
      jest.spyOn(groupFilterService, 'save').mockImplementation(() => Promise.resolve(result));

      expect(await groupFilterController.save(id, inputData)).toBe(result);
    });
  });

  describe('saveMany', () => {
    it('should save many groupFilter', async () => {
      const inputData = data.slice(0, 2);
      const result = { ...data };
      jest.spyOn(groupFilterService, 'saveMany').mockImplementation(() => Promise.resolve(result));

      expect(await groupFilterController.saveMany(inputData)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a groupFilter', async () => {
      const id = 1;
      const result = { id };
      jest.spyOn(groupFilterService, 'remove').mockImplementation(() => Promise.resolve(result));

      expect(await groupFilterController.remove(id)).toBe(result);
    });
  });
});
