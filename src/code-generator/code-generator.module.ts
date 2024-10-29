import { Module } from '@nestjs/common';
import { CodeGeneratorService } from './code-generator.service';
import { CrawlerModule } from '../crawler/crawler.module';

@Module({
  providers: [CodeGeneratorService],
  exports: [CodeGeneratorService],
  imports: [CrawlerModule],
})
export class CodeGeneratorModule {}
