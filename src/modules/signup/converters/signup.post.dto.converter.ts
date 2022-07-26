import { instanceToPlain, plainToInstance } from 'class-transformer';
import { SignupPostSaveDto } from '../dto/signup/signup.post.save.dto';
import { User } from '../../user/entities/user.entity';
import { SignupPostResultDto } from '../dto/signup/signup.post.result.dto';
import { SignupPostValidatorDto } from '../dto/signup/signup.post.validator.dto';

/**
 * DTO and entities converted for `[POST] /signup`
 */
export class SignupPostDtoConverter {
  /**
   * Convert validated data to save data.
   *
   * @param {SignupPostSaveDto} validatorDto - Validator DTO.
   */
  static validatorToSave(
    validatorDto: SignupPostValidatorDto,
  ): SignupPostSaveDto {
    const plain = instanceToPlain(validatorDto);
    plain.emailOriginal = validatorDto.email;
    const saveDto = plainToInstance(SignupPostSaveDto, plain, {
      excludeExtraneousValues: true,
    });
    return saveDto;
  }

  /**
   * Convert user to final result to return.
   *
   * @param {User} user - User entity object.
   * @return {SignupPostResultDto} - Result DTO.
   */
  static userToResult(user: User): SignupPostResultDto {
    const plain = instanceToPlain(user);
    const resultDto = plainToInstance(SignupPostResultDto, plain, {
      excludeExtraneousValues: true,
    });
    return resultDto;
  }
}
