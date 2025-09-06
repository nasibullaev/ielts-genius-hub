import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { LevelCheckerService } from './level-checker.service';
import { LevelCheckerController } from './level-checker.controller';
import { LevelCheck, LevelCheckSchema } from './schemas/level-check.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  WritingTask1,
  WritingTask1Schema,
} from './schemas/writing-task1.schema';
import { ChartGenerationService } from './services/chart-generation.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: LevelCheck.name, schema: LevelCheckSchema },
      { name: User.name, schema: UserSchema },
      { name: WritingTask1.name, schema: WritingTask1Schema },
    ]),
  ],
  controllers: [LevelCheckerController],
  providers: [LevelCheckerService, ChartGenerationService],
  exports: [LevelCheckerService],
})
export class LevelCheckerModule {}
