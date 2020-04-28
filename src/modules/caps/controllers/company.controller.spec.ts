import { Repository, TreeRepository } from 'typeorm';

import { User } from '@modules/users/user.entity';
import { Neo4jService } from '@modules/neo4j/services';

import { Company, Industry, Capability } from '../entities';
import { CompanyService } from '../services';
import { CompanyController } from '.';

const data: Company[] = [
  new Company({
    id: 1,
    name: 'Company 1',
    cid: 'cid',
    user_id: 1,
    industry_id: 1,
  }),
  new Company({
    id: 2,
    name: 'Company 2',
    cid: 'cid',
    user_id: 1,
    industry_id: 1,
  }),
];

const user: User = {
  id: 1,
  email: 't@t.com',
  firstName: 'John',
  lastName: 'Doe',
};

describe('CompanyController', () => {
  let companyController: CompanyController;
  let companyService: CompanyService;
  const companyRepository: Repository<Company> = null;
  const capabilityTreeRepository: TreeRepository<Capability> = null;
  const capabilityRepository: Repository<Capability> = null;
  const neo4jService: Neo4jService = null;

  beforeEach(async () => {
    companyService = new CompanyService(
      companyRepository,
      capabilityTreeRepository,
      capabilityRepository,
      neo4jService,
    );
    companyController = new CompanyController(companyService, neo4jService);
  });

  describe('findAll', () => {
    it('should return an array of company', async () => {
      jest.spyOn(companyService, 'findAll').mockImplementation(() => Promise.resolve(data));

      expect(await companyController.findAll({})).toBe(data);
    });
  });
  
  describe('findOne', () => {
    it('should return a company by id', async () => {
      const id = 1;
      const result = data.find(item => item.id === id);
      jest
        .spyOn(companyService, 'findOneById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await companyController.findOne(1)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a company', async () => {
      const inputData = {
        name: 'Company new',
        cid: 'cid',
        user_id: 1,
        industry_id: 1,
      };
      const result = { ...inputData, id: 10 };
      jest.spyOn(companyService, 'create').mockImplementation(() => Promise.resolve(result));

      expect(await companyController.create(inputData, user)).toBe(result);
    });
  });

  describe('save', () => {
    it('should save a company', async () => {
      const id = 1;
      const inputData = data.find(item => item.id === id);
      const result = { ...inputData };
      jest.spyOn(companyService, 'save').mockImplementation(() => Promise.resolve(result));

      expect(await companyController.save(id, inputData)).toBe(result);
    });
  });

  describe('saveMany', () => {
    it('should save many company', async () => {
      const inputData = data.slice(0, 2);
      const result = { ...data };
      jest.spyOn(companyService, 'saveMany').mockImplementation(() => Promise.resolve(result));

      expect(await companyController.saveMany(inputData, { user })).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a company', async () => {
      const id = 1;
      const result = { id };
      jest.spyOn(companyService, 'remove').mockImplementation(() => Promise.resolve(result));

      expect(await companyController.remove(id)).toBe(result);
    });
  });
});
