import { Test, TestingModule } from '@nestjs/testing';
import { JavadocHtmlAnalyzerService } from './javadoc-html-analyzer.service';

describe('JavadocHtmlAnalyzerService', () => {
  let service: JavadocHtmlAnalyzerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JavadocHtmlAnalyzerService],
    }).compile();

    service = module.get<JavadocHtmlAnalyzerService>(JavadocHtmlAnalyzerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
