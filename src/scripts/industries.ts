import { createConnection, getRepository } from 'typeorm';
import _ from 'lodash';

import { Industry } from '@modules/caps/entities';

import { parseCsv } from '@lib/parseCsv';

let connection = null;

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }

  const industryRepository = getRepository(Industry);

  // save industries
  let industries: any = await parseCsv('industries.csv', rows =>
    rows.map(row => ({
      ...row,
      id: parseInt(row.id, 10),
    }))
  );
  industries = await industryRepository.save(industries);
}

main();
