import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { buildSelect } from 'src/helper';
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
}
