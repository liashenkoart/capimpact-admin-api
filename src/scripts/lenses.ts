import { createConnection, getManager } from 'typeorm';
import { chain } from 'lodash'

import { Lense, Classification } from '@modules/caps/entities';

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

    console.log(lenses)

    for (let lense of lenses) {
      // for (let classification of lense.classifications) {
      //   console.log(classification)
      // }

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
