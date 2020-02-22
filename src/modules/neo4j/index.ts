import { Module } from '@nestjs/common';

import { Neo4jProvider } from './providers/neo4j.provider';
import { Neo4jService } from './services/neo4j.service';

@Module({
  imports: [],
  providers: [Neo4jProvider, Neo4jService],
  controllers: [],
  exports: [Neo4jService],
})
export class Neo4jModule {}
