import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { databaseConfig } from './database/database.config';
import { DebugModule } from './debug/debug.module';
import { ChatGateway } from './messages/chat.gateway';
import { MessagesModule } from './messages/messages.module';
import { RedisModule } from './redis.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { CallModule } from './call/call.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig),
    UsersModule,
    DebugModule,
    AuthModule,
    UploadModule,
    RedisModule,
    MessagesModule,
    CallModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
