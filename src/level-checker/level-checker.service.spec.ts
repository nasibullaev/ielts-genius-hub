import { Test, TestingModule } from '@nestjs/testing';
import { LevelCheckerService } from './level-checker.service';

describe('LevelCheckerService', () => {
  let service: LevelCheckerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LevelCheckerService],
    }).compile();

    service = module.get<LevelCheckerService>(LevelCheckerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
