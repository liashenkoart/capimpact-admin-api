import { createConnection, getManager } from 'typeorm';

import { Industry } from '@modules/caps/entities';

import { parseCsv } from '@lib/parseCsv';

let connection = null;

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }

  await getManager().transaction(async transactionalEntityManager => {
    let industries: any = await parseCsv('industries.csv', rows =>
      rows.map((row: any) => ({
        ...row,
        id: +row.id,
      }))
    );
    for (let industry of industries) {
      const found = await transactionalEntityManager.findOne(Industry, {
        where: { name: industry.name },
      });
      if (!found) {
        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into('industries', ['id', 'name'])
          .values([industry])
          .execute();
      }
    }
  });
}

main();
