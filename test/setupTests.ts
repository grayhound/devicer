import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import {
  INestApplication,
  UnprocessableEntityException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'class-validator';
import { TrimStringsPipe } from '../src/base/transformer/trim-strings.pipe';

dotenv.config();

process.env.TEST_ENV = '1';

let app: INestApplication;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();

  const configService = app.get(ConfigService);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new TrimStringsPipe(),
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
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

  console.log(configService);

  await app.listen(configService.get('api').port);
  await app.init();
});

afterAll(async () => {
  await app.close();
});

export function getServerApp() {
  return app;
}
