import { Injectable } from "@nestjs/common";
import {
  InjectPersistenceManager,
  PersistenceManager,
  QuerySpecification,
  Transactional
} from "@liberation-data/drivine";

@Injectable()
export class IndustryGraphService {

  constructor(@InjectPersistenceManager('GRAPH') private readonly persistenceManager: PersistenceManager) {
  }

  @Transactional()
  async saveIndustryCapabilitiesById(id: number, data: any): Promise<void> {
    const { capabilities } = data;

    return this.persistenceManager
      .execute(
        new QuerySpecification<void>('match (n:Industry {id: $id}) set n.capabilities = $capabilities;')
          .bind({
            id,
            capabilities: capabilities.map(cap => cap.hierarchy_id),
          })
      );
  }

}
