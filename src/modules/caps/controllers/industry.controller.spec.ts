import { Repository, TreeRepository } from 'typeorm';

import { User } from '@modules/users/user.entity';
import { Neo4jService } from '@modules/neo4j/services';

import { Industry, Capability } from '../entities';
import { IndustryService, ProcessService, CapabilityService, CompanyService, ValueDriverService } from '../services';
import { IndustryController } from '.';
import { HttpService } from '@nestjs/common';

const data: Industry[] = [
  new Industry({
    id: 1,
    name: 'Industry 1',
    countProcesses: 1,
    countCapabilities: 1,
    countCompanies: 1,
  }),
  new Industry({
    id: 2,
    name: 'Industry 2',
    countProcesses: 1,
    countCapabilities: 1,
    countCompanies: 1,
  }),
];

const user: User = {
  id: 1,
  email: 't@t.com',
  firstName: 'John',
  lastName: 'Doe',
};

describe('IndustryController', () => {
  let industryController: IndustryController;
  let industryService: IndustryService;
  const industryRepository: Repository<Industry> = null;
  const processService: ProcessService = null;
  const capabilityService: CapabilityService = null;
  const companyService: CompanyService = null;
  const valueDriverService: ValueDriverService = null;
  const httpService: HttpService = null;

  beforeEach(async () => {
    industryService = new IndustryService(
      processService,
      capabilityService,
      companyService,
      valueDriverService,
      industryRepository,
      httpService,
    );
    industryController = new IndustryController(industryService);
  });

  describe('findAll', () => {
    it('should return an array of industry', async () => {
      jest.spyOn(industryService, 'findAll').mockImplementation(() => Promise.resolve(data));

      expect(await industryController.findAll({})).toBe(data);
    });
  });
  describe('findOne', () => {
    it('should return a industry by id', async () => {
      const id = 1;
      const result = data.find(item => item.id === id);
      jest
        .spyOn(industryService, 'findOneById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await industryController.findOne(1)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a industry', async () => {
      const inputData = {
        name: 'Industry new',
        countProcesses: 1,
        countCapabilities: 1,
        countCompanies: 1,
      };
      const result = { ...inputData, id: 10 };
      jest.spyOn(industryService, 'create').mockImplementation(() => Promise.resolve(result));

      expect(await industryController.create(inputData, user)).toBe(result);
    });
  });

  describe('save', () => {
    it('should save a industry', async () => {
      const id = 1;
      const inputData = data.find(item => item.id === id);
      const result = { ...inputData };
      jest.spyOn(industryService, 'save').mockImplementation(() => Promise.resolve(result));

      expect(await industryController.save(id, inputData)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a industry', async () => {
      const id = 1;
      const result = { id };
      jest.spyOn(industryService, 'remove').mockImplementation(() => Promise.resolve(result));

      expect(await industryController.remove(id)).toBe(result);
    });
  });
});
