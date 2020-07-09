import { Module } from '@nestjs/common';
import { DrivineModule, DrivineModuleOptions } from '@liberation-data/drivine/DrivineModule';
import { DatabaseRegistry } from '@liberation-data/drivine/connection/DatabaseRegistry';

@Module({
  imports: [
    DrivineModule.withOptions(<DrivineModuleOptions>{
      connectionProviders: [DatabaseRegistry.buildOrResolveFromEnv('GRAPH')]
    }),
  ]
})
export class GraphDrivineModule {

}
