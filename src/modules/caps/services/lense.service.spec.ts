import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Lense } from '../entities';

import { MODULE } from '@app/app.module';
import { loadFixtures } from '@/test/fixtures';
import { LenseService } from '../services';

describe('BizcaseService', () => {
  let lenseRepository: Repository<Lense>;
  let lenseService: LenseService;
  let connection: Connection;
  let module: TestingModule = null;

  beforeAll(async () => {
    module = await Test.createTestingModule(MODULE).compile();

    connection = module.get<Connection>(Connection);

    lenseService = module.get<LenseService>(LenseService);
    await loadFixtures(connection, 'test/fixtures');
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // pass
  });

  it('should be defined', () => {
    expect(lenseService).toBeDefined();
  });

  describe('findAll', async () => {
    it('should return lenses', async () => {
      const lenses = await lenseService.findAll({});
      expect(lenses.length).toBeGreaterThan(0);
    });
  });
});
