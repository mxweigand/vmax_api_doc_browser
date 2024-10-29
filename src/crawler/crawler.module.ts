import { Module } from '@nestjs/common';
import { FileCrawlerService } from './file-crawler/file-crawler.service';
import { JavadocHtmlAnalyzerService } from './javadoc-html-analyzer/javadoc-html-analyzer.service';
import { WorkingDataService } from './working-data/working-data.service';
import { DatatypesService } from './datatypes/datatypes.service';

@Module({
  providers: [
    FileCrawlerService, 
    JavadocHtmlAnalyzerService, 
    WorkingDataService, 
    DatatypesService
  ],
  exports: [
    WorkingDataService
  ]
})
export class CrawlerModule {}
