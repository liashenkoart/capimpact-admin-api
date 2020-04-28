import { Repository, TreeRepository } from 'typeorm';

import { User } from '@modules/users/user.entity';
import { Neo4jService } from '@modules/neo4j/services';

import { Startup, Industry, Capability } from '../entities';
import { StartupService, CapabilityService } from '../services';
import { StartupController } from '.';

const data: Startup[] = [
  new Startup({
    cid: '1',
    name: 'startup 1'
  }),
  new Startup({
    cid: '2',
    name: 'startup 2'
  }),
];

const user: User = {
  id: 1,
  email: 't@t.com',
  firstName: 'John',
  lastName: 'Doe',
};

describe('StartupController', () => {
  let startupController: StartupController;
  let startupService: StartupService;
  const startupRepository: Repository<Startup> = null;
  const capabilityRepository: Repository<Capability> = null;
  const neo4jService: Neo4jService = null;

  beforeEach(async () => {
    startupService = new StartupService(
      neo4jService,
      capabilityRepository,
      startupRepository,
    );
    startupController = new StartupController(startupService);
  });

  describe('findAll', () => {
    it('should return an array of startup', async () => {
      jest.spyOn(startupService, 'findAll').mockImplementation(() => Promise.resolve(data));

      expect(await startupController.findAll({})).toBe(data);
    });
  });

  describe('findOne', () => {
    it('should return a startup by id', async () => {
      const cid = '1';
      const result = data.find(item => item.cid === cid);
      jest
        .spyOn(startupService, 'findOneById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await startupController.findOne('1')).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a startup', async () => {
      const inputData = {
        name: 'startup new'
      };
      const result = { ...inputData, cid: '3' };
      jest.spyOn(startupService, 'create').mockImplementation(() => Promise.resolve(result));

      expect(await startupController.create(inputData)).toBe(result);
    });
  });

  describe('save', () => {
    it('should save a startup', async () => {
      const cid = '1';
      const inputData = data.find(item => item.cid === cid);
      const result = { ...inputData };
      jest.spyOn(startupService, 'save').mockImplementation(() => Promise.resolve(result));

      expect(await startupController.save(cid, inputData)).toBe(result);
    });
  });

  describe('saveMany', () => {
    it('should save many startup', async () => {
      const inputData = data.slice(0, 2);
      const result = { ...data };
      jest.spyOn(startupService, 'saveMany').mockImplementation(() => Promise.resolve(result));

      expect(await startupController.saveMany(inputData)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a startup', async () => {
      const cid = '1';
      const result = { cid };
      jest.spyOn(startupService, 'remove').mockImplementation(() => Promise.resolve(result));

      expect(await startupController.remove(cid)).toBe(result);
    });
  });
});
