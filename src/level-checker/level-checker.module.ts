import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { LevelCheckerService } from './level-checker.service';
import { LevelCheckerController } from './level-checker.controller';
import { LevelCheck, LevelCheckSchema } from './schemas/level-check.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: LevelCheck.name, schema: LevelCheckSchema },
    ]),
  ],
  controllers: [LevelCheckerController],
  providers: [LevelCheckerService],
  exports: [LevelCheckerService],
})
export class LevelCheckerModule {}
