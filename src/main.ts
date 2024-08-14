import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { pgSetTypeParsers } from 'pg-safe-numbers';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import process from 'process';
import { readFileSync } from 'fs';
import { join } from 'path';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';

async function bootstrap() {
  pgSetTypeParsers();
  let httpsOptions: HttpsOptions;

  if (process.env.NODE_ENV === 'production') {
    const keyFile = readFileSync(join(__dirname, '/../ssl/private.key'));
    const certFile = readFileSync(join(__dirname, '/../ssl/private.crt'));

    httpsOptions = {
      key: keyFile,
      cert: certFile,
    };
  }

  const app = await NestFactory.create(AppModule, { httpsOptions });

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api_v2');

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
