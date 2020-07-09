import { Injectable } from "@nestjs/common";
import {
  InjectPersistenceManager,
  PersistenceManager,
  QuerySpecification,
  Transactional
} from "@liberation-data/drivine";

@Injectable()
export class ProcessGraphService {

  constructor(@InjectPersistenceManager() private readonly persistenceManager: PersistenceManager) {
  }

  @Transactional()
  async save(id: number, name: string): Promise<void> {
    return this.persistenceManager
      .execute(
        new QuerySpecification<void>('match (n:Process {id: $id}) set n.name = $name;')
          .bind({
            id,
            name
          })
      );
  }

}
