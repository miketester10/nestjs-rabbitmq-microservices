import { DataSource, DataSourceOptions } from 'typeorm';
import { env, isDevelopment } from 'src/config/env.schema';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/migrations/*.js'],
  synchronize: isDevelopment,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
