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
