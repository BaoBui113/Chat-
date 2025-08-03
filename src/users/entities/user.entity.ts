import { BaseEntity } from 'src/entities/base.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Message, (message) => message.sender)
  senderMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receiverMessages: Message[];
}
