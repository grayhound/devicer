# Devices

Create `Device` module:

`nest g res modules/device`

But before that...

> Do you remember that we had problem naming Primary Key constraint? That was like that with typeorm 0.3.6
>
> Well, that problem is solved with typeorm 0.3.7! And it's really interesting how it will work out.

Update typeorm package with command:

`npm update typeorm`.

With update 0.3.7 we can now name Primary Keys and Foreign Keys!

But we will have to specify `id` param for each Entity. But I don't think that should be a problem.

Ok, lets remove `id` from `BaseEntity`:

`src/base/base.entity.ts`:

```typescript
import {  
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createDateTime: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updateDateTime: Date;
}
```

Create `Device` entity at `src/modules/device/entities/device.entity.ts`:

```typescript
import {
  Entity,
  Column,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../base/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity({
  name: 'devices',
})
export class Device extends BaseEntity {
  @PrimaryGeneratedColumn('uuid',{
    primaryKeyConstraintName: 'pk_device_id',
  })
  id: string;

  @Column({
    length: 255,
  })
  @Index('device_name_idx')
  name: string;

  @ManyToOne(() => User, (user) => user.devices)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_user_id',
  })
  user: User;

  @Column({
    length: 255,
  })
  mqttPassword: string;
}
```

Entity is quite easy. We extend `BaseEntity`, like it was for `User`.

We will allow user to set name for a device.

We have `user` that created and uses device and `mqttPassword` that will be generated automatically for device.

We should also update `User` entity at `src/modules/user/entities/user.entity.ts`:

```typescript
import { Entity, Column, Index, Unique, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../base/base.entity';
import { Device } from '../../device/entities/device.entity';

@Entity({
  name: 'users',
})
@Unique('user_email_unique_cons', ['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { 
    primaryKeyConstraintName: 'pk_user_id' 
  })
  id: string;

  ...

  @OneToMany(() => Device, (device) => device.user)
  devices: Device[];
}
```

Entities are ready. Will typeorm make migrations correctly?

Run command to generate new migrations:

`npx typeorm-ts-node-commonjs migration:generate src/migrations/DeviceInitAndKeyNames -d src/config/envs/dev/typeorm.datasource.ts`

Unfortunately we didn't get everything. 

We have Primary Key and Foreign Key for `devices` table, but Primary Key name for `users` table won't change.

Well, we have migration, why can't we edit it?

Take a look at `src/migrations/*-DeviceInitAndKeyNames.ts`.

And now we are going to make it look like this:

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class DeviceInitAndKeyNames1657713838072 implements MigrationInterface {
    name = 'DeviceInitAndKeyNames1657713838072'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "devices" ("createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "mqttPassword" character varying(255) NOT NULL, "user_id" uuid, CONSTRAINT "pk_device_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "device_name_idx" ON "devices" ("name") `);
        await queryRunner.query(`ALTER TABLE "devices" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" TO "pk_user_id";`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "fk_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."device_name_idx"`);
        await queryRunner.query(`DROP TABLE "devices"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "pk_user_id" TO "PK_a3ffb1c0c8416b9fc6f907b7433";`)
    }
}
```

Yep, we are renaming this contstraint.

Now run new migration file:

`npx typeorm-ts-node-commonjs migration:run -d src/config/envs/dev/typeorm.datasource.ts`

Success!

We can also check migration:revert

`npx typeorm-ts-node-commonjs migration:revert -d src/config/envs/dev/typeorm.datasource.ts`

Yep, that works to. `devices` is deleted and Primaery Key Constraint is renamed back.

Now migrate again, we were just testing that `revert` works correctly too.

`npx typeorm-ts-node-commonjs migration:run -d src/config/envs/dev/typeorm.datasource.ts`

> This is interesting practice. `migration:generate` won't cover 100% of all possible cases.
>
> In case like this one constraint rename is not generated. So we just updated our migration to make that happen.

## Onto the controller!

We have main structure for `DeviceController` generated by `NestJS`. Let's use it!

We are going to make some changes.

First we going to change `create` method.

Actually, all we need to check that user is authenticated and that user inputed new device name.

Rename `create-device.dto.ts` to `device.create.validator.dto.ts` and edit:

```typescript
import { IsNotEmpty } from 'class-validator';

export class DeviceCreateValidatorDto {
  @IsNotEmpty()
  name: string;
}
```

Don't forget to update `DeviceModule`! The main thing here is importing `Device` to work with database.

```typescript
import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
```

And now changes for the `create` method at `DeviceController`:

```typescript
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

  ...
}
```

We will return array of saved `Device` and generated `password` for that device.

And then will return data we need via `createResult` method.

DTO for the result to show to the user at `src/modules/device/dto/device.create.result.dto.ts`:

```typescript
import { Expose } from 'class-transformer';

export class DeviceCreateResultDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  password: string;
}
```

We will show `id`, `name` and generated `password` for the device.

Now to the `DeviceService`:

```typescript
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

  ...

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
```

The main thing is `create` method. Here we generate random password, set user and save new device.

`createResult` will return result modified with DTO.

Password generated will be exposed ONCE. `Device` entity saved will have password hashed.

## Get device
