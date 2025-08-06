import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/redis.service';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CallActionDto } from './dto/call-action.dto';
import { CreateCallDto } from './dto/create-call.dto';
import { Call, CallStatus } from './entities/call.entity';
@Injectable()
export class CallService {
  constructor(
    @InjectRepository(Call)
    private readonly callRepository: Repository<Call>,
    private readonly redisService: RedisService,
  ) {}
  async makeCall(createCallDto: CreateCallDto, callerId: string) {
    const roomId = uuidv4();

    // Check if caller is trying to call themselves
    if (callerId === createCallDto.receiverId) {
      throw new BadRequestException('Cannot call yourself');
    }

    const call = this.callRepository.create({
      caller: { id: callerId },
      receiver: { id: createCallDto.receiverId },
      roomId,
      status: CallStatus.RINGING,
    });

    const savedCall = await this.callRepository.save(call);

    const fullCall = await this.callRepository.findOne({
      where: { id: savedCall.id },
      relations: ['caller', 'receiver'],
    });

    // Notify receiver about incoming call
    await this.redisService.publish('call', {
      type: 'incoming_call',
      call: fullCall,
    });

    return fullCall;
  }

  async acceptCall(callId: string, receiverId: string): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { id: callId, receiver: { id: receiverId } },
      relations: ['caller', 'receiver'],
    });

    if (!call) {
      throw new BadRequestException('Call not found or unauthorized');
    }

    if (call.status !== CallStatus.RINGING) {
      throw new BadRequestException('Call is not in ringing state');
    }

    call.status = CallStatus.ACCEPTED;
    const updatedCall = await this.callRepository.save(call);

    // Notify caller that call was accepted
    await this.redisService.publish('call', {
      type: 'call_accepted',
      call: updatedCall,
    });

    return updatedCall;
  }

  async rejectCall(callId: string, receiverId: string): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { id: callId, receiver: { id: receiverId } },
      relations: ['caller', 'receiver'],
    });

    if (!call) {
      throw new BadRequestException('Call not found or unauthorized');
    }

    if (call.status !== CallStatus.RINGING) {
      throw new BadRequestException('Call is not in ringing state');
    }

    call.status = CallStatus.REJECTED;
    call.endedAt = new Date();
    const updatedCall = await this.callRepository.save(call);

    // Notify caller that call was rejected
    await this.redisService.publish('call', {
      type: 'call_rejected',
      call: updatedCall,
    });

    return updatedCall;
  }

  async endCall(
    callId: string,
    userId: string,
    callActionDto?: CallActionDto,
  ): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: {
        id: callId,
      },
      relations: ['caller', 'receiver'],
    });

    if (!call) {
      throw new BadRequestException('Call not found');
    }

    // Check if user is either caller or receiver
    if (call.caller.id !== userId && call.receiver.id !== userId) {
      throw new BadRequestException('Unauthorized to end this call');
    }

    call.status = CallStatus.ENDED;
    call.endedAt = new Date();

    if (callActionDto?.duration) {
      call.duration = callActionDto.duration;
    }

    const updatedCall = await this.callRepository.save(call);

    // Notify both participants that call ended
    await this.redisService.publish('call', {
      type: 'call_ended',
      call: updatedCall,
    });

    return updatedCall;
  }

  async getCallHistory(userId: string): Promise<Call[]> {
    return this.callRepository.find({
      where: [{ caller: { id: userId } }, { receiver: { id: userId } }],
      relations: ['caller', 'receiver'],
      order: { createdAt: 'DESC' },
    });
  }
}
