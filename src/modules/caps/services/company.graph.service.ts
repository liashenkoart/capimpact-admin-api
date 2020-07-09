import { Injectable } from "@nestjs/common";
import {
  InjectPersistenceManager,
  PersistenceManager,
  QuerySpecification,
  Transactional
} from "@liberation-data/drivine";

import _ from 'lodash';

@Injectable()
export class CompanyGraphService {

  constructor(@InjectPersistenceManager() private readonly persistenceManager: PersistenceManager) {
  }

  @Transactional()
  async saveCompanyCapabilitiesByCid(cid: string, data: any): Promise<void> {
    const { capabilities } = data;

    return this.persistenceManager
      .execute(
        new QuerySpecification<void>('match (n:Company {cid: $cid}) set n.capabilities = $capabilities;')
          .bind({
            cid,
            capabilities: _.uniqBy(capabilities, 'id').map(({ id, name }) => `${id}:${name}`),
          })
      );
  }

  @Transactional()
  async findPartnerNetworksByCid(cid: string): Promise<any[]> {
    return this.persistenceManager
      .query<any>(
        new QuerySpecification<any>('match p=(n:Company {cid: $cid})-[*..2]->() RETURN p;')
          .bind({
            cid
          })
      ).then(records =>
        records.map(
          record => _.omit(record.p.end.properties, 'ts_upd')
        )
      );
  }

  @Transactional()
  async findOnePartnerNetworkByCid(cid: string): Promise<any[]> {
    return this.persistenceManager
      .getOne<any>(
        new QuerySpecification<any>('match (p:Company {cid: $cid}) RETURN p;')
          .bind({
            cid
          })
      ).then(records =>
        records.map(
          record => _.omit(record.p.properties, 'ts_upd')
        )
      );
  }
}
