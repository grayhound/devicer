import { instanceToPlain, plainToInstance } from 'class-transformer';
import { DeviceCreateValidatorDto } from '../dto/device.create.validator.dto';
import { DeviceCreateSaveDto } from '../dto/device.create.save.dto';
import { Device } from '../entities/device.entity';
import {
  DeviceCreateResultDto,
  DeviceResultDataDto,
} from '../dto/device.create.result.dto';

/**
 * DTO and entities converted for `[POST] /device`
 */
export class DeviceCreateDtoConverter {
  /**
   * Convert validated data to save data.
   *
   * @param {SignupPostSaveDto} validatorDto - Validator DTO.
   */
  static validatorToSave(
    validatorDto: DeviceCreateValidatorDto,
    mqttPassword: string,
    userId: string,
  ): DeviceCreateSaveDto {
    const plain = instanceToPlain(validatorDto);
    plain.mqttPassword = mqttPassword;
    plain.userId = userId;
    const saveDto = plainToInstance(DeviceCreateSaveDto, plain, {
      excludeExtraneousValues: true,
    });
    return saveDto;
  }

  /**
   * Convert device to final result to return.
   *
   * @param {Device} device - Device entity object.
   * @return {SignupPostResultDto} - Result DTO.
   */
  static deviceToResult(
    device: Device,
    password: string,
  ): DeviceCreateResultDto {
    const data = instanceToPlain(device);
    data.password = password;
    const dataDto = plainToInstance(DeviceResultDataDto, data, {
      excludeExtraneousValues: true,
    });
    const result = new DeviceCreateResultDto();
    result.data = dataDto;
    return result;
  }
}
