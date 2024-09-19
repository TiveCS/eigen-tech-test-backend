import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(new ValidationPipe());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Book Borrowing API')
    .setDescription('The Book Borrowing API description')
    .setVersion('1')
    .build();

  const documentV1 = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/api/v1', app, documentV1);

  await app.listen(3000);
}
bootstrap();
