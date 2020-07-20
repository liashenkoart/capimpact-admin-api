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
      ...item,
      id: `${item.id.oid}.${item.id.id}`,
      cid: item.props.cid,
      industry: item.props.industry,
      _id: item.props._id,
      label: item.props.name,
      type: newType[0] || 'company',
    })
  })
  if (type === "edges") return data.map(item => ({
    rel: item.label,
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
    const cids = cidsArr.join(', ').replace(/^(\w+), (\w+)$/i, `['$1', '$2']`);
    const nhops = +hps.query.nhops;

    const edges = this.persistenceManager
      .query<any>(
        new QuerySpecification<any>(
          cidsArr.length === 0
            ? `match p=(n:company {cid: $cid})-[*..${nhops}]->() with edges(p) as e return distinct e;`
            : `match p=(n:company)-[*..${nhops}]->() where n.cid in ${cids} with edges(p) as e return distinct e;`
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
          : `match p=(n:company)-[*..${nhops}]->() where n.cid in ${cids} with nodes(p) as nd return distinct nd;`
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
}
