import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ProfileChangePasswordValidatorDto } from '../dto/profileChangePassword.validator.dto';
import { ProfileChangePasswordSaveDto } from '../dto/profileChangePassword.save.dto';
import { Injectable } from '@nestjs/common';

/**
 * DTO and entities converted for `[POST] /profile/changePassword`
 */
@Injectable()
export class ProfileChangePasswordDtoConverter {
  /**
   * Convert validated data to save data.
   *
   * @param {ProfileChangePasswordValidatorDto} validatorDto - Validator DTO.
   */
  validatorToSave(
    validatorDto: ProfileChangePasswordValidatorDto,
  ): ProfileChangePasswordSaveDto {
    const plain = instanceToPlain(validatorDto);
    plain.password = validatorDto.newPassword;
    const saveDto = plainToInstance(ProfileChangePasswordSaveDto, plain, {
      excludeExtraneousValues: true,
    });
    return saveDto;
  }
}
