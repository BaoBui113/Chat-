import { BaseEntity } from 'src/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

export enum CallStatus {
  RINGING = 'ringing',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  ENDED = 'ended',
}

@Entity('calls')
export class Call extends BaseEntity {
  @Column({
    type: 'enum',
    enum: CallStatus,
    default: CallStatus.RINGING,
  })
  status: CallStatus;

  @Column({ nullable: true })
  duration: number; // Duration in seconds

  @Column({ nullable: true })
  endedAt: Date;

  @ManyToOne(() => User, (user) => user.callerCalls)
  caller: User;

  @ManyToOne(() => User, (user) => user.receiverCalls)
  receiver: User;

  @Column()
  roomId: string; // WebRTC room identifier
}
