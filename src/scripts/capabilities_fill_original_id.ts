import { createConnection, getManager } from 'typeorm';

import { Industry } from '../modules/industry/industry.entity';
import { Capability } from '../modules/capability/capability.entity';
import { Company } from '../modules/company/company.entity';

let connection = null;

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }
  console.time('updateCapabilities')
  await getManager().transaction(async transactionalEntityManager => {
    // get industries
    const industries = await transactionalEntityManager.find(Industry);
    for (let industry of industries) {
      const originalCapabilitiesOfIndustry =  await transactionalEntityManager
        .createQueryBuilder(Capability, 'capability')
        .where('capability.industry_id = :industry_id', { industry_id: industry.id })
        .andWhere('capability.company_id is null')
        .andWhere('capability.original_id is null')
        .getMany();

      const companiesOfIndustry = await transactionalEntityManager.find(Company, {
        where: { industry_id: industry.id }
      });

      for (let originalCapability of originalCapabilitiesOfIndustry) {
        for (let company of companiesOfIndustry) {
          await transactionalEntityManager.update(Capability,
              { company_id: company.id, name: originalCapability.name },
              { original_id: originalCapability.id }
              );
        }
      }
    }
  });
  console.timeEnd('updateCapabilities')
  console.log('Capabilities fill original_id is finished');
}

main();
