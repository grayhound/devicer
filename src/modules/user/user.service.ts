import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) public readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find user by email.
   *
   * @param email
   */
  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }
}
