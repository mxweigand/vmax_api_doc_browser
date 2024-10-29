import { Test, TestingModule } from '@nestjs/testing';
import { WorkingDataService } from './working-data.service';

describe('WorkingDataService', () => {
  let service: WorkingDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkingDataService],
    }).compile();

    service = module.get<WorkingDataService>(WorkingDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
