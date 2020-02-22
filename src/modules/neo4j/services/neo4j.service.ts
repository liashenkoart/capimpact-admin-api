import { Injectable, Inject } from '@nestjs/common';
import { Driver } from 'neo4j-driver';
import _ from 'lodash';

@Injectable()
export class Neo4jService {
  constructor(@Inject('Neo4j') private readonly neo4j: Driver) {}

  async findPartnerNetworksByCid(cid: string): Promise<any> {
    const {
      records,
    } = await this.neo4j
      .session()
      .run('match p=(n:Company {cid: $cid})-[*..2]->() RETURN p;', { cid });

    return records.map(record => {
      let node: any = record.toObject();
      return _.omit(node.p.end.properties, 'ts_upd');
    });
  }

  async saveCompanyCapabilitiesByCid(cid: string, data: any) {
    const { capabilities } = data;
    return await this.neo4j
      .session()
      .run('match (n:Company {cid: $cid}) set n.capabilities = $capabilities;', {
        cid,
        capabilities: capabilities.map(({ id, name }) => `${id}:${name}`),
      });
  }
}

/*
import {Component, Inject, Logger} from '@nestjs/common';
import {cloneDeep, pickBy, identity} from 'lodash';

const logger = new Logger('StorageNeo4j');

@Component()
export default class Neo4jService {

	constructor(@Inject('Neo4jProvider') private readonly neo4j) {}

	private cipher(query: string) {
		const session = this.neo4j.session();
		return session.run(query).then(result => {
			session.close();
			return result.records;
		});
	}

	private merge(data: any) {
		const session = this.neo4j.session();
		const statement = `
			MERGE (t:YOUR_TYPE {your_id: $your_id})
		    ON CREATE SET t = $props
		    ON MATCH SET t += $props
    `;
		session.run(statement, { your_id: data.your_id, props: pickBy(data, identity) })
			.then(() => session.close())
			.catch(err => {
        throw err
      });
    }

    private replace(data: any) {
      const session = this.neo4j.session();
      const statement = `
        MATCH (t:YOUR_TYPE {your_id: $your_id})
        SET t = $props
  `;

      session.run(statement, { your_id: data.your_id, props: pickBy(data, identity) })
        .then(() => session.close())
        .catch(err => {
          throw err
        });
    }
  }
*/
