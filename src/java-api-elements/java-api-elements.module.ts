import { Module } from '@nestjs/common';
import { JavaApiElementsService } from './java-api-elements.service';
import { CrawlerModule } from 'src/crawler/crawler.module';

@Module({
  providers: [
    JavaApiElementsService
  ],
  imports: [
    CrawlerModule
  ],
  exports: [
    JavaApiElementsService
  ]
})
export class JavaApiElementsModule {}
