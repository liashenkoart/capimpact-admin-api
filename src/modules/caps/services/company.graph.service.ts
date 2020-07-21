import { Injectable } from "@nestjs/common";
import {
  InjectPersistenceManager,
  PersistenceManager,
  QuerySpecification,
  Transactional
} from "@liberation-data/drivine";

import _ from 'lodash';

const ChangeDataFromApi = (data, type) => {
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
  async findPartnerNetworksByCid(cid: string, hps: any): Promise<any> {
    let cidsArr = [];
    if (cid.includes('&')) {
      cidsArr = cid.split('&');
    }
    const cids = cidsArr.map(item => `'${item}'`);
    const nhops = +hps.query.nhops;

    const edges = this.persistenceManager
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

    const nodes = this.persistenceManager
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

    return Promise.all([nodes, edges])
      .then(records => {
        let nodeFinally=[];
        let edgeFinally=[];
        records[0].forEach((nodeItem)=> nodeItem.forEach((nodeObj)=> nodeFinally.push(nodeObj)))
        records[1].forEach((edgeItem)=> edgeItem.forEach((edgeObj)=> edgeFinally.push(edgeObj)))
        return {
          nodes: _.uniqWith(ChangeDataFromApi(nodeFinally, 'nodes'), _.isEqual),
          edges: _.uniqWith(ChangeDataFromApi(edgeFinally, 'edges'), _.isEqual),
        }
      });
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
}
