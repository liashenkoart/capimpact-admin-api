import { Module, Global, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { CapabilityTreeController } from './capability-tree.controller';
import { CapabilityTreeService } from './capability-tree.service';
import { CapabilityTree } from './capability-tree.entity';
import { CapabilityLib } from '../capability-libs/capability-lib.entity';
import { IndustryTree } from '../industry-tree/industry-tree.entity';
import { Capability } from '../capability/capability.entity';
import { ConnectTimeoutMiddleware } from '@nest-middlewares/connect-timeout';
import { HelmetMiddleware } from '@nest-middlewares/helmet';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([CapabilityTree, IndustryTree ,CapabilityLib, Capability]),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  controllers: [CapabilityTreeController],
  providers: [CapabilityTreeService],
  exports: [CapabilityTreeService],
})
export class CapabilityTreeModule {
  configure(consumer: MiddlewareConsumer) {
    // IMPORTANT! Call Middleware.configure BEFORE using it for routes
    HelmetMiddleware.configure( {} )
    consumer.apply(ConnectTimeoutMiddleware).forRoutes( '9999999999999999999');
}
}