import neo4j from 'neo4j-driver';

export const Neo4jProvider = {
  provide: 'Neo4j',
  useFactory: () => neo4j.driver('bolt://35.153.253.163:7687', neo4j.auth.basic('neo4j', 's3cr3t')),
};
