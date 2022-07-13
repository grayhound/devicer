import { PartialType } from '@nestjs/mapped-types';
import { DeviceCreateValidatorDto } from './device.create.validator.dto';

export class UpdateDeviceDto extends PartialType(DeviceCreateValidatorDto) {}
