import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  UnprocessableEntityException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { TrimStringsPipe } from './base/transformer/trim-strings.pipe';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new TrimStringsPipe(),
    new ValidationPipe({
      stopAtFirstError: false,
      validationError: {
        target: false,
      },
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });

  await app.listen(configService.get('api').port);
}

bootstrap();
