import { Repository, TreeRepository } from 'typeorm';

import { User } from '@modules/users/user.entity';
import { Neo4jService } from '@modules/neo4j/services';

import { GroupTag, Industry, Capability } from '../entities';
import { GroupTagService } from '../services';
import { GroupTagController } from '.';

const data: GroupTag[] = [
  new GroupTag({
    id: 1,
    name: 'GroupTag 1',
    tags: [],
    companyId: 1,
  }),
  new GroupTag({
    id: 2,
    name: 'GroupTag 2',
    tags: [],
    companyId: 1,
  }),
];

const user: User = {
  id: 1,
  email: 't@t.com',
  firstName: 'John',
  lastName: 'Doe',
};

describe('GroupTagController', () => {
  let groupTagController: GroupTagController;
  let groupTagService: GroupTagService;
  const groupTagRepository: Repository<GroupTag> = null;
  const capabilityRepository: Repository<Capability> = null;

  beforeEach(async () => {
    groupTagService = new GroupTagService(
      capabilityRepository,
      groupTagRepository,
    );
    groupTagController = new GroupTagController(groupTagService);
  });

  describe('findAll', () => {
    it('should return an array of groupTag', async () => {
      jest.spyOn(groupTagService, 'findAll').mockImplementation(() => Promise.resolve(data));

      expect(await groupTagController.findAll({})).toBe(data);
    });
  });

  describe('findOne', () => {
    it('should return a groupTag by id', async () => {
      const id = 1;
      const result = data.find(item => item.id === id);
      jest
        .spyOn(groupTagService, 'findOneById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await groupTagController.findOne(1)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a groupTag', async () => {
      const inputData = {
        name: 'GroupTag new',
        tags: [],
        companyId: 1,
      };
      const result = { ...inputData, id: 10 };
      jest.spyOn(groupTagService, 'create').mockImplementation(() => Promise.resolve(result));

      expect(await groupTagController.create(inputData)).toBe(result);
    });
  });

  describe('save', () => {
    it('should save a groupTag', async () => {
      const id = 1;
      const inputData = data.find(item => item.id === id);
      const result = { ...inputData };
      jest.spyOn(groupTagService, 'save').mockImplementation(() => Promise.resolve(result));

      expect(await groupTagController.save(id, inputData)).toBe(result);
    });
  });

  describe('saveMany', () => {
    it('should save many groupTag', async () => {
      const inputData = data.slice(0, 2);
      const result = { ...data };
      jest.spyOn(groupTagService, 'saveMany').mockImplementation(() => Promise.resolve(result));

      expect(await groupTagController.saveMany(inputData)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a groupTag', async () => {
      const id = 1;
      const result = { id };
      jest.spyOn(groupTagService, 'remove').mockImplementation(() => Promise.resolve(result));

      expect(await groupTagController.remove(id)).toBe(result);
    });
  });
});
