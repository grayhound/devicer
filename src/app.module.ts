import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { SignupModule } from './modules/signup/signup.module';
import { loadAppConfig } from './config/loadAppConfig';

// detect if this is test environment
const appConfigType = process.env.TEST_ENV === '1' ? 'test' : 'main';
// load config for `test` or `main`
const config = loadAppConfig(appConfigType);

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => config.get('postgres'),
      inject: [ConfigService],
    }),
    UserModule,
    SignupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
