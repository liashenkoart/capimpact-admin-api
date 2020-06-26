import { Repository, TreeRepository } from 'typeorm';

import { User } from '@modules/users/user.entity';
import { Neo4jService } from '@modules/neo4j/services';

import { Process, Industry, KpiLib } from '../entities';
import { ProcessService } from '../services';
import { ProcessController } from '.';

const data: Process[] = [
  new Process({
    id: 1,
    name: 'Process 1',
    pcf_id: '',
    hierarchy_id: '',
    difference_idx: '',
    change_details: '',
    metrics_avail: true,
    user_id: 1,
    industry_id: 1  ,
    company_id: 1,
  }),
  new Process({
    id: 2,
    name: 'Process 2',
    pcf_id: '',
    hierarchy_id: '',
    difference_idx: '',
    change_details: '',
    metrics_avail: true,
    user_id: 1,
    industry_id: 1  ,
    company_id: 1,
  }),
];

const user: User = {
  id: 1,
  email: 't@t.com',
  firstName: 'John',
  lastName: 'Doe',
};

describe('ProcessController', () => {
  let processController: ProcessController;
  let processService: ProcessService;
  const kpiLibRepository: Repository<KpiLib> = null;
  const processRepository: Repository<Process> = null;
  const processTreeRepository: TreeRepository<Process> = null;
  const industryRepository: Repository<Industry> = null;
  const neo4jService: Neo4jService = null;

  beforeEach(async () => {
    processService = new ProcessService(
      neo4jService,
      kpiLibRepository,
      processRepository,
      processTreeRepository,
      industryRepository
    );
    processController = new ProcessController(processService);
  });

  describe('findAll', () => {
    it('should return an array of process', async () => {
      jest.spyOn(processService, 'findAll').mockImplementation(() => Promise.resolve(data));

      expect(await processController.findAll({})).toBe(data);
    });
  });

  describe('tree', () => {
    it('should return a tree of process', async () => {
      const query = { industry_id: 1 };
      const result = {
        ...data[0],
        children: [],
      };
      jest
        .spyOn(processService, 'tree')
        .mockImplementation(() => Promise.resolve(result));

      expect(await processController.tree(query)).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a process by id', async () => {
      const id = 1;
      const result = data.find(item => item.id === id);
      jest
        .spyOn(processService, 'findOneById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await processController.findOne(1)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a process', async () => {
      const inputData = {
        name: 'Process new',
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
      jest.spyOn(processService, 'create').mockImplementation(() => Promise.resolve(result));

      expect(await processController.create(inputData, user)).toBe(result);
    });
  });

  describe('save', () => {
    it('should save a process', async () => {
      const id = 1;
      const inputData = data.find(item => item.id === id);
      const result = { ...inputData };
      jest.spyOn(processService, 'save').mockImplementation(() => Promise.resolve(result));

      expect(await processController.save(id, inputData, { user })).toBe(result);
    });
  });

  describe('saveMany', () => {
    it('should save many process', async () => {
      const inputData = data.slice(0, 2);
      const result = { ...data };
      jest.spyOn(processService, 'saveMany').mockImplementation(() => Promise.resolve(result));

      expect(await processController.saveMany(inputData, { user })).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a process', async () => {
      const id = 1;
      const result = { id };
      jest.spyOn(processService, 'remove').mockImplementation(() => Promise.resolve(result));

      expect(await processController.remove(id)).toBe(result);
    });
  });
});
