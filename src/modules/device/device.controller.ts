import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceCreateValidatorDto } from './dto/device.create.validator.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { AuthGuard } from '@nestjs/passport';
import { DeviceCreateResultDto } from './dto/device.create.result.dto';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Body() createDeviceDto: DeviceCreateValidatorDto,
    @Request() req,
  ): Promise<DeviceCreateResultDto> {
    const [device, password] = await this.deviceService.create(
      createDeviceDto,
      req.user,
    );
    const result = this.deviceService.createResult(device, password);
    return result;
  }

  @Get()
  findAll() {
    return this.deviceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deviceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.deviceService.update(+id, updateDeviceDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.deviceService.remove(id, req.user);
    return this.deviceService.deleteResult();
  }
}
