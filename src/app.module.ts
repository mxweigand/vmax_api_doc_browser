import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CrawlerModule } from './crawler/crawler.module';
import { JavaApiElementsModule } from './java-api-elements/java-api-elements.module';
import { CodeGeneratorModule } from './code-generator/code-generator.module';

const serveStaticModuleImport: DynamicModule[] = [ ];
if ( process.env.MODE && process.env.MODE === 'prod' ) { 
  serveStaticModuleImport.push(ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', '..', '..', 'frontend', 'dist', 'frontend', 'browser')
  }));
}

@Module({
  imports: [ 
    ...serveStaticModuleImport,
    ApiModule,
    CrawlerModule,
    JavaApiElementsModule,
    CodeGeneratorModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ],
})
export class AppModule {}
