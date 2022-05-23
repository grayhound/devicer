import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource, DataSourceOptions } from 'typeorm';

import postgresConfig from './postgresql.config';

const postgresDSO: DataSourceOptions = <DataSourceOptions>postgresConfig;

const AppDataSource = new DataSource(postgresDSO);

export default AppDataSource;
