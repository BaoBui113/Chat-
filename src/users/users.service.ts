import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { buildSelect } from 'src/helper';
import { Message } from 'src/messages/entities/message.entity';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    const unSelect: (keyof User)[] = ['password', 'createdAt', 'updatedAt'];
    return this.userRepository.find({
      select: buildSelect<User>(this.userRepository.metadata, unSelect),
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User | null> {
    const unSelect: (keyof User)[] = ['password', 'createdAt', 'updatedAt'];
    return this.userRepository.findOne({
      where: { id },
      select: buildSelect<User>(this.userRepository.metadata, unSelect),
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async getUsersWithLastMessage(loggedInUserId: string) {
    return this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndMapOne(
        'u.lastMessage', // gắn vào thuộc tính ảo lastMessage
        Message,
        'm',
        `m.id = (
        SELECT m2.id
        FROM messages m2
        WHERE 
          ((m2."senderId" = u.id AND m2."receiverId" = :loggedInUserId)
          OR (m2."senderId" = :loggedInUserId AND m2."receiverId" = u.id))
        ORDER BY m2."createdAt" DESC
        LIMIT 1
      )`,
        { loggedInUserId },
      )
      .leftJoinAndSelect('m.sender', 'sender')
      .leftJoinAndSelect('m.receiver', 'receiver')
      .where('u.id != :loggedInUserId', { loggedInUserId })
      .getMany();
  }
}
