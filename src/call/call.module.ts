import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallController } from './call.controller';
import { CallService } from './call.service';
import { Call } from './entities/call.entity';

@Module({
  controllers: [CallController],
  providers: [CallService],
  imports: [TypeOrmModule.forFeature([Call])],
})
export class CallModule {}
