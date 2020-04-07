import { Repository, TreeRepository } from 'typeorm';

import { User } from '@modules/users/user.entity';
import { Neo4jService } from '@modules/neo4j/services';

import { Lense, Industry } from '../entities';
import { LenseService } from '../services';
import { LenseController } from '.';

const data: Lense[] = [
  new Lense({
    id: 1,
    name: 'Lense 1',
  }),
  new Lense({
    id: 2,
    name: 'Lense 2',
  }),
];

const user: User = {
  id: 1,
  email: 't@t.com',
  firstName: 'John',
  lastName: 'Doe',
};

describe('LenseController', () => {
  let lenseController: LenseController;
  let lenseService: LenseService;
  const lenseRepository: Repository<Lense> = null;

  beforeEach(async () => {
    lenseService = new LenseService(
      lenseRepository,
    );
    lenseController = new LenseController(lenseService);
  });

  describe('findAll', () => {
    it('should return an array of lense', async () => {
      jest.spyOn(lenseService, 'findAll').mockImplementation(() => Promise.resolve(data));

      expect(await lenseController.findAll({})).toBe(data);
    });
  });
});
