# 1. Prepare our dev environment

You need to have NodeJS with npm and Docker installed.  

## Install NestJS and create new project.

Now we need to install NestJS globally:

```npm i -g @nestjs/cli```

Create a project itself:

```nest new devicer``` 

This will create `devicer` directory with NestJS project inside it.

Now you can run development server:

```npm run start:dev```

You can open application inside your browser - [http://localhost:3000/](http://localhost:3000/). You will get to the "Hello world" page.

NestJS in this mode will reload on any code changes.

I highly recommend to use Postman to test REST API and its endpoints from now on.

## PostgreSQL at docker

In development phase we won't user docker for applications/micro-services.

But how about we prepare PostgreSQL instance running at docker?

First, create directory `docker/envs/devicer-dev`. Here we will store our docker files.

Now, create `docker/envs/devicer-dev.env` file. Docker-composer will catch variables from this file.

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

You can take `.env.example` as... an example. 

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
    image: postgres:14.3
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

## Configuration file

NestJS is ready, but it's not connected to the database yet. Let's do it!

First, let's do some good code practice and create configuration files and use it in application.

In order to use configuration, we should install new packages:

```npm i --save @nestjs/config```
```npm i --save dotenv```

We will split our configuration in few files for different environments:

First, we will create config for PostgreSQL. Create file `src/config/envs/dev/postgresql.config.ts`:

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

  entities: ['dist/modules/**/*.entity{.ts,.js}'],

  migrationsTableName: 'migrations',

  migrations: ['dist/migrations/*{.ts,.js}'],
};

export default config;
```

Now, create `src/config/envs/dev/config.main.ts` file.

```typescript
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });

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

You can set configuration via environment variables or `.env.dev` file. 

That `.env.dev` file will be loaded via dotenv.

Here's an example of `.env.dev` file. You should place it in root directory of your project.

```
DEVICER_API_PORT=3000

DEVICER_POSTGRES_HOST=localhost
DEVICER_POSTGRES_PORT=5432
DEVICER_POSTGRES_USER=devicer
DEVICER_POSTGRES_PASSWORD=devicer
DEVICER_POSTGRES_DB=devicer
```

Now we need a way to load different configuration files for different envs.

Create `src/config/loadAppConfig.ts`

```typescript
export function loadAppConfig(env = 'main') {
  let config;
  switch (env) {
    case 'dev':
      config = require('./envs/dev/app.config');
      break;
    default:
      config = require('./envs/dev/app.config');
  }

  return config.default;
}
```

It will load only `dev` environment for now, but we will more later on in the tutorial.

Edit `src/app.module.ts` to load configuration we need.
 

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { loadAppConfig } from './config/loadAppConfig';

const config = loadAppConfig(process.env.NODE_ENV);

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

This helps to use config parameters from `app.config.ts`

And the last thing. Install `cross-env` via command:

`npm i cross-env --save-dev`

Edit `package.json`. Find:

`"start:dev": "nest start --watch",`

and change it with:
 
`"start:dev": "cross-env NODE_ENV=dev nest start --watch",`

`cross-env` helps us to pass environment variables to the executable at any operating system.

In this case with send `NODE_ENV=dev` and application will user `.env.dev` file and `src/config/envs/dev/*`

Start NestJS server again with `npm run start:dev`.

If everything is right, you should see log in the console from PostgreSQL:

```
query: SELECT * FROM current_schema()
query: SHOW server_version; 
```

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
