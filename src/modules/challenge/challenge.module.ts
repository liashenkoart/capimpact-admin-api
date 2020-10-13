import { Module, Global} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { Challenge } from './challenge.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Challenge]),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  controllers: [ChallengeController],
  providers: [ChallengeService],
  exports: [ChallengeService],
})
export class ChallengeModule {}