import { createConnection, getManager } from 'typeorm';
import { chain } from 'lodash'

import { Lense } from '../modules/lense/lense.entity';
import { Classification } from '../modules/classifications/classification.entity';

import { parseCsv } from '@lib/parseCsv';

let connection = null;

(async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }

  await getManager().transaction(async transactionalEntityManager => {
    let lenses: any = await parseCsv('lenses/default.csv', (rows) => {
      return chain(rows).groupBy(d => d.name).map((classifications, name) => ({
        name,
        classifications: classifications.map(d => d.classification)
      })).value()
    });

    for (let lense of lenses) {
      let lenseObject = await transactionalEntityManager.findOne(Lense, {
        where: { name: lense.name },
      });

      if (!lenseObject) {
        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(Lense)
          .values([{name: lense.name}])
          .execute();

        lenseObject = await transactionalEntityManager.findOne(Lense, {
          where: { name: lense.name },
        })
      }

      for (let classification of lense.classifications) {
        let classfierObject = await transactionalEntityManager.findOne(Classification, {
          where: { name: classification, lense_id: lenseObject.id },
        });

        if (!classfierObject) {
          await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(Classification)
          .values([{name: classification, lense_id: lenseObject.id}])
          .execute();
        }
      }
    }
  });
})();
