import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { expressApp } from './jdoc-express/jdoc-express.js';

async function bootstrap() {
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter, { cors: true });
  await app.listen(3000);
}

bootstrap();
