import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { ApplicationModule } from './app.module';
import { setupSwaggerModule } from './setupSwaggerModule';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule, {
    cors: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  setupSwaggerModule({ app });

  await app.listen(process.env.PORT);

  console.log(`🚀  Server ready at ${process.env.PORT}`);
}

bootstrap();
