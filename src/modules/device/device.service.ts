import { Injectable } from '@nestjs/common';
import { DeviceCreateValidatorDto } from './dto/device.create.validator.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './entities/device.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { DeviceCreateResultDto } from './dto/device.create.result.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    public readonly deviceRepository: Repository<Device>,
  ) {}

  async create(
    createDeviceDto: DeviceCreateValidatorDto,
    requestUser,
  ): Promise<[Device, string]> {
    const rndPass = crypto.randomBytes(20).toString('hex');
    const device = this.prepareDeviceCreate(createDeviceDto);
    device.mqttPassword = bcrypt.hashSync(rndPass, 12);
    device.user = requestUser.id;

    await this.save(device);

    return [device, rndPass];
  }

  findAll() {
    return `This action returns all device`;
  }

  findOne(id: number) {
    return `This action returns a #${id} device`;
  }

  update(id: number, updateDeviceDto: UpdateDeviceDto) {
    return `This action updates a #${id} device`;
  }

  remove(id: number) {
    return `This action removes a #${id} device`;
  }

  /**
   * Prepare result for response.
   *
   * @param deviceCreateSaveResult
   */
  createResult(device: Device, password: string): DeviceCreateResultDto {
    const createDevicePlain = instanceToPlain(device);
    const result = plainToInstance(DeviceCreateResultDto, createDevicePlain, {
      excludeExtraneousValues: true,
    });
    result.password = password;
    return result;
  }

  /**
   * Prpare device entity object form incoming DTO.
   *
   * @param createDeviceDto
   */
  prepareDeviceCreate(createDeviceDto: DeviceCreateValidatorDto): Device {
    const createDevicePlain = instanceToPlain(createDeviceDto);
    const device = plainToInstance(Device, createDevicePlain);
    return device;
  }

  /**
   * Save device via repository.
   *
   * @param Device device
   */
  async save(device: Device): Promise<Device> {
    const result = await this.deviceRepository.save(device);
    return result;
  }
}
