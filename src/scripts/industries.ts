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
    await transactionalEntityManager.save(Industry, industries);
  });
}

main();
