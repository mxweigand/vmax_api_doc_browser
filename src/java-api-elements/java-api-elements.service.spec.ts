import { Test, TestingModule } from '@nestjs/testing';
import { JavaApiElementsService } from './java-api-elements.service';

describe('JavaApiElementsService', () => {
  let service: JavaApiElementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JavaApiElementsService],
    }).compile();

    service = module.get<JavaApiElementsService>(JavaApiElementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
