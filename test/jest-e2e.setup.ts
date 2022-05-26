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
import 'jest-extended';
import * as matchers from 'jest-extended/all';
expect.extend(matchers);

dotenv.config();

/**
 * Setup test application
 */
async function setupTestApplication(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();

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

  await app.listen(configService.get('api').port);
  await app.init();

  return app;
}

/**
 * Setup globals to use in tests.
 */
beforeAll(async () => {
  global.app = await setupTestApplication(); // application itself
  global.prefix = '/v1'; // REST api endpoints urls prefix
});

/**
 * Close application after all tests.
 */
afterAll(async () => {
  await global.app.close();
});
