import {
  Entity,
  Column,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../base/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity({
  name: 'devices',
})
export class Device extends BaseEntity {
  @PrimaryGeneratedColumn('uuid',{
    primaryKeyConstraintName: 'pk_device_id',
  })
  id: string;

  @Column({
    length: 255,
  })
  @Index('device_name_idx')
  name: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.devices)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_user_id',
  })
  user: User;

  @Column({
    length: 255,
  })
  mqttPassword: string;

  @Column('boolean', { default: false })
  isDeleted: boolean = false;
}
