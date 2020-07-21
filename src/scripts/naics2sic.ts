import { createConnection, getManager } from 'typeorm';
import { parseCsv } from '@lib/parseCsv';
import { chain } from 'lodash'
import { IndustryTree, Sic } from '@modules/caps/entities';

async function main() {
  const connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }
  const naics2sic: any = await parseCsv('naics2sic-x.csv', rows => {
    return chain(rows).groupBy(d => d.naics_code).map((group, naics_code) => ({
        naics_code,
        sics: group.map(item => ({ code: item.sic_code,  description: item.sic_description })),
    })).value();
  });
  await getManager().transaction(async transactionalEntityManager => {
    for (let item of naics2sic) {
      const industryTree = await transactionalEntityManager.findOne(IndustryTree, {
        where: { code: item.naics_code },
      });
      if (!industryTree)
        continue;
      industryTree.sics = await Promise.all(item.sics.map(sic => {
        return transactionalEntityManager.save(Sic, new Sic(sic));
      }));
      await transactionalEntityManager.save(IndustryTree, new IndustryTree(industryTree));
    }
  });
}

main();
