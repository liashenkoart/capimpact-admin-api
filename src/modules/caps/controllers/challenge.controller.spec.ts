import { Repository, TreeRepository } from 'typeorm';

import { User } from '@modules/users/user.entity';
import { Neo4jService } from '@modules/neo4j/services';

import { Challenge, Industry } from '../entities';
import { ChallengeService } from '../services';
import { ChallengeController } from '.';

const data: Challenge[] = [
  new Challenge({
    id: 1,
    name: 'Challenge 1',
    issues: [],
    userId: 1,
    companyId: 1,
  }),
  new Challenge({
    id: 2,
    name: 'Challenge 2',
    issues: [],
    userId: 1,
    companyId: 1,
  }),
];

const user: User = {
  id: 1,
  email: 't@t.com',
  firstName: 'John',
  lastName: 'Doe',
};

describe('ChallengeController', () => {
  let challengeController: ChallengeController;
  let challengeService: ChallengeService;
  const challengeRepository: Repository<Challenge> = null;

  beforeEach(async () => {
    challengeService = new ChallengeService(
      challengeRepository,
    );
    challengeController = new ChallengeController(challengeService);
  });

  describe('findAll', () => {
    it('should return an array of challenge', async () => {
      jest.spyOn(challengeService, 'findAll').mockImplementation(() => Promise.resolve(data));

      expect(await challengeController.findAll({})).toBe(data);
    });
  });

  describe('findOne', () => {
    it('should return a challenge by id', async () => {
      const id = 1;
      const result = data.find(item => item.id === id);
      jest
        .spyOn(challengeService, 'findOneById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await challengeController.findOne(1)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a challenge', async () => {
      const inputData = {
        name: 'Challenge new',
        issues: [],
        userId: 1,
        companyId: 1,
      };
      const result = { ...inputData, id: 10 };
      jest.spyOn(challengeService, 'create').mockImplementation(() => Promise.resolve(result));

      expect(await challengeController.create(inputData)).toBe(result);
    });
  });

  describe('save', () => {
    it('should save a challenge', async () => {
      const id = 1;
      const inputData = data.find(item => item.id === id);
      const result = { ...inputData };
      jest.spyOn(challengeService, 'save').mockImplementation(() => Promise.resolve(result));

      expect(await challengeController.save(id, inputData)).toBe(result);
    });
  });

  describe('saveMany', () => {
    it('should save many challenge', async () => {
      const inputData = data.slice(0, 2);
      const result = { ...data };
      jest.spyOn(challengeService, 'saveMany').mockImplementation(() => Promise.resolve(result));

      expect(await challengeController.saveMany(inputData)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a challenge', async () => {
      const id = 1;
      const result = { id };
      jest.spyOn(challengeService, 'remove').mockImplementation(() => Promise.resolve(result));

      expect(await challengeController.remove(id)).toBe(result);
    });
  });
});
