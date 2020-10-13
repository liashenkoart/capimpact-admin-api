import { Module, Global} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { TechnologiesController } from "./technology.controller";
import { TechnologyService } from "./technology.service";
import { Technology } from "./technology.entity";

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Technology]),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  controllers: [TechnologiesController],
  exports: [TechnologyService],
  providers: [TechnologyService]
})
export class TechnologyModule {}