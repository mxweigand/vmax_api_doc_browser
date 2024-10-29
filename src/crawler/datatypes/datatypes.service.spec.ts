import { Test, TestingModule } from '@nestjs/testing';
import { DatatypesService } from './datatypes.service';

describe('DatatypesService', () => {
  let service: DatatypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatatypesService],
    }).compile();

    service = module.get<DatatypesService>(DatatypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
