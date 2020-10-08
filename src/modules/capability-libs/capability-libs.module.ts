
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapabilityLibService } from "./capability-lib.service";
import { CapabilityLibController } from "./capability-lib.controller";
import { CapabilityLib } from "./capability-lib.entity";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([CapabilityLib])],
  controllers: [CapabilityLibController],
  providers: [CapabilityLibService],
  exports:[CapabilityLibService]
})
export class CapabilityLibsModule {}