import { Test, TestingModule } from '@nestjs/testing';
import { MeituautoService } from './meituauto.service';



describe('MeituautoService', () => {
  let service: MeituautoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeituautoService],
    }).compile();

    service = module.get<MeituautoService>(MeituautoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

