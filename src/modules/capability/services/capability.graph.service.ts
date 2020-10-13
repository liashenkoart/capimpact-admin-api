import { Injectable } from "@nestjs/common";
import {
  InjectPersistenceManager,
  PersistenceManager,
  QuerySpecification,
  Transactional
} from '@liberation-data/drivine';

@Injectable()
export class CapabilityGraphService {

  constructor(@InjectPersistenceManager('GRAPH') readonly persistenceManager: PersistenceManager) {
  }

  @Transactional()
  async save(id: number, name: string): Promise<void> {
    return this.persistenceManager
      .execute(
        new QuerySpecification<void>('match (n:Capability {id: $id}) set n.name = $name;')
          .bind({
            id,
            name
          })
      );
  }

}
