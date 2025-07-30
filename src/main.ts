import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: appConfig.cors.origin,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  await app.listen(appConfig.port);
  console.log(
    `🚀 Application is running on: http://localhost:${appConfig.port}/api`,
  );
}
bootstrap();
