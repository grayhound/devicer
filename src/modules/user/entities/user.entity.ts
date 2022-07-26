import {
  Entity,
  Column,
  Index,
  Unique,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../base/base.entity';
import { Device } from '../../device/entities/device.entity';

@Entity({
  name: 'users',
})
@Unique('user_email_unique_cons', ['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_user_id',
  })
  id: string;

  @Column({
    length: 255,
  })
  @Index('user_email_idx')
  email: string;

  @Column({
    name: 'password',
    length: 255,
  })
  password: string;

  @Column({
    length: 255,
  })
  emailOriginal: string;

  @OneToMany(() => Device, (device) => device.user)
  devices: Device[];
}
