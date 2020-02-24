import { Module } from '@nestjs/common';
import neo4j from 'neo4j-driver';
import { makeAugmentedSchema } from 'neo4j-graphql-js';

import { typeDefs } from './schema';
import { Neo4jProvider } from './providers/neo4j.provider';
import { Neo4jService } from './services/neo4j.service';

@Module({
  imports: [],
  providers: [Neo4jProvider, Neo4jService],
  controllers: [],
  exports: [Neo4jService],
})
export class Neo4jModule {}

export function createNeo4jGraphQL({ configService }) {
  const schema = makeAugmentedSchema({
    typeDefs,
  });
  const driver = neo4j.driver(
    configService.get('neo4j.uri'),
    neo4j.auth.basic(configService.get('neo4j.username'), configService.get('neo4j.password'))
  );
  return {
    schema,
    driver,
  };
}
