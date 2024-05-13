import { Test, TestingModule } from '@nestjs/testing';
import { IsimgService } from './isimg.service';

describe('IsimgService', () => {
  let service: IsimgService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IsimgService],
    }).compile();

    service = module.get<IsimgService>(IsimgService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
