// src/level-checker/level-checker.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LevelCheckerService } from './level-checker.service';
import { LevelCheckerController } from './level-checker.controller';

@Module({
  imports: [ConfigModule],
  controllers: [LevelCheckerController],
  providers: [LevelCheckerService],
})
export class LevelCheckerModule {}
