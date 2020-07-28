import { Injectable } from "@nestjs/common";
import {
  InjectPersistenceManager,
  PersistenceManager,
  QuerySpecification,
  Transactional
} from "@liberation-data/drivine";

import _ from 'lodash';

const ChangeDataFromApi = (data, type) => {
  data = data.flat(1);

  if (type === "nodes") return data.map(item => {
    const comp_type = _.map(data, node => {
      if (node.label === 'company_type' && node.props._id === item.props._id)
        return node.props.name
    });

    let newType = [];
    comp_type.forEach((item) => {
      if (item && item === 'Direct Investment') newType.push('direct_invest')
      else if (item && item === 'Strategic Alliance') newType.push('strateg_alliance')
      else if (item) newType.push(item.toLowerCase())
    })

    return ({
      id: `${item.id.oid}.${item.id.id}`,
      cid: item.props.cid,
      industry: item.props.industry,
      _id: item.props._id,
      label: item.props.name,
      type: item.props.type || newType[0],
      capabilities: item.props.capabilities,
      kpis: item.props.kpis,
      parent: item.props.parent,
    })
  })

  if (type === "edges") return data.map(item => ({
    rel: item.label === "has_company_type" ? item.props.name : item.label,
    id: `${item.id.oid}.${item.id.id}`,
    from: `${item.start.oid}.${item.start.id}`,
    to: `${item.end.oid}.${item.end.id}`,
  }))
};

@Injectable()
export class CompanyGraphService {

  constructor(@InjectPersistenceManager('GRAPH') private readonly persistenceManager: PersistenceManager) {
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
  async findPartnerNetworksByCid(cid: string): Promise<any> {
    const records = await this.persistenceManager
    .query<any>(
      new QuerySpecification<any>(`match p=(n:Company {cid: $cid})-[*..2]->() RETURN p;`)
        .bind({ cid })
    );

    return records.map(record => {
      let node: any = record.toObject();
      return _.omit(node.p.end.properties, 'ts_upd');
    });
  }

  @Transactional()
  async findPartnerNetworksForGraphByCid(cid: string, hps: any): Promise<any> {
    let cidsArr = [];
    if (cid.includes('&')) {
      cidsArr = cid.split('&');
    }
    const cids = cidsArr.map(item => `'${item}'`);
    const nhops = +hps.query.nhops;

    const edges = await this.persistenceManager
      .query<any>(
        new QuerySpecification<any>(
          cidsArr.length === 0
            ? `match p=(n:company {cid: $cid})-[*..${nhops}]->() with edges(p) as e return distinct e;`
            : `match p=(n:company)-[*..${nhops}]->() where n.cid in [${cids}] with edges(p) as e return distinct e;`
      )
          .bind(cidsArr.length === 0 ? {
             cid
          } : null)
      );

    const nodes = await this.persistenceManager
      .query<any>(
        new QuerySpecification<any>(
          cidsArr.length === 0
          ? `match p=(n:company {cid: $cid})-[*..${nhops}]->() with nodes(p) as nd return distinct nd;`
          : `match p=(n:company)-[*..${nhops}]->() where n.cid in [${cids}] with nodes(p) as nd return distinct nd;`
        )
          .bind(cidsArr.length === 0 ? {
            cid
          } : null)
      );

    return {
      nodes: _.uniqWith(ChangeDataFromApi(nodes, 'nodes'), _.isEqual),
      edges: _.uniqWith(ChangeDataFromApi(edges, 'edges'), _.isEqual),
    }
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
          record => _.omit(record.properties, 'ts_upd')
        )
      );
  }

  @Transactional()
  async getSummaryStatsByIndustries(cid: string, needGroupByType: boolean): Promise<any> {
    const cidArray = cid.split('&');
    const industries = await this.persistenceManager
      .query<any>(
        new QuerySpecification<any>(`
          match (n:company)-[]->(t:company_type)-[]->(m:company)
          where n.cid IN ['${cidArray.join(`', '`)}']
          RETURN [t.name, m.industry];
        `)
      );
    const stats = {};
    if (needGroupByType) {
      industries.map(item => {
        stats[item[0]] = {
          ...stats[item[0]],
          [item[1]]: industries.flat().filter((it, ind) =>
            it === item[1] && industries.flat()[ind-1] === item[0]).length
        }
      })
    } else {
      industries.map(item => {
        stats[item[1]] = industries.flat().filter(it => it == item[1]).length
      })
    }
    return stats;
  }

  @Transactional()
  async getSummaryStatsByCapabilities(cid: string, needGroupByType: boolean): Promise<any> {
    const cidArray = cid.split('&');
    const capabilities = await this.persistenceManager
      .query<any>(
        new QuerySpecification<any>(`
          match (n:company)-[]->(t:company_type)-[]->(m:company)
          where n.cid IN ['${cidArray.join(`', '`)}']
          RETURN [t.name, m.capability];
        `)
      );
    const stats = {};
    if (needGroupByType) {
      capabilities.map(item => {
        stats[item[0]] = {
          ...stats[item[0]],
          [item[1]]: capabilities.flat().filter((it, ind) =>
            it === item[1] && capabilities.flat()[ind-1] === item[0]).length
        }
      })
    } else {
      capabilities.map(item => {
        stats[item[1]] = capabilities.flat().filter(it => it == item[1]).length
      })
    }
    return stats;
  }

  @Transactional()
  async getSharedCompanies(cid: string): Promise<any> {
    const cidArray = cid.split('&');

    const nodes = await this.persistenceManager
      .query<any>(
        new QuerySpecification<any>(`
          match p=(n:company)-[r1]->(:company_type)-[]->(s:company)<-[]-(:company_type)<-[r2]-(m:company)
            where n.cid in ['${cidArray.join(`', '`)}']
              and m.cid in ['${cidArray.join(`', '`)}']
              and id(n) < id(m)
          with nodes(p) as nd return distinct nd;
        `)
      );

    const edges = await this.persistenceManager
      .query<any>(
        new QuerySpecification<any>(`
          match p=(n:company)-[r1]->(:company_type)-[]->(s:company)<-[]-(:company_type)<-[r2]-(m:company)
            where n.cid in ['${cidArray.join(`', '`)}']
              and m.cid in ['${cidArray.join(`', '`)}']
              and id(n) < id(m)
          with edges(p) as e return distinct e;
        `)
      );

    return {
      nodes: _.uniqWith(ChangeDataFromApi(nodes, 'nodes'), _.isEqual),
      edges: _.uniqWith(ChangeDataFromApi(edges, 'edges'), _.isEqual),
    }
  }
}
