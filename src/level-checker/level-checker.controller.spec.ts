import { Test, TestingModule } from '@nestjs/testing';
import { LevelCheckerController } from './level-checker.controller';
import { LevelCheckerService } from './level-checker.service';

describe('LevelCheckerController', () => {
  let controller: LevelCheckerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LevelCheckerController],
      providers: [LevelCheckerService],
    }).compile();

    controller = module.get<LevelCheckerController>(LevelCheckerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
