import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DeviceCreateValidatorDto } from './dto/device.create.validator.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './entities/device.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { DeviceCreateResultDto } from './dto/device.create.result.dto';
import { User } from '../user/entities/user.entity';
import { DeviceCreateDtoConverter } from './converter/device.create.dto.converter';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    public readonly deviceRepository: Repository<Device>,
  ) {}

  async create(
    validatorDto: DeviceCreateValidatorDto,
    requestUser,
  ): Promise<[Device, string]> {
    const rndPass = crypto.randomBytes(20).toString('hex');

    const saveDto = DeviceCreateDtoConverter.validatorToSave(
      validatorDto,
      rndPass,
      requestUser.id,
    );
    const device = this.deviceRepository.create(saveDto);
    await this.deviceRepository.insert(device);

    return [device, rndPass];
  }

  findAll() {
    return `This action returns all device`;
  }

  findOne(id: string) {
    return `This action returns a #${id} device`;
  }

  update(id: number, updateDeviceDto: UpdateDeviceDto) {
    return `This action updates a #${id} device`;
  }

  /**
   * Remove device.
   *
   * @param string id - Device ID.
   * @param User user - User from request.
   */
  async remove(id: string, user: User) {
    const device = await this.findById(id, user);
    if (!device) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }
    device.isDeleted = true;
    await this.deviceRepository.update({ id: device.id }, device);
  }

  /**
   * Find device by ID.
   *
   * @param string id - Device ID.
   * @param Object user - user from request.
   * @param boolean findDeleted - should it find deleted devices?
   */
  async findById(id: string, user, findDeleted = false): Promise<Device> {
    const request = {
      where: {
        id,
        userId: user.id,
        isDeleted: false,
      },
    };
    if (findDeleted) {
      request.where.isDeleted = true;
    }
    const device = await this.deviceRepository.findOne(request);
    return device;
  }

  /**
   * Prepare result for response.
   *
   * @param deviceCreateSaveResult
   */
  createResult(device: Device, password: string): DeviceCreateResultDto {
    const result = DeviceCreateDtoConverter.deviceToResult(device, password);
    return result;
  }

  /**
   * Send success message about "deleted" device.
   */
  deleteResult() {
    return {
      message: 'Device is now deleted',
    };
  }
}
