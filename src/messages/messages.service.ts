import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/redis.service';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    private readonly redisService: RedisService, // Assuming RedisService is already defined and imported
  ) {}
  async create(
    createMessageDto: CreateMessageDto,
    senderId: string,
  ): Promise<Message> {
    const message = this.messageRepo.create({
      ...createMessageDto,
      sender: { id: senderId },
      receiver: { id: createMessageDto.receiverId },
    });

    await this.redisService.publish('chat', {
      senderId,
      receiverId: createMessageDto.receiverId,
      content: createMessageDto.content,
    });
    return this.messageRepo.save(message);
  }

  async lastUserMessages(currentUserId: string): Promise<Message[]> {
    // Lấy tin nhắn cuối cùng từ mỗi user đã nhắn tin với user hiện tại
    const subQuery = this.messageRepo
      .createQueryBuilder('sub_message')
      .select('MAX(sub_message.createdAt)', 'maxCreatedAt')
      .addSelect('sub_message.senderId', 'senderId')
      .where('sub_message.receiverId = :currentUserId', { currentUserId })
      .groupBy('sub_message.senderId');

    return this.messageRepo
      .createQueryBuilder('message')
      .innerJoin(
        `(${subQuery.getQuery()})`,
        'latest',
        'message.senderId = latest.senderId AND message.createdAt = latest.maxCreatedAt',
      )
      .where('message.receiverId = :currentUserId', { currentUserId })
      .setParameters(subQuery.getParameters())
      .select([
        'message.id',
        'message.content',
        'message.createdAt',
        'message.senderId',
        'message.receiverId',
      ])
      .leftJoin('message.sender', 'sender')
      .addSelect(['sender.id', 'sender.username'])
      .leftJoin('message.receiver', 'receiver')
      .addSelect(['receiver.id', 'receiver.username'])
      .orderBy('message.createdAt', 'DESC')
      .getMany();
  }

  findAll() {
    return this.messageRepo.find();
  }

  findOne(id: string) {
    return this.messageRepo.findOneBy({ id });
  }

  update(id: string, updateMessageDto: UpdateMessageDto) {
    return this.messageRepo.update(id, updateMessageDto);
  }

  remove(id: string) {
    return this.messageRepo.delete(id);
  }

  async getMessages(senderId: string, receiverId: string) {
    return this.messageRepo.find({
      where: [
        {
          sender: { id: senderId },
          receiver: { id: receiverId },
        },
      ],
      order: { createdAt: 'ASC' },
    });
  }
}
