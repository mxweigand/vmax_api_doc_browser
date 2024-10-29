import { Test, TestingModule } from '@nestjs/testing';
import { FileCrawlerService } from './file-crawler.service';

describe('FileCrawlerService', () => {
  let service: FileCrawlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileCrawlerService],
    }).compile();

    service = module.get<FileCrawlerService>(FileCrawlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
