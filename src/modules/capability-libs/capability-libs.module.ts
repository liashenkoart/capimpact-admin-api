
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { CapabilityLibService } from "./capability-lib.service";
import { CapabilityLibController } from "./capability-lib.controller";
import { CapabilityLib } from "./capability-lib.entity";
import { IndustryTree} from '../industry-tree/industry-tree.entity';
import { CapabilityTree } from '../capability-tree/capability-tree.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([CapabilityLib, IndustryTree, CapabilityTree]),
    PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [CapabilityLibController],
  providers: [CapabilityLibService],
  exports:[CapabilityLibService]
})
export class CapabilityLibsModule {}