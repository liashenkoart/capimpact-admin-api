import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import path from 'path';
import { ApplicationModule } from './app.module';
import { setupSwaggerModule } from './setupSwaggerModule';
import { setupFixtures } from './fixtures';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule, {
    cors: true,
  });
  app.setGlobalPrefix('api');
  app.use('/api/files', express.static(path.join(__dirname, '../public')));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  setupSwaggerModule({ app });

  await setupFixtures();

  await app.listen(port);

  console.log(`🚀  Server ready at ${port}`);
}

bootstrap();
