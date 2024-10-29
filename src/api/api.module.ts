import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { JavaApiElementsModule } from '../java-api-elements/java-api-elements.module';
import { CrawlerModule } from '../crawler/crawler.module';
import { CodeGeneratorModule } from '../code-generator/code-generator.module';

@Module({
  controllers: [ApiController],
  imports: [
    JavaApiElementsModule,
    CrawlerModule, 
    CodeGeneratorModule
  ],
  providers: []
})
export class ApiModule {}
