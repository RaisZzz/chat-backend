import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { pgSetTypeParsers } from 'pg-safe-numbers';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  pgSetTypeParsers();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Nikohlik')
    .setDescription('Документация Nikohlik REST API')
    .setVersion('2.0.0')
    .addTag('raiszzz')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  const port: number = parseInt(process.env.PORT) || 3000;
  await app.listen(port);

  console.log(`Server is running on port ${port}`);
}
bootstrap();
