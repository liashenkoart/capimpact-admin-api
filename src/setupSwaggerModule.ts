import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export const setupSwaggerModule = ({ app }) => {
  const options = new DocumentBuilder()
    .setTitle('CapAdmin API')
    .setDescription('description')
    .setVersion('1.0')
    .setBasePath('api')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);
};
