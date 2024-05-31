import { Test, TestingModule } from '@nestjs/testing';
import { ChatqwenService } from './chatqwen.service';

describe('ChatqwenService', () => {
  let service: ChatqwenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatqwenService],
    }).compile();

    service = module.get<ChatqwenService>(ChatqwenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
