import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { pgSetTypeParsers } from 'pg-safe-numbers';

async function bootstrap() {
  pgSetTypeParsers();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const port: number = parseInt(process.env.PORT) || 3000;
  await app.listen(port);

  console.log(`Server is running on port ${port}`);
}
bootstrap();
