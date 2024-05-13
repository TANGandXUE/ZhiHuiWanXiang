import { Test, TestingModule } from '@nestjs/testing';
import { DatatransService } from './datatrans.service';

describe('DatatransService', () => {
  let service: DatatransService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatatransService],
    }).compile();

    service = module.get<DatatransService>(DatatransService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
