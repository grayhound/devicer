import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { SignupModule } from './modules/signup/signup.module';
import { loadAppConfig } from './config/loadAppConfig';
import { AuthModule } from './modules/auth/auth.module';

const config = loadAppConfig(process.env.NODE_ENV);

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
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
