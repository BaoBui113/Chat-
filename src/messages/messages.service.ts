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
        {
          sender: { id: receiverId },
          receiver: { id: senderId },
        },
      ],
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        sender: {
          id: true,
          username: true,
          email: true,
        },
        receiver: {
          id: true,
          username: true,
          email: true,
        },
      },
      relations: {
        sender: true,
        receiver: true,
      },
      order: { createdAt: 'ASC' },
    });
  }
}
