import { BaseEntity } from 'src/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('messages')
export class Message extends BaseEntity {
  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.senderMessages)
  sender: User;

  @ManyToOne(() => User, (user) => user.receiverMessages)
  receiver: User;
}
