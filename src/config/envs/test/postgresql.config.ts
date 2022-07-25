import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const config = {
  type: 'postgres',

  host: process.env.DEVICER_POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.DEVICER_POSTGRES_PORT, 10) || 5432,

  username: process.env.DEVICER_POSTGRES_USER || 'postgres',
  password: process.env.DEVICER_POSTGRES_PASSWORD || '',
  database: process.env.DEVICER_POSTGRES_DB || '',

  synchronize: false,
  dropSchema: true,
  logging: false,
  migrationsRun: true,

  entities: ['src/modules/**/*.entity.ts'],

  migrationsTableName: 'migrations',

  migrations: ['src/migrations/*.ts'],

  namingStrategy: new SnakeNamingStrategy(),
};

export default config;
