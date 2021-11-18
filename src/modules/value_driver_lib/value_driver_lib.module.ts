import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ValueDriverLibController } from './value_driver_lib.controller';
import { ValueDriverLibService } from './value_driver_lib.service';
import { ValueDriverLib } from './value_driver_lib.entity';
import { TagsModule } from '../tags/tags.module';


@Module({
  imports: [
    TagsModule,
    TypeOrmModule.forFeature([ValueDriverLib]),
    PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [ValueDriverLibController],
  providers: [ValueDriverLibService],
  exports: [ValueDriverLibService]
})
export class ValueDriverLibsModule {}