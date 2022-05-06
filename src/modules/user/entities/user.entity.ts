import { Entity, Column, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../base/base.entity';

@Entity({
  name: 'users',
})
@Unique('user_email_unique_cons', ['email'])
export class User extends BaseEntity {
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
}
