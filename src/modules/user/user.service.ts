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
   * Find user by id.
   *
   * @param id
   */
  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  /**
   * Find user by email.
   *
   * @param email
   */
  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }

  /**
   * Update given user.
   *
   * @param User user
   */
  async saveUser(user) {
    await this.userRepository.save(user);
  }
}
