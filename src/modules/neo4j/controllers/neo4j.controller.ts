import { Controller, Get } from '@nestjs/common';
import { Neo4jService } from '../services/neo4j.service';

@Controller('neo4j')
export class Neo4jController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @Get()
  async findAll() {
    return this.neo4jService.findAll();
  }
}
