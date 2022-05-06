# 1. Prepare our dev environment

You need to have NodeJS with npm and Docker installed. 

Create directory for the project - `devicer`

In development phase NodeJS applications/micro-services don't need docker to run (at first). 

## PostgreSQL at docker

But how about we prepare PostgreSQL instance running at docker?

First, create directory `docker/envs/devicer-dev`. Here we will store our docker files.

Now, create `.env` file. Docker-composer will catch variabled from this file.

Contents of `.env` file.
```
DEVICER_API_PORT=3000

DEVICER_POSTGRES_HOST="devicer_postgres"
DEVICER_POSTGRES_USER="devicer"
DEVICER_POSTGRES_DB="devicer"
DEVICER_POSTGRES_PASSWORD="devicer"
DEVICER_POSTGRES_PORT="5432"
DEVICER_POSTGRES_PGDATA="/data/postgres"
```

Meanings of variables:

- DEVICER_API_PORT - port for REST API micro-service
- DEVICER_POSTGRES_HOST - PostgreSQL host. This is a hostname inside docker
- DEVICER_POSTGRES_USER - PostgreSQL username
- DEVICER_POSTGRES_DB - PostgreSQL database name
- DEVICER_POSTGRES_PASSWORD - PostgreSQL password
- DEVICER_POSTGRES_PORT - PostgresQL port
- DEVICER_POSTGRES_PGDATA - directory inside docker container where PostgreSQL data will be stored.

We need `docker-compose.yml` file now.

```
services:
  devicer_postgres:
    container_name: devicer_postgres
    image: postgres:12.2
    hostname: "${DEVICER_POSTGRES_HOST}"
    environment:
      POSTGRES_USER: ${DEVICER_POSTGRES_USER}
      POSTGRES_PASSWORD: ${DEVICER_POSTGRES_PASSWORD}
      POSTGRES_DB: ${DEVICER_POSTGRES_DB}
      PGDATA: ${DEVICER_POSTGRES_PGDATA}
    volumes:
      - devicer_postgres:${DEVICER_POSTGRES_PGDATA}
    expose:
      - ${DEVICER_POSTGRES_PORT}
    ports:
      - "${DEVICER_POSTGRES_PORT}:${DEVICER_POSTGRES_PORT}"
    networks:
      - devicer_network
    restart: "no"

networks:
  devicer_network:

volumes:
  devicer_postgres:

```

Now you need to run

```docker-compose up -d```

This will download PostgreSQL image, create container from it with according network and volume.

You can also check connection to PostgreSQL using [pgAdmin](https://www.pgadmin.org/)

## Install NestJS and create new project.

Now we need to install NestJS globally:

```npm i -g @nestjs/cli```

Go back to the directory upper `devicer` directory and run:

```nest new devicer``` 

This will create NestJS project inside out `devicer` directory.

Now you can run development server:

```npm run start:dev```

And now you can open application inside your browser - [http://localhost:3000/](http://localhost:3000/). You will get to the "Hello world" page.

NestJS in this mode will reload code on any changes.

I highly recommend to use Postman to test REST API and its endpoints from now on.

## Configuration file

NestJS is ready, but it's not connected to the database yet. Let's do it.

First, let's do some good code practice and create configuration files and use it in application.

In order to use configuration, we should install new packages:

```npm i --save @nestjs/config```
```npm i --save dotenv```

We will split our configuration in few files.

First, we will create config for PostgreSQL. Create file `src/config/postgresql.config.ts`:

```typescript
const config = {
  type: 'postgres',

  host: process.env.DEVICER_POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.DEVICER_POSTGRES_PORT, 10) || 5432,

  username: process.env.DEVICER_POSTGRES_USER || 'postgres',
  password: process.env.DEVICER_POSTGRES_PASSWORD || '',
  database: process.env.DEVICER_POSTGRES_DB || '',

  synchronize: false,
  logging: true,

  entities: ['dist/**/modules/**/*.entity{.ts,.js}'],

  migrationsTableName: 'migrations',

  migrations: ['dist/src/migrations/*{.ts,.js}'],
};

export default config;
```

Now, create `src/config/config.main.ts` file.

```typescript
import * as dotenv from 'dotenv';
dotenv.config();

import postgresConfig from './postgresql.config';

/**
 * Getting configuration data.
 */
export default () => ({
  // api settings
  api: {
    port: parseInt(process.env.DEVICER_API_PORT, 10) || 3000,
  },

  // postgress database setting
  postgres: postgresConfig,
});
```

This config file returns config settings divided into `api` and `postgres` sections.

You can set configuration via environment variables or `.env` file. 

That `.env` file will be loaded automatically.

Here's an example of `.env` file. You should place it in root directory of your project.

```
DEVICER_API_PORT=3000

DEVICER_POSTGRES_HOST=localhost
DEVICER_POSTGRES_PORT=5432
DEVICER_POSTGRES_USER=devicer
DEVICER_POSTGRES_PASSWORD=devicer
DEVICER_POSTGRES_DB=devicer
```

Edit `src/app.module.ts`.

Here, you import ConfigModule and `config/app.config.ts`.

Then you load config in the `imports` section. 

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import config from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

Now let's edit `src/main.ts`. This will help load ConfigService and use config params inside `bootstrap()` function. 

In this case we get `api` object and port

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);  
  await app.listen(configService.get('api').port);
}
bootstrap();
```

By doing this we will connect ConfigService to use `port` from configuration.

Now, let's connect to PostgreSQL.

Install packages for TypeORM and PostgreSQL support.

```npm install --save @nestjs/typeorm typeorm pg```

Now edit `src/app.module.ts` again. This time we will import and connect TypeORM to work with postgresql:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/app.config';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

We are using `TypeOrmModule.forRootAsync`. This helps us to import `ConfigModule` and inject `ConfigService`.

This helps to use config parameters form `config/app.config.ts`

NestJS server should restart automatically. Inside console you should now see:

```
query: SELECT * FROM current_schema()
query: SHOW server_version; 
```

If everything is correct there should be no errors.

## Versioning.

Before we continue, let's activate versioning of our API.

It's always good to prepare REST API versioning. Endpoints will look like `/v1/somenedpoint`, not just `/someendpoint`.

To update `main.ts` to look like this:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });
  await app.listen(configService.get('api').port);
}

bootstrap();

``` 
