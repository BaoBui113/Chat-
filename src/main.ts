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
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  //   const server = app.getHttpServer();
  //   const io = new Server(server, {
  //     cors: { origin: '*' },
  //   });

  //   instrument(io, {
  //     auth: false, // hoặc { username: "admin", password: "admin" }
  //     mode: 'development',
  //   });

  await app.listen(appConfig.port);
  console.log(
    `🚀 Application is running on: http://localhost:${appConfig.port}/api`,
  );
  console.log(
    `🔌 Socket.IO Admin: https://admin.socket.io (connect to http://localhost:${appConfig.port})`,
  );
}
bootstrap();
