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

  async findOnePartnerNetworkByCid(cid: string) {
    const { records } = await this.neo4j
      .session()
      .run('match (p:Company {cid: $cid}) RETURN p;', { cid });

    const result = records.map(record => {
      let node: any = record.toObject();
      return _.omit(node.p.properties, 'ts_upd');
    });

    return result[0];
  }

  async saveCapability(id: number, data: any) {
    const { name } = data;
    try {
      return await this.neo4j.session().run('match (n:Capability {id: $id}) set n.name = $name;', {
        id,
        name,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async saveProcess(id: number, data: any) {
    const { name } = data;
    try {
      return await this.neo4j.session().run('match (n:Process {id: $id}) set n.name = $name;', {
        id,
        name,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async saveIndustryCapabilitiesById(id: number, data: any) {
    const { capabilities } = data;
    try {
      return await this.neo4j
        .session()
        .run('match (n:Industry {id: $id}) set n.capabilities = $capabilities;', {
          id,
          capabilities: capabilities.map(cap => cap.hierarchy_id),
        });
    } catch (err) {
      console.error(err);
    }
  }

  async saveCompanyCapabilitiesByCid(cid: string, data: any) {
    const { capabilities } = data;
    try {
      return await this.neo4j
        .session()
        .run('match (n:Company {cid: $cid}) set n.capabilities = $capabilities;', {
          cid,
          capabilities: _.uniqBy(capabilities, 'id').map(({ id, name }) => `${id}:${name}`),
        });
    } catch (err) {
      console.error(err);
    }
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
