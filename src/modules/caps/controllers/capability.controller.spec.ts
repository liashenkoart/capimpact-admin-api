import { Repository, TreeRepository } from 'typeorm';

import { User } from '@modules/users/user.entity';
import { Neo4jService } from '@modules/neo4j/services';

import { Capability, Industry } from '../entities';
import { CapabilityService } from '../services';
import { CapabilityController } from '.';

const data: Capability[] = [
  new Capability({
    id: 1,
    name: 'Capability 1',
    default: false,
    capitalCosts: 1.0,
    fte: 1.0,
    salaryCosts: 1.0,
    tags: { tag: true },
    filters: {},
    kpis: ['a', 'b', 'c'],
    hierarchy_id: 'hierarchy_id',
    user_id: 1,
    industry_id: 1,
    company_id: 1,
    parentId: null,
    last_update: new Date(),
  }),
  new Capability({
    id: 2,
    name: 'Capability 2',
    default: false,
    capitalCosts: 1.0,
    fte: 1.0,
    salaryCosts: 1.0,
    tags: { tag: true },
    filters: {},
    kpis: ['a', 'b', 'c'],
    hierarchy_id: 'hierarchy_id',
    user_id: 1,
    industry_id: 1,
    company_id: 1,
    parentId: null,
    last_update: new Date(),
  }),
];

const user: User = {
  id: 1,
  email: 't@t.com',
  firstName: 'John',
  lastName: 'Doe',
};

describe('CapabilityController', () => {
  let capabilityController: CapabilityController;
  let capabilityService: CapabilityService;
  const capabilityRepository: Repository<Capability> = null;
  const capabilityTreeRepository: TreeRepository<Capability> = null;
  const industryRepository: Repository<Industry> = null;
  const neo4jService: Neo4jService = null;

  beforeEach(async () => {
    capabilityService = new CapabilityService(
      neo4jService,
      capabilityRepository,
      capabilityTreeRepository,
      industryRepository
    );
    capabilityController = new CapabilityController(capabilityService);
  });

  describe('findAll', () => {
    it('should return an array of capability', async () => {
      jest.spyOn(capabilityService, 'findAll').mockImplementation(() => Promise.resolve(data));

      expect(await capabilityController.findAll({})).toBe(data);
    });
  });

  describe('tree', () => {
    it('should return a tree of capability', async () => {
      const query = { company_id: 1 };
      const result = {
        ...data[0],
        children: [],
      };
      jest
        .spyOn(capabilityService, 'tree')
        .mockImplementation(() => Promise.resolve(result));

      expect(await capabilityController.tree(query)).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a capability by id', async () => {
      const id = 1;
      const result = data.find(item => item.id === id);
      jest
        .spyOn(capabilityService, 'findOneById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await capabilityController.findOne(1)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a capability', async () => {
      const inputData = {
        name: 'Capability new',
        default: false,
        capitalCosts: 1.0,
        fte: 1.0,
        salaryCosts: 1.0,
        tags: { tag: true },
        filters: {},
        kpis: ['a', 'b', 'c'],
        hierarchy_id: 'hierarchy_id',
        user_id: 1,
        industry_id: 1,
        company_id: 1,
        parentId: null,
      };
      const result = { ...inputData, id: 10 };
      jest.spyOn(capabilityService, 'create').mockImplementation(() => Promise.resolve(result));

      expect(await capabilityController.create(inputData, user)).toBe(result);
    });
  });

  describe('save', () => {
    it('should save a capability', async () => {
      const id = 1;
      const inputData = data.find(item => item.id === id);
      const result = { ...inputData };
      jest.spyOn(capabilityService, 'save').mockImplementation(() => Promise.resolve(result));

      expect(await capabilityController.save(id, inputData, { user })).toBe(result);
    });
  });

  describe('saveMany', () => {
    it('should save many capability', async () => {
      const inputData = data.slice(0, 2);
      const result = { ...data };
      jest.spyOn(capabilityService, 'saveMany').mockImplementation(() => Promise.resolve(result));

      expect(await capabilityController.saveMany(inputData, { user })).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a capability', async () => {
      const id = 1;
      const result = { id };
      jest.spyOn(capabilityService, 'remove').mockImplementation(() => Promise.resolve(result));

      expect(await capabilityController.remove(id)).toBe(result);
    });
  });
});
