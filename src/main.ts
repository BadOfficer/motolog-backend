import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3000', // Allow specific domain
    methods: 'GET,POST,PUT,DELETE,PATCH', // Allow HTTP methods
    credentials: true, // Allow cookies to be sent
    allowedHeaders: 'Content-Type, Authorization',
  });

  const port = process.env.PORT ?? 3000;

  console.log(port);

  await app.listen(port);
}
bootstrap();
